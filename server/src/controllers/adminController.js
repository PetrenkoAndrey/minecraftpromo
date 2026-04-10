import { getDb } from '../db/init.js'
import { verifyAdminJwt } from '../lib/adminJwt.js'
import {
  readSocialMapRaw,
  socialForAdminResponse,
  validateFullSocialPatch,
} from '../lib/siteSettings.js'

const ORDER_STATUSES = new Set([
  'pending',
  'paid',
  'fulfilled',
  'cancelled',
])

function getBearerToken(req) {
  const auth = req.headers.authorization
  if (typeof auth === 'string' && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, '').trim()
  }
  return ''
}

export function listOrdersAdmin(req, res) {
  try {
    const secret = process.env.ADMIN_JWT_SECRET?.trim()
    if (!secret || secret.length < 16) {
      return res.status(503).json({ error: 'admin_not_configured' })
    }

    const token = getBearerToken(req)
    const email = verifyAdminJwt(token, secret)
    if (!email) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    const db = getDb()
    const rows = db
      .prepare(
        `
      SELECT id, created_at, status, minecraft_username, contact, locale, total_rub, total_uah, notes, admin_note,
             promo_id, discount_rub, discount_uah, promo_code_snapshot
      FROM orders
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT 200
    `,
      )
      .all()

    const orderIds = rows.map((r) => r.id)
    const itemsByOrder = new Map()
    if (orderIds.length > 0) {
      const ph = orderIds.map(() => '?').join(',')
      const items = db
        .prepare(
          `
        SELECT id, order_id, kind, ref_id, name_uk, name_ru, unit_price_rub, unit_price_uah, qty
        FROM order_items
        WHERE order_id IN (${ph})
        ORDER BY id ASC
      `,
        )
        .all(...orderIds)

      for (const it of items) {
        const list = itemsByOrder.get(it.order_id) || []
        list.push({
          id: it.id,
          kind: it.kind,
          refId: it.ref_id,
          nameUk: it.name_uk,
          nameRu: it.name_ru,
          unitPriceRub: it.unit_price_rub,
          unitPriceUah: it.unit_price_uah ?? 0,
          qty: it.qty,
        })
        itemsByOrder.set(it.order_id, list)
      }
    }

    const orders = rows.map((o) => ({
      id: o.id,
      createdAt: o.created_at,
      status: o.status,
      minecraftUsername: o.minecraft_username,
      contact: o.contact,
      locale: o.locale,
      totalRub: o.total_rub,
      totalUah: o.total_uah ?? 0,
      notes: o.notes,
      adminNote: o.admin_note ?? '',
      promoId: o.promo_id ?? null,
      discountRub: o.discount_rub ?? 0,
      discountUah: o.discount_uah ?? 0,
      promoCodeSnapshot: o.promo_code_snapshot ?? null,
      items: itemsByOrder.get(o.id) || [],
    }))

    res.json({ orders })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}

export function getAdminSettings(req, res) {
  try {
    const secret = process.env.ADMIN_JWT_SECRET?.trim()
    if (!secret || secret.length < 16) {
      return res.status(503).json({ error: 'admin_not_configured' })
    }

    const token = getBearerToken(req)
    const email = verifyAdminJwt(token, secret)
    if (!email) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    const raw = readSocialMapRaw(getDb())
    res.json({ social: socialForAdminResponse(raw) })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}

export function patchAdminSettings(req, res) {
  try {
    const secret = process.env.ADMIN_JWT_SECRET?.trim()
    if (!secret || secret.length < 16) {
      return res.status(503).json({ error: 'admin_not_configured' })
    }

    const token = getBearerToken(req)
    const email = verifyAdminJwt(token, secret)
    if (!email) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    const rows = validateFullSocialPatch(req.body?.social)
    if (!rows) {
      return res.status(400).json({ error: 'invalid_social' })
    }

    const db = getDb()
    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `)
    const run = db.transaction(() => {
      for (const row of rows) upsert.run(row)
    })
    run()

    const raw = readSocialMapRaw(db)
    res.json({ social: socialForAdminResponse(raw) })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}

export function patchAdminOrder(req, res) {
  try {
    const secret = process.env.ADMIN_JWT_SECRET?.trim()
    if (!secret || secret.length < 16) {
      return res.status(503).json({ error: 'admin_not_configured' })
    }

    const token = getBearerToken(req)
    const email = verifyAdminJwt(token, secret)
    if (!email) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'invalid_id' })
    }

    const status =
      req.body?.status !== undefined ? String(req.body.status).trim() : undefined
    const adminNoteRaw = req.body?.adminNote
    const adminNote =
      adminNoteRaw !== undefined ? String(adminNoteRaw).slice(0, 2000) : undefined

    if (status === undefined && adminNote === undefined) {
      return res.status(400).json({ error: 'nothing_to_update' })
    }

    if (status !== undefined && !ORDER_STATUSES.has(status)) {
      return res.status(400).json({ error: 'invalid_status' })
    }

    const db = getDb()
    const sets = []
    const vals = []
    if (status !== undefined) {
      sets.push('status = ?')
      vals.push(status)
    }
    if (adminNote !== undefined) {
      sets.push('admin_note = ?')
      vals.push(adminNote)
    }
    vals.push(id)

    const info = db
      .prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`)
      .run(...vals)

    if (info.changes === 0) {
      return res.status(404).json({ error: 'not_found' })
    }

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
