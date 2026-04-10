import type { Locale, MessageKey } from '../i18n/translations'

type T = (key: MessageKey) => string

export function formatAmountWithCurrency(
  amount: number,
  locale: Locale,
  t: T,
): string {
  const cur = locale === 'ru' ? t('shop.curRub') : t('shop.curUah')
  return `${amount} ${cur}`
}

export function formatFromPrice(
  priceRub: number,
  priceUah: number | undefined,
  locale: Locale,
  t: T,
): string {
  const amount = locale === 'ru' ? priceRub : Number(priceUah) || 0
  return `${t('rank.from')} ${formatAmountWithCurrency(amount, locale, t)}`
}

export function lineSubtotalRubUah(
  unitPriceRub: number,
  unitPriceUah: number | undefined,
  qty: number,
  locale: Locale,
): number {
  const uah = Number(unitPriceUah) || 0
  return (locale === 'ru' ? unitPriceRub : uah) * qty
}
