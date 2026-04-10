import { getDb } from '../db/init.js'
import { verifyAdminJwt } from '../lib/adminJwt.js'
import {
  isValidPromoCodeFormat,
  normalizePromoCode,
} from '../lib/promoLogic.js'

function getBearerToken(req) {
  const auth = req.headers.authorization
  if (typeof auth === 'string' && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, '').trim()
  }
  return ''
}

function requireAdmin(req, res) {
  const secret = process.env.ADMIN_JWT_SECRET?.trim()
  if (!secret || secret.length < 16) {
    res.status(503).json({ error: 'admin_not_configured' })
    return null
  }
  const token = getBearerToken(req)
  const email = verifyAdminJwt(token, secret)
  if (!email) {
    res.status(401).json({ error: 'unauthorized' })
    return null
  }
  return email
}

function rowToApi(r) {
  return {
    id: r.id,
    code: r.code,
    discountPercent: r.discount_percent,
    maxUsesTotal: r.max_uses_total,
    maxUsesPerUser: r.max_uses_per_user,
    validFrom: r.valid_from,
    validUntil: r.valid_until,
    minOrderRub: r.min_order_rub,
    minOrderUah: r.min_order_uah,
    active: Boolean(r.active),
    redemptionCount: r.redemption_count ?? 0,
    createdAt: r.created_at,
  }
}

function parseOptionalInt(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Math.floor(Number(v))
  return Number.isInteger(n) && n >= 0 ? n : NaN
}

export function listPromosAdmin(req, res) {
  try {
    if (!requireAdmin(req, res)) return
    const db = getDb()
    const rows = db
      .prepare(
        `
      SELECT p.*,
        (SELECT COUNT(*) FROM promo_redemptions r WHERE r.promo_id = p.id) AS redemption_count
      FROM promo_codes p
      ORDER BY p.id DESC
    `,
      )
      .all()
    res.json({ promos: rows.map(rowToApi) })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}

export function createPromoAdmin(req, res) {
  try {
    if (!requireAdmin(req, res)) return

    const code = normalizePromoCode(req.body?.code)
    if (!code || !isValidPromoCodeFormat(code)) {
      return res.status(400).json({ error: 'invalid_code' })
    }

    const discountPercent = Math.floor(Number(req.body?.discountPercent))
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({ error: 'invalid_discount' })
    }

    const maxUsesTotal = parseOptionalInt(req.body?.maxUsesTotal)
    const maxUsesPerUser = parseOptionalInt(req.body?.maxUsesPerUser)
    if (Number.isNaN(maxUsesTotal) || Number.isNaN(maxUsesPerUser)) {
      return res.status(400).json({ error: 'invalid_limits' })
    }

    const validFrom =
      req.body?.validFrom != null && String(req.body.validFrom).trim()
        ? String(req.body.validFrom).trim().slice(0, 32)
        : null
    const validUntil =
      req.body?.validUntil != null && String(req.body.validUntil).trim()
        ? String(req.body.validUntil).trim().slice(0, 32)
        : null

    const minOrderRub = Math.max(0, Math.floor(Number(req.body?.minOrderRub) || 0))
    const minOrderUah = Math.max(0, Math.floor(Number(req.body?.minOrderUah) || 0))

    const db = getDb()
    try {
      const info = db
        .prepare(
          `
        INSERT INTO promo_codes (
          code, discount_percent, max_uses_total, max_uses_per_user,
          valid_from, valid_until, min_order_rub, min_order_uah, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
        )
        .run(
          code,
          discountPercent,
          maxUsesTotal,
          maxUsesPerUser,
          validFrom,
          validUntil,
          minOrderRub,
          minOrderUah,
        )
      const id = Number(info.lastInsertRowid)
      const row = db
        .prepare(
          `
        SELECT p.*,
          (SELECT COUNT(*) FROM promo_redemptions r WHERE r.promo_id = p.id) AS redemption_count
        FROM promo_codes p WHERE p.id = ?
      `,
        )
        .get(id)
      res.status(201).json({ promo: rowToApi(row) })
    } catch (e) {
      if (String(e.message || '').includes('UNIQUE')) {
        return res.status(409).json({ error: 'code_exists' })
      }
      throw e
    }
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}

export function patchPromoAdmin(req, res) {
  try {
    if (!requireAdmin(req, res)) return

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'invalid_id' })
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'not_found' })

    const sets = []
    const vals = []

    if (req.body?.code !== undefined) {
      const code = normalizePromoCode(req.body.code)
      if (!code || !isValidPromoCodeFormat(code)) {
        return res.status(400).json({ error: 'invalid_code' })
      }
      sets.push('code = ?')
      vals.push(code)
    }

    if (req.body?.discountPercent !== undefined) {
      const discountPercent = Math.floor(Number(req.body.discountPercent))
      if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
        return res.status(400).json({ error: 'invalid_discount' })
      }
      sets.push('discount_percent = ?')
      vals.push(discountPercent)
    }

    if (req.body?.maxUsesTotal !== undefined) {
      const v = parseOptionalInt(req.body.maxUsesTotal)
      if (Number.isNaN(v)) return res.status(400).json({ error: 'invalid_limits' })
      sets.push('max_uses_total = ?')
      vals.push(v)
    }

    if (req.body?.maxUsesPerUser !== undefined) {
      const v = parseOptionalInt(req.body.maxUsesPerUser)
      if (Number.isNaN(v)) return res.status(400).json({ error: 'invalid_limits' })
      sets.push('max_uses_per_user = ?')
      vals.push(v)
    }

    if (req.body?.validFrom !== undefined) {
      const s = String(req.body.validFrom || '').trim()
      sets.push('valid_from = ?')
      vals.push(s ? s.slice(0, 32) : null)
    }

    if (req.body?.validUntil !== undefined) {
      const s = String(req.body.validUntil || '').trim()
      sets.push('valid_until = ?')
      vals.push(s ? s.slice(0, 32) : null)
    }

    if (req.body?.minOrderRub !== undefined) {
      sets.push('min_order_rub = ?')
      vals.push(Math.max(0, Math.floor(Number(req.body.minOrderRub) || 0)))
    }

    if (req.body?.minOrderUah !== undefined) {
      sets.push('min_order_uah = ?')
      vals.push(Math.max(0, Math.floor(Number(req.body.minOrderUah) || 0)))
    }

    if (req.body?.active !== undefined) {
      sets.push('active = ?')
      vals.push(req.body.active ? 1 : 0)
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'nothing_to_update' })
    }

    vals.push(id)

    try {
      db.prepare(`UPDATE promo_codes SET ${sets.join(', ')} WHERE id = ?`).run(
        ...vals,
      )
    } catch (e) {
      if (String(e.message || '').includes('UNIQUE')) {
        return res.status(409).json({ error: 'code_exists' })
      }
      throw e
    }

    const row = db
      .prepare(
        `
      SELECT p.*,
        (SELECT COUNT(*) FROM promo_redemptions r WHERE r.promo_id = p.id) AS redemption_count
      FROM promo_codes p WHERE p.id = ?
    `,
      )
      .get(id)
    res.json({ promo: rowToApi(row) })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
