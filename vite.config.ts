import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * GitHub Pages (project site): https://user.github.io/<repo>/
 * У CI GitHub задає GITHUB_REPOSITORY=owner/repo — base підставляється автоматично.
 * Локально без змінних — /minecraftpromo/ (як у репозиторії PetrenkoAndrey/minecraftpromo).
 * Репозиторій *.github.io (user page) — base '/'.
 */
function resolveBase(): string {
  const fromEnv = (process.env.VITE_BASE_PATH ?? process.env.VITE_BASE_URL ?? '')
    .trim()
  if (fromEnv) {
    const b = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`
    return b.endsWith('/') ? b : `${b}/`
  }
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
  if (/\.github\.io$/i.test(repo)) return '/'
  if (repo) return `/${repo}/`
  return '/minecraftpromo/'
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
