import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// VITE_SINGLE_FILE=1 gera um bundle único com assets embutidos — usado apenas
// para o preview autocontido (Artifact); o build padrão permanece inalterado.
const singleFile = process.env.VITE_SINGLE_FILE === '1'

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
  build: singleFile
    ? {
        assetsInlineLimit: 100_000_000,
        cssCodeSplit: false,
        chunkSizeWarningLimit: 4_000,
        rollupOptions: {
          output: {
            manualChunks: undefined,
            inlineDynamicImports: true,
          },
        },
      }
    : {
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
