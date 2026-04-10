import { useEffect, useMemo, useState } from 'react'
import type { Locale, MessageKey } from '../../i18n/translations'
import type { CartLine, PromoValidateResponse } from '../../api/shopTypes'
import { createOrder, validatePromo } from '../../api/shopApi'
import {
  formatAmountWithCurrency,
  lineSubtotalRubUah,
} from '../../lib/shopMoney'

type T = (key: MessageKey) => string

const NICK_RE = /^[a-zA-Z0-9_]{3,16}$/

function translateOrderError(code: string, t: T): string {
  const keys: Record<string, MessageKey> = {
    promo_invalid: 'shop.promoInvalid',
    promo_expired: 'shop.promoExpired',
    promo_not_started: 'shop.promoNotStarted',
    promo_min_order: 'shop.promoMinOrder',
    promo_sold_out: 'shop.promoSoldOut',
    promo_user_limit: 'shop.promoUserLimit',
    promo_need_nick: 'shop.promoNeedNick',
    promo_required: 'shop.promoRequired',
  }
  const k = keys[code]
  if (k) return t(k)
  return `${t('shop.orderBad')} (${code})`
}

type Props = {
  open: boolean
  onClose: () => void
  cart: CartLine[]
  locale: Locale
  t: T
  onOrdered: () => void
}

