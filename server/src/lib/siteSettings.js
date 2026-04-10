/** @typedef {'discord'|'telegram_dm'|'telegram_channel'|'tiktok'|'youtube'} SocialKey */

export const SOCIAL_DB_KEYS = [
  'discord',
  'telegram_dm',
  'telegram_channel',
  'tiktok',
  'youtube',
]

export const DEFAULT_SOCIAL = {
  discord: 'https://discordapp.com/users/romayt1005',
  telegram_dm: 'https://t.me/YTRomaX',
  telegram_channel: 'https://t.me/YTRomaX1005',
  tiktok: 'https://www.tiktok.com/@ytromax8605',
  youtube: 'https://www.youtube.com/@YTRomaX1005',
}

const CAMEL = {
  discord: 'discord',
  telegram_dm: 'telegramDm',
  telegram_channel: 'telegramChannel',
  tiktok: 'tiktok',
  youtube: 'youtube',
}

/** @param {string|undefined|null} raw */
export function normalizeSocialUrl(raw) {
  const s = String(raw ?? '').trim()
  if (s === '') return ''
  if (s.length > 512) return null
  try {
    const u = new URL(s)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.href
  } catch {
    return null
  }
}

/** @param {import('better-sqlite3').Database} db */
export function readSocialMapRaw(db) {
  /** @type {Record<string, string>} */
  const map = {}
  for (const k of SOCIAL_DB_KEYS) map[k] = ''
  const rows = db.prepare('SELECT key, value FROM site_settings').all()
  for (const r of rows) {
    if (SOCIAL_DB_KEYS.includes(r.key)) map[r.key] = String(r.value ?? '')
  }
  return map
}

/** @param {Record<string, string>} raw */
export function socialForPublic(raw) {
  /** @type {Record<string, string>} */
  const out = {}
  for (const k of SOCIAL_DB_KEYS) {
    const v = String(raw[k] ?? '').trim()
    out[CAMEL[k]] = v || DEFAULT_SOCIAL[k]
  }
  return out
}

/** @param {Record<string, string>} raw */
export function socialForAdminResponse(raw) {
  /** @type {Record<string, string>} */
  const out = {}
  for (const k of SOCIAL_DB_KEYS) {
    out[CAMEL[k]] = String(raw[k] ?? '').trim()
  }
  return out
}

/**
 * @param {Record<string, unknown>} bodySocial camelCase from client; усі 5 полів обов’язкові
 */
export function validateFullSocialPatch(bodySocial) {
  if (!bodySocial || typeof bodySocial !== 'object') return null
  /** @type {Array<{ key: string, value: string }>} */
  const rows = []
  for (const dbKey of SOCIAL_DB_KEYS) {
    const camel = CAMEL[dbKey]
    if (!(camel in bodySocial)) return null
    const norm = normalizeSocialUrl(bodySocial[camel])
    if (norm === null) return null
    rows.push({ key: dbKey, value: norm })
  }
  return rows
}

/** @param {import('better-sqlite3').Database} db */
export function seedSiteSettingsIfEmpty(db) {
  const c = db.prepare('SELECT COUNT(*) AS c FROM site_settings').get().c
  if (c > 0) return
  const ins = db.prepare(
    'INSERT INTO site_settings (key, value) VALUES (?, ?)',
  )
  for (const k of SOCIAL_DB_KEYS) {
    ins.run(k, DEFAULT_SOCIAL[k])
  }
}
