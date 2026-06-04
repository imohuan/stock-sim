#!/usr/bin/env node
/**
 * stock-sim CLI — A股模拟交易应用 管理脚本
 *
 *   start         后台启动服务
 *   stop          停止服务
 *   restart       重启服务（先停后启）
 *   help          显示帮助（默认）
 *
 * 实际服务由 dist/server/index.js 提供（前后端一体）。
 */
import { Command } from 'commander'
import { spawn } from 'node:child_process'
import { readFile, writeFile, unlink, access } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { constants } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVER_SCRIPT = join(ROOT, 'dist', 'server', 'index.js')
const PID_FILE = resolve(__dirname, '.stock-sim.pid')

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
  await writeFile(PID_FILE, String(pid))
}

// ---- start 命令 ----
async function cmdStart(port) {
  // 检查是否已在运行
  try {
    const pid = await readPidFile()
    if (pid && isProcessRunning(pid)) {
      console.log(`\n  ⚠ 服务已在运行 (PID: ${pid})`)
      console.log(`  停止: stock-sim stop\n`)
      process.exit(1)
    }
    await removePidFile()
  } catch { /* 无 PID 文件，正常 */ }

  // 检查 server 脚本是否存在
  try {
    await access(SERVER_SCRIPT, constants.R_OK)
  } catch {
    console.log(`\n  ✗ 找不到服务脚本: ${SERVER_SCRIPT}`)
    console.log('  请先运行 npm run build:npm\n')
    process.exit(1)
  }

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
/**
 * @returns {boolean} true 表示停止成功
 */
async function tryStop() {
  let pid
  try {
    pid = await readPidFile()
  } catch {
    return false // 无 PID 文件 = 未运行
  }

  if (!pid || !isProcessRunning(pid)) {
    await removePidFile()
    return false // 进程已死
  }

  try {
    process.kill(pid, 'SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
    await removePidFile()
    return true
  } catch {
    return false
  }
}

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
`)

program
  .command('start')
  .description('后台启动服务')
  .option('-p, --port <port>', '监听端口', '5180')
  .action(async (opts) => {
    const port = parseInt(opts.port, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      console.log('\n  ✗ 非法端口号，范围: 1-65535\n')
      process.exit(1)
    }
    await cmdStart(port)
    // 函数返回后进程自然退出
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
