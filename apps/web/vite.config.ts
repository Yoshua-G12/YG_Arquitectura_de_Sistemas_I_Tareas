import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/productos': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    }
  }
})
