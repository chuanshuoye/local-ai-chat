import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: 'public',
  // server: {
  //   proxy: {
  //     '/api/proxy/ai/ollama': {
  //       target: 'http://localhost:11434',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api\/proxy\/ai\/ollama/, '/api'),
  //     },
  //   },
  // },
}) 