import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { stockApiMiddleware } from './server/stockApi'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'stock-api',
      configureServer(server) {
        server.middlewares.use('/api/stock', stockApiMiddleware)
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ui': resolve(__dirname, 'src/components/ui'),
    },
  },
  server: {
    port: 5180,
    fs: {
      allow: [
        resolve(__dirname),
        resolve(__dirname, 'src'),
        resolve(__dirname, 'node_modules'),
      ],
    },
  },
})
