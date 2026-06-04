/**
 * 独立股票 API 服务
 * 用法：npx tsx server/index.ts
 * 默认监听 :3180，供 Vite dev server proxy 转发
 */
import { createServer } from 'http'
import { stockApiMiddleware } from './stockApi'

const PORT = 3180

const server = createServer((req, res) => {
  // 只处理 /api/stock/* 请求，其他返回 404
  if (!req.url?.startsWith('/api/stock')) {
    res.statusCode = 404
    res.end('Not Found')
    return
  }

  // 剥离 /api/stock 前缀再交给中间件
  const originalUrl = req.url
  req.url = req.url.replace('/api/stock', '') || '/'

  stockApiMiddleware(req, res, (err) => {
    req.url = originalUrl
    if (err) {
      res.statusCode = 500
      res.end(String(err))
    }
  })
})

server.listen(PORT, () => {
  console.log(`Stock API server running at http://localhost:${PORT}`)
})
