import { useCallback, useEffect, useState } from 'react'
import type { MessageKey } from '../../i18n/translations'
import {
  createAdminPromo,
  fetchAdminPromos,
  patchAdminPromo,
} from '../../api/adminApi'
import type { AdminPromo } from '../../api/adminTypes'

type T = (key: MessageKey) => string

type Props = {
  jwt: string
  t: T
  onUnauthorized: () => void
}

function fromDatetimeLocal(v: string): string | null {
  const s = v.trim()
  if (!s) return null
  return s.length === 16 ? `${s.replace('T', ' ')}:00` : s.replace('T', ' ')
}

export function AdminPromoPanel({ jwt, t, onUnauthorized }: Props) {
  const [list, setList] = useState<AdminPromo[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [code, setCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState('10')
  const [maxUsesTotal, setMaxUsesTotal] = useState('')
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [minOrderRub, setMinOrderRub] = useState('0')
  const [minOrderUah, setMinOrderUah] = useState('0')

  const load = useCallback(async () => {
    setErr(null)
    try {
      const rows = await fetchAdminPromos(jwt)
      setList(rows)
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      if (code === 'unauthorized') onUnauthorized()
      setErr(code)
      setList(null)
    }
  }, [jwt, onUnauthorized])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    setBusy(true)
    setErr(null)
    try {
      await createAdminPromo(jwt, {
        code: code.trim(),
        discountPercent: Math.floor(Number(discountPercent) || 0),
        maxUsesTotal: maxUsesTotal.trim() === '' ? null : Number(maxUsesTotal),
        maxUsesPerUser:
          maxUsesPerUser.trim() === '' ? null : Number(maxUsesPerUser),
        validFrom: fromDatetimeLocal(validFrom),
        validUntil: fromDatetimeLocal(validUntil),
        minOrderRub: Math.max(0, Math.floor(Number(minOrderRub) || 0)),
        minOrderUah: Math.max(0, Math.floor(Number(minOrderUah) || 0)),
      })
      setCode('')
      await load()
    } catch (e) {
      const c = e instanceof Error ? e.message : 'failed'
      if (c === 'unauthorized') onUnauthorized()
      setErr(c)
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (p: AdminPromo) => {
    setErr(null)
    try {
      await patchAdminPromo(jwt, p.id, { active: !p.active })
      await load()
    } catch (e) {
      const c = e instanceof Error ? e.message : 'failed'
      if (c === 'unauthorized') onUnauthorized()
      setErr(c)
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wide text-white/80">
          {t('admin.promoTitle')}
        </h2>
        {err ? (
          <p className="mt-2 text-sm text-red-400">
            {t('admin.loadError')} ({err})
          </p>
        ) : null}
        {!list ? (
          <p className="mt-4 text-sm text-white/50">{t('admin.loading')}</p>
        ) : list.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">—</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-white/[0.08] bg-[#1a1a1a] p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#93c5fd]">
                    {p.code}
                  </span>
                  <span
                    className={
                      p.active ? 'text-emerald-400' : 'text-white/40'
                    }
                  >
                    {p.active ? t('admin.promoActive') : t('admin.promoInactive')}
                  </span>
                </div>
                <p className="mt-2 text-white/70">
                  −{p.discountPercent}% · {t('admin.promoUses')}:{' '}
                  {p.redemptionCount}
                  {p.maxUsesTotal != null ? ` / ${p.maxUsesTotal}` : ''}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  min ₽{p.minOrderRub} · min {p.minOrderUah} грн
                  {p.maxUsesPerUser != null
                    ? ` · max/гравець: ${p.maxUsesPerUser}`
                    : ''}
                </p>
                {(p.validFrom || p.validUntil) && (
                  <p className="mt-1 font-mono text-xs text-white/40">
                    {p.validFrom ?? '…'} → {p.validUntil ?? '…'}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => void toggle(p)}
                  className="mt-3 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white/80 hover:bg-white/5"
                >
                  {p.active ? t('admin.promoToggleOff') : t('admin.promoToggleOn')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-white/10 pt-8">
        <h3 className="text-sm font-black uppercase tracking-wide text-white/80">
          {t('admin.promoCreate')}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoCode')}
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
              placeholder="SUMMER2025"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoDiscount')}
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoMaxTotal')}
            </span>
            <input
              type="number"
              min={0}
              value={maxUsesTotal}
              onChange={(e) => setMaxUsesTotal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
              placeholder="∞"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoMaxUser')}
            </span>
            <input
              type="number"
              min={0}
              value={maxUsesPerUser}
              onChange={(e) => setMaxUsesPerUser(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
              placeholder="∞"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoMinRub')}
            </span>
            <input
              type="number"
              min={0}
              value={minOrderRub}
              onChange={(e) => setMinOrderRub(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoMinUah')}
            </span>
            <input
              type="number"
              min={0}
              value={minOrderUah}
              onChange={(e) => setMinOrderUah(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoValidFrom')}
            </span>
            <input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {t('admin.promoValidUntil')}
            </span>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy || !code.trim()}
          onClick={() => void create()}
          className="mt-4 rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2563eb] disabled:opacity-40"
        >
          {busy ? t('admin.promoSaving') : t('admin.promoSave')}
        </button>
      </div>
    </div>
  )
}
