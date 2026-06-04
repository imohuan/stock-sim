import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { stockApiMiddleware } from './server/stockApi'

export default defineConfig(({ mode }) => {
  /** npm 发布构建：字体走 Google Fonts CDN，不打包本地字体文件 */
  const isNpmBuild = mode === 'npm'

  function npmFontsPlugin(): Plugin {
    if (!isNpmBuild) return { name: 'npm-fonts-noop' }

    const fontMap: Record<string, string> = {
      'material-symbols/outlined.css': '\0npm:material-symbols.css',
      '@fontsource/geist/400.css': '\0npm:geist.css',
      '@fontsource/geist/600.css': '\0npm:geist.css',
      '@fontsource/jetbrains-mono/400.css': '\0npm:jetbrains-mono.css',
      '@fontsource/jetbrains-mono/500.css': '\0npm:jetbrains-mono.css',
    }

    const fontCdn: Record<string, string> = {
      '\0npm:material-symbols.css':
        '@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200");',
      '\0npm:geist.css':
        '@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap");',
      '\0npm:jetbrains-mono.css':
        '@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap");',
    }

    return {
      name: 'npm-fonts',
      enforce: 'pre',
      resolveId(id) { if (id in fontMap) return fontMap[id] },
      load(id) { if (id in fontCdn) return fontCdn[id] },
    }
  }

  return {
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'stock-api',
      configureServer(server) {
        server.middlewares.use('/api/stock', stockApiMiddleware)
      },
    },
    npmFontsPlugin(),
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
  }
})
