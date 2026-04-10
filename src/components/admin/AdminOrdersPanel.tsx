import { useCallback, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { fetchAdminOrders } from '../../api/adminApi'
import type { AdminOrder } from '../../api/adminTypes'

const STORAGE_KEY = 'ytromax-admin-token'

export function AdminOrdersPanel() {
  const { t, locale } = useLanguage()
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [orders, setOrders] = useState<AdminOrder[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const saveToken = useCallback((v: string) => {
    setToken(v)
    try {
      if (v.trim()) sessionStorage.setItem(STORAGE_KEY, v.trim())
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const load = useCallback(async () => {
    setErr(null)
    setLoading(true)
    setOrders(null)
    try {
      const list = await fetchAdminOrders(token)
      setOrders(list)
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      setErr(code)
    } finally {
      setLoading(false)
    }
  }, [token])

  const back = () => {
    window.location.hash = ''
  }

  const itemName = (o: { nameUk: string; nameRu: string }) =>
    locale === 'ru' ? o.nameRu : o.nameUk

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-black uppercase tracking-wide sm:text-2xl">
            {t('admin.title')}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
          <button
            type="button"
            onClick={back}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
          >
            {t('admin.back')}
          </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-6">
          <p className="text-xs text-white/50">{t('admin.tokenHint')}</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-sm">
              <span className="sr-only">{t('admin.tokenLabel')}</span>
              <input
                type="password"
                value={token}
                onChange={(e) => saveToken(e.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-[#3b82f6]"
                placeholder={t('admin.tokenLabel')}
              />
            </label>
            <button
              type="button"
              disabled={loading || !token.trim()}
              onClick={() => void load()}
              className="rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-bold text-white enabled:hover:bg-[#2563eb] disabled:opacity-40"
            >
              {loading ? t('admin.loading') : t('admin.load')}
            </button>
          </div>

          {err === 'unauthorized' ? (
            <p className="mt-4 text-sm text-red-400">{t('admin.unauthorized')}</p>
          ) : null}
          {err === 'admin_not_configured' ? (
            <p className="mt-4 text-sm text-amber-400">
              {t('admin.notConfigured')}
            </p>
          ) : null}
          {err && err !== 'unauthorized' && err !== 'admin_not_configured' ? (
            <p className="mt-4 text-sm text-red-400">
              {t('admin.loadError')} ({err})
            </p>
          ) : null}

          {orders && orders.length === 0 ? (
            <p className="mt-8 text-center text-sm text-white/45">
              {t('admin.noOrders')}
            </p>
          ) : null}

          {orders && orders.length > 0 ? (
            <ul className="mt-8 space-y-6">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl border border-white/[0.08] bg-[#1a1a1a] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="font-mono text-sm font-bold text-[#93c5fd]">
                      #{o.id}
                    </span>
                    <span className="text-xs text-white/45">{o.createdAt}</span>
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.mcNick')}
                      </dt>
                      <dd className="font-medium text-white">{o.minecraftUsername}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.contact')}
                      </dt>
                      <dd className="break-all text-white/90">{o.contact}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.total')}
                      </dt>
                      <dd className="font-semibold tabular-nums text-[#93c5fd]">
                        {o.totalRub}₽
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.status')}
                      </dt>
                      <dd className="text-white/90">{o.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.locale')}
                      </dt>
                      <dd className="text-white/90">{o.locale}</dd>
                    </div>
                    {o.notes ? (
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase text-white/40">
                          {t('admin.notes')}
                        </dt>
                        <dd className="text-white/80">{o.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/45">
                    {t('admin.items')}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-white/75">
                    {o.items.map((it) => (
                      <li key={it.id}>
                        {itemName(it)} ×{it.qty} — {it.unitPriceRub * it.qty}₽
                        <span className="ml-2 text-xs text-white/35">
                          ({it.kind} #{it.refId})
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}
