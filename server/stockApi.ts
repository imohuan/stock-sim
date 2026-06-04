/**
 * westock-data CLI 桥接层
 * 可作为 connect 中间件挂载到 Vite dev server 或独立 HTTP 服务
 */
import { execFile } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---- westock-data CLI 配置 ----
// const NODE_EXE = 'C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2/node.exe'
// const WESTOK_SCRIPT =
//   'C:/Users/Administrator/.workbuddy/plugins/marketplaces/cb_teams_marketplace/plugins/finance-data/skills/westock-data/scripts/index.js'
// const WESTOK_CWD =
//   'C:/Users/Administrator/.workbuddy/plugins/marketplaces/cb_teams_marketplace/plugins/finance-data/skills/westock-data'
const NODE_EXE = 'node'
const WESTOK_SCRIPT = path.resolve(__dirname, 'westock-data/index.js')
const WESTOK_CWD = path.resolve(__dirname, 'westock-data')

// ---- 工具函数 ----

function callWestock(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      NODE_EXE,
      [WESTOK_SCRIPT, ...args],
      { timeout: 60000, cwd: WESTOK_CWD, windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          const detail = [err.message, stderr ? `stderr: ${stderr}` : '', stdout ? `stdout: ${stdout}` : '']
            .filter(Boolean)
            .join('\n')
          reject(new Error(detail || 'Unknown error'))
          return
        }
        resolve(stdout)
      },
    )
  })
}

function parseMarkdownTable(md: string): Record<string, string>[] {
  const lines = md.trim().split('\n').filter((l) => l.startsWith('|'))
  if (lines.length < 3) return []
  const headers = lines[0].split('|').map((h) => h.trim()).filter(Boolean)
  const rows = lines.slice(2)
  return rows.map((line) => {
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = cells[i] ?? '' })
    return row
  })
}

function json(res: ServerResponse, data: unknown, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?')
  if (idx < 0) return {}
  const params: Record<string, string> = {}
  for (const pair of url.slice(idx + 1).split('&')) {
    const [k, v] = pair.split('=')
    params[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
  }
  return params
}

// ---- 中间件处理器 ----

/**
 * 处理 /api/stock/* 请求的 connect 中间件
 * 用法：
 *   - Vite: server.middlewares.use('/api/stock', stockApiMiddleware)
 *   - 独立服务: http.createServer((req, res) => stockApiMiddleware(req, res, next))
 */
export async function stockApiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void,
) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const pathname = url.pathname
  const query = parseQuery(req.url ?? '')

  try {
    // ---- Quote ----
    if (pathname === '/quote' || pathname === '/') {
      const codes = query.codes
      if (!codes) return json(res, { error: 'missing codes' }, 400)
      const stdout = await callWestock(['quote', codes])
      const rows = parseMarkdownTable(stdout)
      const quotes = rows.map((r) => ({
        code: r.symbol || r.code || '',
        name: r.name || '',
        price: parseFloat(r.price) || 0,
        open: parseFloat(r.open) || 0,
        high: parseFloat(r.high) || 0,
        low: parseFloat(r.low) || 0,
        preClose: parseFloat(r.prev_close) || 0,
        volume: parseFloat(r.volume) || 0,
        amount: parseFloat(r.amount) || 0,
        change: parseFloat(r.change) || 0,
        changePercent: parseFloat(r.change_percent) || 0,
        time: r.time || '',
      }))
      return json(res, quotes)
    }

    // ---- Kline ----
    if (pathname === '/kline') {
      const code = query.code
      const period = query.period || 'day'
      const limit = query.limit || '2000'
      if (!code) return json(res, { error: 'missing code' }, 400)
      const stdout = await callWestock(['kline', code, '--period', period, '--limit', limit])
      const rows = parseMarkdownTable(stdout)
      const klines = rows.map((r) => ({
        time: r.date || '',
        open: parseFloat(r.open) || 0,
        close: parseFloat(r.last) || 0,
        high: parseFloat(r.high) || 0,
        low: parseFloat(r.low) || 0,
        volume: parseFloat(r.volume) || 0,
      })).reverse() // CLI 返回倒序（最新在前），反转为正序（最早在前）
      return json(res, klines)
    }

    // ---- Minute ----
    if (pathname === '/minute') {
      const code = query.code
      if (!code) return json(res, { error: 'missing code' }, 400)
      const stdout = await callWestock(['minute', code])
      const rows = parseMarkdownTable(stdout)
      const points = rows.map((r) => ({
        time: r.time || r.minute || '',
        price: parseFloat(r.price) || parseFloat(r.avg_price) || 0,
        volume: parseFloat(r.volume) || 0,
        avgPrice: parseFloat(r.avg_price) || parseFloat(r.price) || 0,
      }))
      return json(res, points)
    }

    next()
  } catch (err: any) {
    return json(res, { error: err.message }, 500)
  }
}
