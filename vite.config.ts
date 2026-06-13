import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createProxyMiddleware } from 'http-proxy-middleware'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3540,
    proxy: {
      '/navidrome-proxy': {
        target: 'http://localhost:4533',
        changeOrigin: true,
        pathRewrite: { '^/navidrome-proxy': '' },
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('Navidrome Proxy Error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const targetUrl = req.headers['x-target-url']
            if (targetUrl) {
              proxyReq.setHeader('X-Original-Target', targetUrl)
            }
          })
        },
      },
      '/komga-proxy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/komga-proxy': '' },
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('Komga Proxy Error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const targetUrl = req.headers['x-target-url']
            if (targetUrl) {
              proxyReq.setHeader('X-Original-Target', targetUrl)
            }
          })
        },
      },
    },
  },
})