import { getDb } from '../db/init.js'

function getAdminToken(req) {
  const h = req.headers['x-admin-token']
  if (typeof h === 'string' && h.length > 0) return h
  const auth = req.headers.authorization
  if (typeof auth === 'string' && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, '').trim()
  }
  return ''
}

export function listOrdersAdmin(req, res) {
  try {
    const expected = process.env.ADMIN_TOKEN?.trim()
    if (!expected || expected.length < 8) {
      return res.status(503).json({ error: 'admin_not_configured' })
    }
    if (getAdminToken(req) !== expected) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    const db = getDb()
    const rows = db
      .prepare(
        `
      SELECT id, created_at, status, minecraft_username, contact, locale, total_rub, notes
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
        SELECT id, order_id, kind, ref_id, name_uk, name_ru, unit_price_rub, qty
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
      notes: o.notes,
      items: itemsByOrder.get(o.id) || [],
    }))

    res.json({ orders })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
