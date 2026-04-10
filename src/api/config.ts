/**
 * У dev без VITE_API_URL звертаємось напряму до API (обходить proxy Vite — надійніше на Windows).
 * У проді: задайте VITE_API_URL при збірці або лишіть порожнім для відносних /api (той самий хост).
 */
export function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '') ?? ''
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return 'http://127.0.0.1:3001'
  return ''
}

export function apiUrl(path: string): string {
  const base = apiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}
