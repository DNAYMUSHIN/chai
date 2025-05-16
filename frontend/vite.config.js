import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 1000     // Частота проверки изменений (мс)
    },
    host: true,
    strictPort: true,
    port: 3000,
    hmr: {
      clientPort: 3000   // Важно для работы HMR
    },
  }
})
