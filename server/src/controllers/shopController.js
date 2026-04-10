import { getDb } from '../db/init.js'

export function listProducts(_req, res) {
  try {
    const products = getDb()
      .prepare(
        `
      SELECT id, slug,
             name_uk AS nameUk, name_ru AS nameRu,
             description_uk AS descriptionUk, description_ru AS descriptionRu,
             price_rub AS priceRub, accent, sort_order AS sortOrder
      FROM products WHERE active = 1
      ORDER BY sort_order ASC, id ASC
    `,
      )
      .all()
    res.json({ products })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}

export function listKits(_req, res) {
  try {
    const db = getDb()
    const kits = db
      .prepare(
        `
      SELECT id, slug,
             name_uk AS nameUk, name_ru AS nameRu,
             description_uk AS descriptionUk, description_ru AS descriptionRu,
             price_rub AS priceRub, sort_order AS sortOrder
      FROM kits WHERE active = 1
      ORDER BY sort_order ASC, id ASC
    `,
      )
      .all()

    const rows = db
      .prepare(
        `
      SELECT ki.kit_id AS kitId, ki.qty,
             p.id AS productId,
             p.name_uk AS productNameUk, p.name_ru AS productNameRu
      FROM kit_items ki
      JOIN products p ON p.id = ki.product_id
      ORDER BY p.sort_order ASC
    `,
      )
      .all()

    const byKit = new Map()
    for (const k of kits) byKit.set(k.id, [])
    for (const r of rows) {
      const list = byKit.get(r.kitId)
      if (list)
        list.push({
          productId: r.productId,
          qty: r.qty,
          nameUk: r.productNameUk,
          nameRu: r.productNameRu,
        })
    }

    const out = kits.map((k) => ({ ...k, items: byKit.get(k.id) || [] }))
    res.json({ kits: out })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
