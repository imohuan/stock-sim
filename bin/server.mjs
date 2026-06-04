#!/usr/bin/env node
/**
 * stock-sim CLI — A股模拟交易应用 管理脚本
 *
 *   start         后台启动服务（自动关闭旧服务）
 *   stop          停止服务
 *   restart       重启服务（先停后启）
 *   kill          杀死所有 stock-sim 端口进程
 *   help          显示帮助（默认）
 *
 * 实际服务由 dist/server/index.js 提供（前后端一体）。
 */
import { Command } from 'commander'
import { spawn, exec } from 'node:child_process'
import { request } from 'node:http'
import { readFile, writeFile, unlink, access, mkdir } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { constants } from 'node:fs'
import { homedir } from 'node:os'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVER_SCRIPT = join(ROOT, 'dist', 'server', 'index.js')

// ---- 持久化目录（放用户目录，避免 npx 临时路径问题）----
const PID_DIR = join(homedir(), '.axtools', 'stock-sim')
const PID_FILE = join(PID_DIR, '.pid')
const PORTS_FILE = join(PID_DIR, '.ports')

async function ensurePidDir() {
  try {
    await mkdir(PID_DIR, { recursive: true })
  } catch { /* ignore */ }
}

// ---- 进程检查 ----
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

// ---- PID 文件操作 ----
async function readPidFile() {
  const raw = await readFile(PID_FILE, 'utf-8')
  return parseInt(raw.trim(), 10)
}

async function removePidFile() {
  try { await unlink(PID_FILE) } catch { /* 不存在忽略 */ }
}

async function writePid(pid) {
  await ensurePidDir()
  await writeFile(PID_FILE, String(pid))
}

// ---- 端口记录操作 ----
async function readPorts() {
  try {
    const raw = await readFile(PORTS_FILE, 'utf-8')
    return raw.split('\n').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0)
  } catch {
    return []
  }
}

async function writePorts(ports) {
  await ensurePidDir()
  const unique = [...new Set(ports)].sort((a, b) => a - b)
  await writeFile(PORTS_FILE, unique.join('\n'))
}

async function addPort(port) {
  const ports = await readPorts()
  if (!ports.includes(port)) {
    ports.push(port)
    await writePorts(ports)
  }
}

async function removePort(port) {
  const ports = await readPorts()
  const filtered = ports.filter(p => p !== port)
  if (filtered.length !== ports.length) {
    await writePorts(filtered)
  }
}

// ---- 停止指定 PID ----
async function killPid(pid) {
  if (!pid || !isProcessRunning(pid)) return false
  try {
    process.kill(pid, 'SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
    if (isProcessRunning(pid)) {
      process.kill(pid, 'SIGKILL')
    }
    return true
  } catch {
    return false
  }
}

// ---- 按端口查找 PID（跨平台） ----
async function findPidByPort(port) {
  const platform = process.platform
  try {
    if (platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      // 格式:  TCP    0.0.0.0:5180    0.0.0.0:0    LISTENING    12345
      const lines = stdout.split('\n').filter(l => l.trim())
      for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        const local = parts[1] || ''
        // 匹配端口（可能是 0.0.0.0:5180 或 [::]:5180）
        if (local.endsWith(`:${port}`)) {
          const pid = parseInt(parts[parts.length - 1], 10)
          if (pid && !isNaN(pid)) return pid
        }
      }
    } else {
      const { stdout } = await execAsync(`lsof -ti:${port}`)
      const pid = parseInt(stdout.trim(), 10)
      if (pid && !isNaN(pid)) return pid
    }
  } catch {
    // 未找到
  }
  return null
}

// ---- 按端口查找并杀死进程 ----
async function killPort(port) {
  try {
    // 先通过 /info 接口确认身份
    const info = await fetchInfo(port)
    if (info !== 'stock-sim') {
      return { port, killed: false, reason: '不是 stock-sim 服务' }
    }

    const pid = await findPidByPort(port)
    if (!pid) {
      return { port, killed: false, reason: '未找到占用进程' }
    }

    process.kill(pid, 'SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
    if (isProcessRunning(pid)) {
      process.kill(pid, 'SIGKILL')
    }
    await removePort(port)
    return { port, killed: true }
  } catch (err) {
    return { port, killed: false, reason: String(err.message || err) }
  }
}

// ---- 请求 /info 接口 ----
async function fetchInfo(port) {
  return new Promise((resolve) => {
    const req = request(
      { hostname: 'localhost', port, path: '/info', method: 'GET', timeout: 2000 },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => { resolve(data.trim()) })
      }
    )
    req.on('error', () => { resolve(null) })
    req.on('timeout', () => { req.destroy(); resolve(null) })
    req.end()
  })
}

