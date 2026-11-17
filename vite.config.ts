/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Compatibilidade com navegadores de TV antigos.
  // O bundle de produção não publica sourcemaps nem comentários legais de dependências.
  build: {
    target: 'es2019',
    sourcemap: false,
    minify: 'esbuild',
  },
  esbuild: {
    legalComments: 'none',
  },
  test: { environment: 'node' },
})
