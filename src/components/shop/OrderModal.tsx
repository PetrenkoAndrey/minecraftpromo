import { useState } from 'react'
import type { Locale, MessageKey } from '../../i18n/translations'
import type { CartLine } from '../../api/shopTypes'
import { createOrder } from '../../api/shopApi'

type T = (key: MessageKey) => string

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
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState<{ id: number; total: number } | null>(null)

  if (!open) return null

  const total = cart.reduce((s, l) => s + l.unitPriceRub * l.qty, 0)

  const submit = async () => {
    setErr(null)
    setBusy(true)
    try {
      const res = await createOrder({
        minecraftUsername: nick.trim(),
        contact: contact.trim(),
        locale,
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({ kind: c.kind, id: c.id, qty: c.qty })),
      })
      setDone({ id: res.orderId, total: res.totalRub })
      onOrdered()
    } catch (e) {
      const code = e instanceof Error ? e.message : 'order_failed'
      setErr(code)
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    setNick('')
    setContact('')
    setNotes('')
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
                .replace('{total}', String(done.total))}
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
                    {l.unitPriceRub * l.qty}₽
                  </span>
                </li>
              ))}
              <li className="flex justify-between pt-2 text-sm font-bold text-white">
                <span>{t('shop.total')}</span>
                <span className="tabular-nums">{total}₽</span>
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
            <p className="mt-1 text-[11px] text-white/40">{t('shop.fieldContactHint')}</p>
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-white/70">
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
              <p className="mt-3 text-sm text-red-400">
                {t('shop.orderBad')} ({err})
              </p>
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