// ---- tryStop：停止当前 PID 文件记录的服务 ----
async function tryStop() {
  let pid
  try {
    pid = await readPidFile()
  } catch {
    return false
  }

  if (!pid || !isProcessRunning(pid)) {
    await removePidFile()
    return false
  }

  const ok = await killPid(pid)
  await removePidFile()
  return ok
}

// ---- start 命令 ----
async function cmdStart(port) {
  // 先关闭旧服务（start 行为 = restart）
  const wasRunning = await tryStop()
  if (wasRunning) {
    console.log('  ✓ 已停止旧服务')
  }

  // 检查 server 脚本是否存在
  try {
    await access(SERVER_SCRIPT, constants.R_OK)
  } catch {
    console.log(`\n  ✗ 找不到服务脚本: ${SERVER_SCRIPT}`)
    console.log('  请先运行 npm run build:npm\n')
    process.exit(1)
  }

  // 记录端口
  await addPort(port)

  // 后台 spawn 服务进程
  const child = spawn('node', [SERVER_SCRIPT, String(port)], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })

  child.unref() // 不阻塞父进程

  await writePid(child.pid)

  const text = String(port)
  console.log(`
╔══════════════════════════════════════════════╗
║   A股模拟交易  ·  启动成功                   ║
║                                              ║
║   地址:     http://localhost:${text.padEnd(5)}             ║
║   PID:      ${String(child.pid).padEnd(5)}                         ║
║   PID 文件: ${PID_FILE}
║                                              ║
║   停止:     stock-sim stop                    ║
╚══════════════════════════════════════════════╝
`)

  // spawn 完成，进程退出（服务在后台运行）
}

// ---- stop 命令 ----
async function cmdStop() {
  const running = await tryStop()

  if (running) {
    console.log('\n  ✓ 服务已停止\n')
  } else {
    // 确认是否真的没在运行
    try {
      await readPidFile()
      console.log('\n  ✗ PID 文件存在但进程已不在运行，已清理\n')
    } catch {
      console.log('\n  ✗ 未找到运行中的服务（PID 文件不存在）\n')
    }
    process.exit(1)
  }
}

// ---- restart 命令 ----
async function cmdRestart(port) {
  const wasRunning = await tryStop()
  if (wasRunning) {
    console.log('  ✓ 已停止旧服务')
  }
  await cmdStart(port)
}

// ---- kill 命令 ----
async function cmdKill() {
  const ports = await readPorts()
  if (ports.length === 0) {
    console.log('\n  ✗ 没有记录任何端口\n')
    process.exit(1)
  }

  console.log(`\n  检测到 ${ports.length} 个记录端口: ${ports.join(', ')}`)
  console.log('  正在并发探测 /info 并终止 stock-sim 进程...\n')

  const results = await Promise.all(ports.map(p => killPort(p)))

  let killedCount = 0
  for (const r of results) {
    if (r.killed) {
      console.log(`  ✓ 端口 ${r.port} — 已终止`)
      killedCount++
    } else {
      console.log(`  ✗ 端口 ${r.port} — ${r.reason}`)
    }
  }

  // 清理 PID 文件（无论是否成功）
  await removePidFile()

  console.log()
  if (killedCount > 0) {
    console.log(`  共终止 ${killedCount} 个进程\n`)
  } else {
    console.log('  未终止任何进程\n')
    process.exit(1)
  }
}

// ---- CLI 定义 ----
const program = new Command()

program
  .name('stock-sim')
  .description('A股模拟交易应用 — 一站式股票模拟平台')
  .version('0.0.1')
  .addHelpText('after', `
示例:
  stock-sim start              默认端口 5180 启动
  stock-sim start --port 3000  指定端口启动
  stock-sim stop               停止服务
  stock-sim restart            重启服务
  stock-sim restart --port 3000 指定端口重启
  stock-sim kill               杀死所有 stock-sim 端口进程
`)

program
  .command('start')
  .description('后台启动服务（自动关闭旧服务）')
  .option('-p, --port <port>', '监听端口', '5180')
  .action(async (opts) => {
    const port = parseInt(opts.port, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      console.log('\n  ✗ 非法端口号，范围: 1-65535\n')
      process.exit(1)
    }
    await cmdStart(port)
  })

program
  .command('stop')
  .description('停止服务')
  .action(() => cmdStop())

program
  .command('restart')
  .description('重启服务（先停后启）')
  .option('-p, --port <port>', '监听端口', '5180')
  .action(async (opts) => {
    const port = parseInt(opts.port, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      console.log('\n  ✗ 非法端口号，范围: 1-65535\n')
      process.exit(1)
    }
    await cmdRestart(port)
  })

program
  .command('kill')
  .description('杀死所有 stock-sim 端口进程')
  .action(() => cmdKill())

program
  .command('help')
  .description('显示帮助')
  .action(() => program.help())

// ---- 入口 ----
const args = process.argv.slice(2)

if (args.length === 0) {
  program.help()
} else {
  program.parse()
}
