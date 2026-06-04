#!/usr/bin/env node
/**
 * stock-sim CLI — A股模拟交易应用
 *
 *   start         启动服务
 *   stop          停止服务
 *   help          显示帮助（默认）           stock-sim help
 */
import { Command } from 'commander'
import { createServer } from 'node:http'
import { readFile, writeFile, access, unlink } from 'node:fs/promises'
import { join, extname, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { constants } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const PID_FILE = resolve(__dirname, '.stock-sim.pid')

// ---- 静态文件 MIME ----
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

// ---- 静态文件服务 ----
async function sendFile(res, filePath) {
  const resolved = join(DIST, filePath)
  if (!resolved.startsWith(DIST)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  try {
    await access(resolved, constants.R_OK)
    const content = await readFile(resolved)
    const ext = extname(resolved).toLowerCase()
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.statusCode = 200
    res.end(content)
  } catch {
    // 404 → SPA 回退到 index.html
    try {
      const html = await readFile(join(DIST, 'index.html'))
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.statusCode = 200
      res.end(html)
    } catch {
      res.statusCode = 404
      res.end('Not Found')
    }
  }
}

// ---- API 代理（无 westock-data 时返回提示） ----
function handleApi(res) {
  res.statusCode = 503
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({
    error: 'stock-api 不可用',
    hint: '股票数据 API 需要本地安装 westock-data CLI',
  }))
}

// ---- 创建 HTTP 服务 ----
function createApp() {
  return createServer((req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://localhost`)
      const pathname = url.pathname

      if (pathname.startsWith('/api/stock')) return handleApi(res)

      const filePath = pathname === '/' ? '/index.html' : pathname
      sendFile(res, filePath)
    } catch {
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
}

// ---- 进程检查 ----
function isProcessRunning(pid) {
  try {
    // 发信号 0 只检查进程是否存在，不实际发送信号
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

// ---- 清理 PID 文件 ----
async function removePidFile() {
  try { await unlink(PID_FILE) } catch { /* 不存在就忽略 */ }
}

// ---- start 命令 ----
async function cmdStart(port) {
  // 检查是否已在运行
  try {
    const raw = await readFile(PID_FILE, 'utf-8')
    const pid = parseInt(raw.trim(), 10)
    if (pid && isProcessRunning(pid)) {
      console.log(`\n  ⚠ 服务已在运行 (PID: ${pid})`)
      console.log(`  停止: stock-sim stop\n`)
      process.exit(1)
    }
    // PID 文件在但进程已死 → 清理
    await removePidFile()
  } catch { /* 无 PID 文件，正常 */ }

  const app = createApp()

  return new Promise((resolvePromise, reject) => {
    app.listen(port, () => {
      const banner = `
╔══════════════════════════════════════════════╗
║   A股模拟交易  ·  启动成功                   ║
║                                              ║
║   地址:   http://localhost:${port}               ║
║   PID:    ${process.pid}                           ║
║   PID 文件: ${PID_FILE}
║                                              ║
║   停止:   stock-sim stop                      ║
╚══════════════════════════════════════════════╝
`
      console.log(banner)

      // 写 PID 文件
      writeFile(PID_FILE, String(process.pid)).catch(() => {})

      // 清理退出
      const cleanup = async () => {
        await removePidFile()
        app.close()
        process.exit(0)
      }

      process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup)
      process.on('beforeExit', () => removePidFile())

      resolvePromise()  // commander 的 action 完成，但不退出进程
    })

    app.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`\n  ✗ 端口 ${port} 已被占用`)
        console.log(`  请先运行 stock-sim stop 或更换端口: stock-sim start --port ${port + 1}\n`)
        process.exit(1)
      }
      reject(err)
    })
  })
}

// ---- stop 命令 ----
async function cmdStop() {
  let pid
  try {
    const raw = await readFile(PID_FILE, 'utf-8')
    pid = parseInt(raw.trim(), 10)
  } catch {
    console.log('\n  ✗ 未找到运行中的服务（PID 文件不存在）\n')
    process.exit(1)
  }

  if (!pid || !isProcessRunning(pid)) {
    console.log('\n  ✗ PID 文件存在但进程已不在运行，已清理\n')
    await removePidFile()
    process.exit(1)
  }

  console.log(`\n  正在停止服务 (PID: ${pid})...`)

  try {
    process.kill(pid, 'SIGTERM')
    // 等待进程退出
    await new Promise((resolveKill) => setTimeout(resolveKill, 500))
    await removePidFile()
    console.log('  ✓ 服务已停止\n')
  } catch (err) {
    console.log(`  ✗ 无法停止进程: ${err.message}`)
    console.log(`    请手动终止: taskkill /F /PID ${pid}\n`)
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
`)

program
  .command('start')
  .description('启动服务')
  .option('-p, --port <port>', '监听端口', '5180')
  .action(async (opts) => {
    const port = parseInt(opts.port, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      console.log('\n  ✗ 非法端口号，范围: 1-65535\n')
      process.exit(1)
    }
    await cmdStart(port)
    // 不退出进程 — server.listen 保持事件循环
  })

program
  .command('stop')
  .description('停止服务')
  .action(() => cmdStop())

// 默认显示帮助
program
  .command('help')
  .description('显示帮助')
  .action(() => program.help())

// ---- 入口 ----
const args = process.argv.slice(2)

if (args.length === 0) {
  // 无参数 → 显示帮助
  program.help()
} else {
  program.parse()
}
