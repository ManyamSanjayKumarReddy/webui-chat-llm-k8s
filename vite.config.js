import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/chat': {
          target: backendUrl,
          changeOrigin: true,
          // Disable compression so SSE chunks are not buffered
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('accept-encoding', 'identity')
            })
          }
        },
        '/sessions': { target: backendUrl, changeOrigin: true },
        '/health':   { target: backendUrl, changeOrigin: true },
      }
    }
  }
})
