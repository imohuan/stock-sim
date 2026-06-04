/**
 * 编译 server/index.ts → dist/server/index.js
 * 使用 esbuild API 避免 CLI 参数引号问题
 */
import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  external: ['node:*'],
  outfile: 'dist/server/index.js',
})

console.log('dist/server/index.js  compiled')
