/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Versão para TV e Android ("--mode app"): abre direto de arquivo (file://), onde o navegador
// bloqueia scripts de módulo. Por isso o script vira um arquivo comum, sem type="module".
function arquivoLocal(): Plugin {
  return {
    name: 'arquivo-local',
    enforce: 'post',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>')
        .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=')
    },
  }
}

export default defineConfig(({ mode }) => {
  const app = mode === 'app'
  return {
    plugins: [react(), ...(app ? [arquivoLocal()] : [])],
    base: app ? './' : '/',
    // Compatibilidade com navegadores de TV antigos.
    // O bundle de produção não publica sourcemaps nem comentários legais de dependências.
    build: {
      target: 'es2019',
      sourcemap: false,
      minify: 'esbuild' as const,
      outDir: app ? 'dist-app' : 'dist',
      ...(app ? { rollupOptions: { output: { format: 'iife' as const, inlineDynamicImports: true } } } : {}),
    },
    esbuild: {
      legalComments: 'none' as const,
    },
    test: { environment: 'node' },
  }
})
