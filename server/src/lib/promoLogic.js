/** @param {string|undefined|null} raw */
export function normalizePromoCode(raw) {
  return String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

/** @param {string} code normalized */
export function isValidPromoCodeFormat(code) {
  return /^[A-Z0-9_-]{1,40}$/.test(code)
}

/**
 * @param {object} row promo_codes row
 * @param {{
 *   subtotalRub: number,
 *   subtotalUah: number,
 *   locale: 'uk'|'ru',
 *   now: string,
 *   globalUses: number,
 *   userUses: number,
 * }} ctx
 * @returns {null|string} error code or null if ok
 */
export function validatePromoRules(row, ctx) {
  if (!row || !row.active) return 'promo_invalid'
  if (row.valid_from && String(row.valid_from) > ctx.now) return 'promo_not_started'
  if (row.valid_until && String(row.valid_until) < ctx.now) return 'promo_expired'

  const minR = Number(row.min_order_rub) || 0
  const minU = Number(row.min_order_uah) || 0
  if (ctx.locale === 'ru') {
    if (ctx.subtotalRub < minR) return 'promo_min_order'
  } else {
    if (ctx.subtotalUah < minU) return 'promo_min_order'
  }

  const maxT =
    row.max_uses_total == null ? null : Number(row.max_uses_total)
  if (maxT != null && Number.isFinite(maxT) && ctx.globalUses >= maxT)
    return 'promo_sold_out'

  const maxU =
    row.max_uses_per_user == null ? null : Number(row.max_uses_per_user)
  if (maxU != null && Number.isFinite(maxU) && ctx.userUses >= maxU)
    return 'promo_user_limit'

  return null
}

/**
 * @param {object} row
 * @param {number} subRub
 * @param {number} subUah
 */
export function computePromoDiscount(row, subRub, subUah) {
  const pct = Math.min(100, Math.max(0, Math.floor(Number(row.discount_percent) || 0)))
  const discountRub = Math.floor((subRub * pct) / 100)
  const discountUah = Math.floor((subUah * pct) / 100)
  return {
    discountRub,
    discountUah,
    finalRub: Math.max(0, subRub - discountRub),
    finalUah: Math.max(0, subUah - discountUah),
    discountPercent: pct,
  }
}
