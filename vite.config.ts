/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Navegadores de TV antigos: gerar JS mais compatível
  build: { target: 'es2019' },
  test: { environment: 'node' },
})
