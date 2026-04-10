import { getDb } from '../db/init.js'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/

function parseItems(body) {
  const raw = body?.items
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) return null
  const items = []
  for (const it of raw) {
    const kind = it?.kind
    const id = Number(it?.id)
    const qty = Math.floor(Number(it?.qty))
    if ((kind !== 'product' && kind !== 'kit') || !Number.isInteger(id) || id < 1)
      return null
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) return null
    items.push({ kind, id, qty })
  }
  return items
}

export function createOrder(req, res) {
  try {
    const minecraftUsername = String(req.body?.minecraftUsername || '').trim()
    const contact = String(req.body?.contact || '').trim()
    const locale = req.body?.locale === 'ru' ? 'ru' : 'uk'
    const notes = String(req.body?.notes || '').trim().slice(0, 500)

    if (!USERNAME_RE.test(minecraftUsername)) {
      return res.status(400).json({ error: 'invalid_username' })
    }
    if (contact.length < 3 || contact.length > 200) {
      return res.status(400).json({ error: 'invalid_contact' })
    }

    const items = parseItems(req.body)
    if (!items) return res.status(400).json({ error: 'invalid_items' })

    const db = getDb()
    const getProduct = db.prepare(
      'SELECT id, name_uk, name_ru, price_rub FROM products WHERE id = ? AND active = 1',
    )
    const getKit = db.prepare(
      'SELECT id, name_uk, name_ru, price_rub FROM kits WHERE id = ? AND active = 1',
    )

    const lines = []
    let total = 0

    for (const { kind, id, qty } of items) {
      if (kind === 'product') {
        const row = getProduct.get(id)
        if (!row) return res.status(400).json({ error: 'unknown_product' })
        const sub = row.price_rub * qty
        total += sub
        lines.push({
          kind: 'product',
          refId: row.id,
          nameUk: row.name_uk,
          nameRu: row.name_ru,
          unitPriceRub: row.price_rub,
          qty,
        })
      } else {
        const row = getKit.get(id)
        if (!row) return res.status(400).json({ error: 'unknown_kit' })
        const sub = row.price_rub * qty
        total += sub
        lines.push({
          kind: 'kit',
          refId: row.id,
          nameUk: row.name_uk,
          nameRu: row.name_ru,
          unitPriceRub: row.price_rub,
          qty,
        })
      }
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders (minecraft_username, contact, locale, total_rub, notes, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `)
    const insertLine = db.prepare(`
      INSERT INTO order_items (order_id, kind, ref_id, name_uk, name_ru, unit_price_rub, qty)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const run = db.transaction(() => {
      const info = insertOrder.run(
        minecraftUsername,
        contact,
        locale,
        total,
        notes,
      )
      const orderId = Number(info.lastInsertRowid)
      for (const L of lines) {
        insertLine.run(
          orderId,
          L.kind,
          L.refId,
          L.nameUk,
          L.nameRu,
          L.unitPriceRub,
          L.qty,
        )
      }
      return orderId
    })

    const orderId = run()
    res.status(201).json({
      orderId,
      totalRub: total,
      status: 'pending',
    })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
