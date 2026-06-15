import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        mode === 'production' ? '/api' : ''
      ),
    },
    server: {
      port: 3000,
      proxy: {
        '/chat': {
          target: backendUrl,
          changeOrigin: true,
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