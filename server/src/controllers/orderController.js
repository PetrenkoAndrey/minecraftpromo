import { getDb } from '../db/init.js'
import { computeCartTotals, parseOrderItems } from '../lib/orderCart.js'
import {
  computePromoDiscount,
  isValidPromoCodeFormat,
  normalizePromoCode,
  validatePromoRules,
} from '../lib/promoLogic.js'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/

export function createOrder(req, res) {
  try {
    const minecraftUsername = String(req.body?.minecraftUsername || '').trim()
    const contact = String(req.body?.contact || '').trim()
    const locale = req.body?.locale === 'ru' ? 'ru' : 'uk'
    const notes = String(req.body?.notes || '').trim().slice(0, 500)
    const promoRaw = req.body?.promoCode ?? ''

    if (!USERNAME_RE.test(minecraftUsername)) {
      return res.status(400).json({ error: 'invalid_username' })
    }
    if (contact.length < 3 || contact.length > 200) {
      return res.status(400).json({ error: 'invalid_contact' })
    }

    const items = parseOrderItems(req.body)
    if (!items) return res.status(400).json({ error: 'invalid_items' })

    const db = getDb()
    const cart = computeCartTotals(db, items)
    if ('error' in cart) {
      return res.status(400).json({ error: cart.error })
    }

    const userLower = minecraftUsername.toLowerCase()
    const code = normalizePromoCode(promoRaw)

    let totalRub = cart.totalRub
    let totalUah = cart.totalUah
    let promoId = null
    let discountRub = 0
    let discountUah = 0
    let promoSnapshot = null

    if (code) {
      if (!isValidPromoCodeFormat(code)) {
        return res.status(400).json({ error: 'promo_invalid' })
      }
      const promoRow = db
        .prepare('SELECT * FROM promo_codes WHERE code = ? AND active = 1')
        .get(code)
      if (!promoRow) {
        return res.status(400).json({ error: 'promo_invalid' })
      }

      const now = db.prepare(`SELECT datetime('now') AS n`).get().n
      const globalUses = db
        .prepare(
          'SELECT COUNT(*) AS c FROM promo_redemptions WHERE promo_id = ?',
        )
        .get(promoRow.id).c
      const userUses = db
        .prepare(
          `SELECT COUNT(*) AS c FROM promo_redemptions WHERE promo_id = ? AND minecraft_username = ?`,
        )
        .get(promoRow.id, userLower).c

      const perr = validatePromoRules(promoRow, {
        subtotalRub: cart.totalRub,
        subtotalUah: cart.totalUah,
        locale,
        now,
        globalUses,
        userUses,
      })
      if (perr) return res.status(400).json({ error: perr })

      const d = computePromoDiscount(promoRow, cart.totalRub, cart.totalUah)
      totalRub = d.finalRub
      totalUah = d.finalUah
      discountRub = d.discountRub
      discountUah = d.discountUah
      promoId = promoRow.id
      promoSnapshot = promoRow.code
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        minecraft_username, contact, locale, total_rub, total_uah, notes, status,
        promo_id, discount_rub, discount_uah, promo_code_snapshot
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `)
    const insertLine = db.prepare(`
      INSERT INTO order_items (order_id, kind, ref_id, name_uk, name_ru, unit_price_rub, unit_price_uah, qty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const insertRedemption = db.prepare(`
      INSERT INTO promo_redemptions (promo_id, order_id, minecraft_username)
      VALUES (?, ?, ?)
    `)

    const run = db.transaction(() => {
      if (promoId != null) {
        const promoRow = db
          .prepare('SELECT * FROM promo_codes WHERE id = ? AND active = 1')
          .get(promoId)
        if (!promoRow) throw new Error('promo_invalid')

        const now = db.prepare(`SELECT datetime('now') AS n`).get().n
        const globalUses = db
          .prepare(
            'SELECT COUNT(*) AS c FROM promo_redemptions WHERE promo_id = ?',
          )
          .get(promoId).c
        const userUses = db
          .prepare(
            `SELECT COUNT(*) AS c FROM promo_redemptions WHERE promo_id = ? AND minecraft_username = ?`,
          )
          .get(promoId, userLower).c

        const perr = validatePromoRules(promoRow, {
          subtotalRub: cart.totalRub,
          subtotalUah: cart.totalUah,
          locale,
          now,
          globalUses,
          userUses,
        })
        if (perr) throw Object.assign(new Error(perr), { code: perr })
      }

      const info = insertOrder.run(
        minecraftUsername,
        contact,
        locale,
        totalRub,
        totalUah,
        notes,
        promoId,
        discountRub,
        discountUah,
        promoSnapshot,
      )
      const orderId = Number(info.lastInsertRowid)
      for (const L of cart.lines) {
        insertLine.run(
          orderId,
          L.kind,
          L.refId,
          L.nameUk,
          L.nameRu,
          L.unitPriceRub,
          L.unitPriceUah,
          L.qty,
        )
      }
      if (promoId != null) {
        insertRedemption.run(promoId, orderId, userLower)
      }
      return orderId
    })

    let orderId
    try {
      orderId = run()
    } catch (e) {
      const c = e.code || e.message
      if (
        c === 'promo_invalid' ||
        c === 'promo_expired' ||
        c === 'promo_not_started' ||
        c === 'promo_min_order' ||
        c === 'promo_sold_out' ||
        c === 'promo_user_limit'
      ) {
        return res.status(400).json({ error: c })
      }
      throw e
    }

    res.status(201).json({
      orderId,
      totalRub,
      totalUah,
      subtotalRub: cart.totalRub,
      subtotalUah: cart.totalUah,
      discountRub,
      discountUah,
      promoCode: promoSnapshot,
      status: 'pending',
    })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
