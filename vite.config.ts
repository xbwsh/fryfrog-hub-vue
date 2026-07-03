import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['throughput'],
  },
  server: {
    host: '0.0.0.0',
    port: 3540,
    proxy: {
      '/api': {
        target: 'http://localhost:20058',
        changeOrigin: true,
      },
    },
  },
})
