/**
 * 一体化 HTTP 服务（前端静态文件 + 后端 stock API）
 *
 * 编译: npx esbuild server/index.ts --bundle --platform=node --format=esm \
 *         --external:node:* --outfile=dist/server/index.js
 *
 * 启动: node dist/server/index.js [port]
 */
import { createServer } from 'node:http'
import { readFile, access } from 'node:fs/promises'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { constants } from 'node:fs'
import { stockApiMiddleware } from './stockApi'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..')

// ---- 静态文件 MIME ----
const MIME: Record<string, string> = {
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
}

// ---- 静态文件服务 ----
async function serveStatic(res: any, pathname: string) {
  const filePath = pathname === '/' ? '/index.html' : pathname
  const resolved = join(DIST, filePath)

  // 安全检查
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
    // SPA fallback
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

// ---- 主服务 ----
export function createStockApp() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost')
      const pathname = url.pathname

      // 后端 API
      if (pathname.startsWith('/api/stock')) {
        const savedUrl = req.url
        req.url = req.url!.replace('/api/stock', '') || '/'
        return stockApiMiddleware(req, res, (err) => {
          req.url = savedUrl
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: err ? String(err) : 'unknown api' }))
        })
      }

      // 前端静态文件
      await serveStatic(res, pathname)
    } catch {
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
}

// ---- 入口 ----
// 此脚本只通过 spawn 启动（不为 import 使用）
const port = parseInt(process.argv[2] || process.env.PORT || '5180', 10)

const app = createStockApp()
app.listen(port, () => {
  console.log(`Stock server ready: http://localhost:${port}`)
})