export function OrderModal({
  open,
  onClose,
  cart,
  locale,
  t,
  onOrdered,
}: Props) {
  const [nick, setNick] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoPreview, setPromoPreview] = useState<PromoValidateResponse | null>(
    null,
  )
  const [promoErr, setPromoErr] = useState<string | null>(null)
  const [promoChecking, setPromoChecking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState<{
    id: number
    totalRub: number
    totalUah: number
  } | null>(null)

  const itemsPayload = useMemo(
    () => cart.map((c) => ({ kind: c.kind, id: c.id, qty: c.qty })),
    [cart],
  )

  const subtotalRub = useMemo(
    () => cart.reduce((s, l) => s + l.unitPriceRub * l.qty, 0),
    [cart],
  )
  const subtotalUah = useMemo(
    () =>
      cart.reduce(
        (s, l) => s + (Number(l.unitPriceUah) || 0) * l.qty,
        0,
      ),
    [cart],
  )

  useEffect(() => {
    setPromoPreview(null)
    setPromoErr(null)
  }, [cart, locale, promoCode])

  if (!open) return null

  const finalRub = promoPreview?.totalRub ?? subtotalRub
  const finalUah = promoPreview?.totalUah ?? subtotalUah
  const discRub = promoPreview?.discountRub ?? 0
  const discUah = promoPreview?.discountUah ?? 0
  const hasDiscount =
    Boolean(promoPreview) &&
    (locale === 'ru' ? discRub > 0 : discUah > 0)

  const checkPromo = async () => {
    const code = promoCode.trim()
    if (!code) {
      setPromoErr('promo_required')
      return
    }
    if (!NICK_RE.test(nick.trim())) {
      setPromoErr('promo_need_nick')
      return
    }
    setPromoErr(null)
    setPromoChecking(true)
    try {
      const res = await validatePromo({
        items: itemsPayload,
        locale,
        minecraftUsername: nick.trim(),
        promoCode: code,
      })
      setPromoPreview(res)
    } catch (e) {
      const codeMsg = e instanceof Error ? e.message : 'promo_invalid'
      setPromoPreview(null)
      setPromoErr(codeMsg)
    } finally {
      setPromoChecking(false)
    }
  }

  const submit = async () => {
    setErr(null)
    setBusy(true)
    try {
      const res = await createOrder({
        minecraftUsername: nick.trim(),
        contact: contact.trim(),
        locale,
        notes: notes.trim() || undefined,
        promoCode: promoCode.trim() || undefined,
        items: itemsPayload,
      })
      setDone({
        id: res.orderId,
        totalRub: res.totalRub,
        totalUah: res.totalUah ?? 0,
      })
      onOrdered()
    } catch (e) {
      const code = e instanceof Error ? e.message : 'order_failed'
      setErr(translateOrderError(code, t))
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    setNick('')
    setContact('')
    setNotes('')
    setPromoCode('')
    setPromoPreview(null)
    setPromoErr(null)
    setErr(null)
    setDone(null)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="order-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) close()
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="order-modal-title"
          className="text-lg font-black uppercase tracking-wide text-white"
        >
          {t('shop.checkoutTitle')}
        </h2>

        {done ? (
          <div className="mt-4">
            <p className="text-sm leading-relaxed text-[#93c5fd]">
              {t('shop.orderOk')
                .replace('{id}', String(done.id))
                .replace(
                  '{total}',
                  formatAmountWithCurrency(
                    locale === 'ru' ? done.totalRub : done.totalUah,
                    locale,
                    t,
                  ),
                )}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 w-full rounded-xl bg-[#3b82f6] py-3 text-sm font-bold text-white transition hover:bg-[#2563eb]"
            >
              {t('shop.orderClose')}
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-xs text-white/50">
              {t('shop.orderHint')}
            </p>
            <ul className="mt-4 space-y-1 border-b border-white/10 pb-4 text-sm text-white/80">
              {cart.map((l) => (
                <li key={l.key} className="flex justify-between gap-2">
                  <span className="truncate">
                    {locale === 'ru' ? l.nameRu : l.nameUk} ×{l.qty}
                  </span>
                  <span className="shrink-0 tabular-nums text-white/60">
                    {formatAmountWithCurrency(
                      lineSubtotalRubUah(
                        l.unitPriceRub,
                        l.unitPriceUah,
                        l.qty,
                        locale,
                      ),
                      locale,
                      t,
                    )}
                  </span>
                </li>
              ))}
              <li className="flex justify-between pt-2 text-white/70">
                <span>{t('shop.subtotal')}</span>
                <span className="tabular-nums">
                  {formatAmountWithCurrency(
                    locale === 'ru' ? subtotalRub : subtotalUah,
                    locale,
                    t,
                  )}
                </span>
              </li>
              {hasDiscount ? (
                <li className="flex justify-between text-emerald-400/90">
                  <span>
                    {t('shop.discount')} (−{promoPreview?.discountPercent ?? 0}%)
                  </span>
                  <span className="tabular-nums">
                    −
                    {formatAmountWithCurrency(
                      locale === 'ru' ? discRub : discUah,
                      locale,
                      t,
                    )}
                  </span>
                </li>
              ) : null}
              <li className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-white">
                <span>
                  {hasDiscount ? t('shop.totalAfterPromo') : t('shop.total')}
                </span>
                <span className="tabular-nums">
                  {formatAmountWithCurrency(
                    locale === 'ru' ? finalRub : finalUah,
                    locale,
                    t,
                  )}
                </span>
              </li>
            </ul>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-white/70">
              {t('shop.fieldNick')}
              <input
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={16}
                autoComplete="username"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
                placeholder="Steve"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-white/70">
              {t('shop.fieldContact')}
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={200}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
                placeholder="@nickname"
              />
            </label>
            <p className="mt-1 text-[11px] text-white/40">
              {t('shop.fieldContactHint')}
            </p>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-white/70">
              {t('shop.promoLabel')}
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                maxLength={40}
                autoComplete="off"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-sm uppercase text-white outline-none focus:border-[#3b82f6]"
                placeholder="CODE"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  promoChecking ||
                  !promoCode.trim() ||
                  !NICK_RE.test(nick.trim())
                }
                onClick={() => void checkPromo()}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15 disabled:opacity-40"
              >
                {promoChecking ? t('shop.promoChecking') : t('shop.promoCheck')}
              </button>
              <button
                type="button"
                disabled={!promoCode.trim() && !promoPreview}
                onClick={() => {
                  setPromoCode('')
                  setPromoPreview(null)
                  setPromoErr(null)
                }}
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 disabled:opacity-40"
              >
                {t('shop.promoClear')}
              </button>
            </div>
            {promoErr ? (
              <p className="mt-2 text-xs text-red-400">
                {translateOrderError(promoErr, t)}
              </p>
            ) : null}

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-white/70">
              {t('shop.fieldNotes')}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={2}
                className="mt-1.5 w-full resize-none rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
              />
            </label>

            {err ? (
              <p className="mt-3 text-sm text-red-400">{err}</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                disabled={busy || cart.length === 0}
                onClick={() => void submit()}
                className="rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-bold text-white transition enabled:hover:bg-[#2563eb] disabled:opacity-40"
              >
                {busy ? t('shop.placingOrder') : t('shop.placeOrder')}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5"
              >
                {t('shop.cancel')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
