import { getDb } from '../db/init.js'
import {
  readSocialMapRaw,
  socialForPublic,
} from '../lib/siteSettings.js'

export function getPublicSettings(_req, res) {
  try {
    const raw = readSocialMapRaw(getDb())
    res.json({ social: socialForPublic(raw) })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
