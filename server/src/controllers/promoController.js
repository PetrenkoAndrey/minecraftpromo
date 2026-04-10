import { getDb } from '../db/init.js'
import { computeCartTotals, parseOrderItems } from '../lib/orderCart.js'
import {
  computePromoDiscount,
  isValidPromoCodeFormat,
  normalizePromoCode,
  validatePromoRules,
} from '../lib/promoLogic.js'

export function validatePromo(req, res) {
  try {
    const items = parseOrderItems(req.body)
    if (!items) return res.status(400).json({ error: 'invalid_items' })

    const locale = req.body?.locale === 'ru' ? 'ru' : 'uk'
    const minecraftUsername = String(
      req.body?.minecraftUsername || '',
    ).trim()
    const codeRaw = req.body?.promoCode ?? req.body?.code ?? ''

    const code = normalizePromoCode(codeRaw)
    if (!code) {
      return res.status(400).json({ error: 'promo_required' })
    }
    if (!isValidPromoCodeFormat(code)) {
      return res.status(400).json({ error: 'promo_invalid' })
    }

    const db = getDb()
    const cart = computeCartTotals(db, items)
    if ('error' in cart) {
      return res.status(400).json({ error: cart.error })
    }

    const row = db
      .prepare('SELECT * FROM promo_codes WHERE code = ? AND active = 1')
      .get(code)
    if (!row) return res.status(400).json({ error: 'promo_invalid' })

    const now = db.prepare(`SELECT datetime('now') AS n`).get().n
    const globalUses = db
      .prepare('SELECT COUNT(*) AS c FROM promo_redemptions WHERE promo_id = ?')
      .get(row.id).c

    const needsUser =
      row.max_uses_per_user != null && Number(row.max_uses_per_user) > 0
    if (needsUser && !/^[a-zA-Z0-9_]{3,16}$/.test(minecraftUsername)) {
      return res.status(400).json({ error: 'promo_need_nick' })
    }

    const userLower = minecraftUsername.toLowerCase()
    const userUses = needsUser
      ? db
          .prepare(
            `SELECT COUNT(*) AS c FROM promo_redemptions WHERE promo_id = ? AND minecraft_username = ?`,
          )
          .get(row.id, userLower).c
      : 0

    const err = validatePromoRules(row, {
      subtotalRub: cart.totalRub,
      subtotalUah: cart.totalUah,
      locale,
      now,
      globalUses,
      userUses,
    })
    if (err) return res.status(400).json({ error: err })

    const d = computePromoDiscount(row, cart.totalRub, cart.totalUah)
    res.json({
      ok: true,
      discountPercent: d.discountPercent,
      subtotalRub: cart.totalRub,
      subtotalUah: cart.totalUah,
      discountRub: d.discountRub,
      discountUah: d.discountUah,
      totalRub: d.finalRub,
      totalUah: d.finalUah,
    })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
