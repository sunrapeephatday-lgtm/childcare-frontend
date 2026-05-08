import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  optimizeDeps: {
    exclude: ["xlsx-js-style"]
  },

  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,

    // อนุญาตทุก tunnel (สำคัญมาก)
    allowedHosts: true
  }
  
})
