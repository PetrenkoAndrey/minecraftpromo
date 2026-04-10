/**
 * @param {unknown} body
 * @returns {null | Array<{ kind: 'product'|'kit', id: number, qty: number }>}
 */
export function parseOrderItems(body) {
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

/**
 * @param {import('better-sqlite3').Database} db
 * @param {Array<{ kind: 'product'|'kit', id: number, qty: number }>} items
 * @returns {{ error: string } | { lines: object[], totalRub: number, totalUah: number }}
 */
export function computeCartTotals(db, items) {
  const getProduct = db.prepare(
    'SELECT id, name_uk, name_ru, price_rub, price_uah FROM products WHERE id = ? AND active = 1',
  )
  const getKit = db.prepare(
    'SELECT id, name_uk, name_ru, price_rub, price_uah FROM kits WHERE id = ? AND active = 1',
  )

  const lines = []
  let totalRub = 0
  let totalUah = 0

  for (const { kind, id, qty } of items) {
    if (kind === 'product') {
      const row = getProduct.get(id)
      if (!row) return { error: 'unknown_product' }
      const uah = Number(row.price_uah) || 0
      totalRub += row.price_rub * qty
      totalUah += uah * qty
      lines.push({
        kind: 'product',
        refId: row.id,
        nameUk: row.name_uk,
        nameRu: row.name_ru,
        unitPriceRub: row.price_rub,
        unitPriceUah: uah,
        qty,
      })
    } else {
      const row = getKit.get(id)
      if (!row) return { error: 'unknown_kit' }
      const uah = Number(row.price_uah) || 0
      totalRub += row.price_rub * qty
      totalUah += uah * qty
      lines.push({
        kind: 'kit',
        refId: row.id,
        nameUk: row.name_uk,
        nameRu: row.name_ru,
        unitPriceRub: row.price_rub,
        unitPriceUah: uah,
        qty,
      })
    }
  }

  return { lines, totalRub, totalUah }
}
