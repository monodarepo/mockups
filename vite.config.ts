import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Mantém o bundle da aplicação enxuto e o build sem avisos de chunk.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          recharts: ['recharts'],
        },
      },
    },
  },
})
