import { useCallback, useEffect, useState } from 'react'
import type { MessageKey } from '../../i18n/translations'
import { useLanguage } from '../../i18n/LanguageContext'
import { LanguageSwitcher } from '../LanguageSwitcher'
import {
  adminLogin,
  fetchAdminOrders,
  patchAdminOrder,
} from '../../api/adminApi'
import type { AdminOrder } from '../../api/adminTypes'
import { AdminSocialSettingsForm } from './AdminSocialSettingsForm'
import { AdminPromoPanel } from './AdminPromoPanel'

const STORAGE_JWT = 'ytromax-admin-jwt'
const STORAGE_EMAIL = 'ytromax-admin-email'

type AdminTab = 'orders' | 'social' | 'promos'

const ORDER_STATUSES = [
  'pending',
  'paid',
  'fulfilled',
  'cancelled',
] as const

const STATUS_LABEL_KEYS: Record<
  (typeof ORDER_STATUSES)[number],
  MessageKey
> = {
  pending: 'admin.statusPending',
  paid: 'admin.statusPaid',
  fulfilled: 'admin.statusFulfilled',
  cancelled: 'admin.statusCancelled',
}

function OrderAdminNoteBlock({
  order,
  jwt,
  t,
  onDone,
  onUnauthorized,
}: {
  order: AdminOrder
  jwt: string
  t: (key: MessageKey) => string
  onDone: () => Promise<void>
  onUnauthorized: () => void
}) {
  const [text, setText] = useState(order.adminNote ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setText(order.adminNote ?? '')
  }, [order.id, order.adminNote])

  const save = async () => {
    setBusy(true)
    setErr(null)
    try {
      await patchAdminOrder(jwt, order.id, { adminNote: text })
      await onDone()
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      if (code === 'unauthorized') onUnauthorized()
      setErr(code)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-1 space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder={t('admin.orderNotePlaceholder')}
        className="w-full resize-y rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="rounded-lg border border-white/25 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white/90 hover:bg-white/10 disabled:opacity-50"
      >
        {busy ? t('admin.orderSavingNote') : t('admin.orderSaveNote')}
      </button>
      {err ? (
        <p className="text-xs text-red-400">
          {t('admin.loadError')} ({err})
        </p>
      ) : null}
    </div>
  )
}

export function AdminOrdersPanel() {
  const { t, locale } = useLanguage()
  const [tab, setTab] = useState<AdminTab>('orders')
  const [jwt, setJwt] = useState('')
  const [sessionEmail, setSessionEmail] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState<AdminOrder[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loginBusy, setLoginBusy] = useState(false)
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null)

  useEffect(() => {
    try {
      const j = sessionStorage.getItem(STORAGE_JWT) ?? ''
      const e = sessionStorage.getItem(STORAGE_EMAIL) ?? ''
      setJwt(j)
      setSessionEmail(e)
    } catch {
      /* ignore */
    }
  }, [])

  const persistSession = useCallback((token: string, em: string) => {
    setJwt(token)
    setSessionEmail(em)
    try {
      sessionStorage.setItem(STORAGE_JWT, token)
      sessionStorage.setItem(STORAGE_EMAIL, em)
    } catch {
      /* ignore */
    }
  }, [])

  const logout = useCallback(() => {
    setJwt('')
    setSessionEmail('')
    setOrders(null)
    setErr(null)
    setTab('orders')
    try {
      sessionStorage.removeItem(STORAGE_JWT)
      sessionStorage.removeItem(STORAGE_EMAIL)
    } catch {
      /* ignore */
    }
  }, [])

  const loadOrders = useCallback(async () => {
    if (!jwt.trim()) return
    setErr(null)
    setLoading(true)
    setOrders(null)
    try {
      const list = await fetchAdminOrders(jwt)
      setOrders(list)
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      setErr(code)
      if (code === 'unauthorized') logout()
    } finally {
      setLoading(false)
    }
  }, [jwt, logout])

  useEffect(() => {
    if (jwt.trim() && tab === 'orders') void loadOrders()
  }, [jwt, tab, loadOrders])

  const submitLogin = async () => {
    setErr(null)
    setLoginBusy(true)
    try {
      const res = await adminLogin(email.trim(), password)
      persistSession(res.token, res.email)
      setPassword('')
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      setErr(code)
    } finally {
      setLoginBusy(false)
    }
  }

  const handleStatusChange = async (orderId: number, status: string) => {
    setStatusBusyId(orderId)
    setErr(null)
    try {
      await patchAdminOrder(jwt, orderId, { status })
      await loadOrders()
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      setErr(code)
      if (code === 'unauthorized') logout()
    } finally {
      setStatusBusyId(null)
    }
  }

  const back = () => {
    window.location.hash = ''
  }

  const itemName = (o: { nameUk: string; nameRu: string }) =>
    locale === 'ru' ? o.nameRu : o.nameUk

  const loggedIn = Boolean(jwt.trim())

  const statusLabel = (s: string) => {
    if (ORDER_STATUSES.includes(s as (typeof ORDER_STATUSES)[number])) {
      return t(STATUS_LABEL_KEYS[s as (typeof ORDER_STATUSES)[number]])
    }
    return s
  }

  const tabBtn = (id: AdminTab, label: MessageKey) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
        tab === id
          ? 'bg-[#3b82f6] text-white'
          : 'border border-white/15 text-white/70 hover:bg-white/5'
      }`}
    >
      {t(label)}
    </button>
  )

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-black uppercase tracking-wide sm:text-2xl">
            {t('admin.panelTitle')}
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
          {!loggedIn ? (
            <>
              <p className="text-xs text-white/50">{t('admin.loginHint')}</p>
              <div className="mt-4 space-y-3">
                <label className="block text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    {t('admin.email')}
                  </span>
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    {t('admin.password')}
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
                  />
                </label>
                <button
                  type="button"
                  disabled={loginBusy || !email.trim() || !password}
                  onClick={() => void submitLogin()}
                  className="w-full rounded-lg bg-[#3b82f6] py-2.5 text-sm font-bold text-white enabled:hover:bg-[#2563eb] disabled:opacity-40 sm:w-auto sm:px-8"
                >
                  {loginBusy ? t('admin.loggingIn') : t('admin.login')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-sm text-white/70">
                  <span className="text-white/45">{t('admin.asUser')} </span>
                  <span className="font-medium text-[#93c5fd]">
                    {sessionEmail}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {tab === 'orders' ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void loadOrders()}
                      className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-bold text-white hover:bg-[#2563eb] disabled:opacity-50"
                    >
                      {loading ? t('admin.loading') : t('admin.load')}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
                  >
                    {t('admin.logout')}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tabBtn('orders', 'admin.tabOrders')}
                {tabBtn('social', 'admin.tabSocial')}
                {tabBtn('promos', 'admin.tabPromos')}
              </div>
            </>
          )}

          {err === 'bad_login' ? (
            <p className="mt-4 text-sm text-red-400">{t('admin.badLogin')}</p>
          ) : null}
          {err === 'unauthorized' ? (
            <p className="mt-4 text-sm text-red-400">
              {t('admin.sessionExpired')}
            </p>
          ) : null}
          {err === 'admin_not_configured' ? (
            <p className="mt-4 text-sm text-amber-400">
              {t('admin.notConfigured')}
            </p>
          ) : null}
          {err &&
          err !== 'bad_login' &&
          err !== 'unauthorized' &&
          err !== 'admin_not_configured' ? (
            <p className="mt-4 text-sm text-red-400">
              {t('admin.loadError')} ({err})
            </p>
          ) : null}

          {loggedIn && tab === 'social' ? (
            <div className="mt-8">
              <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-white/80">
                {t('admin.socialTitle')}
              </h2>
              <AdminSocialSettingsForm
                jwt={jwt}
                t={t}
                onUnauthorized={logout}
              />
            </div>
          ) : null}

          {loggedIn && tab === 'promos' ? (
            <AdminPromoPanel jwt={jwt} t={t} onUnauthorized={logout} />
          ) : null}

          {loggedIn && tab === 'orders' && orders && orders.length === 0 ? (
            <p className="mt-8 text-center text-sm text-white/45">
              {t('admin.noOrders')}
            </p>
          ) : null}

          {loggedIn && tab === 'orders' && orders && orders.length > 0 ? (
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
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.mcNick')}
                      </dt>
                      <dd className="font-medium text-white">
                        {o.minecraftUsername}
                      </dd>
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
                        {o.totalRub} ₽ · {o.totalUah} грн
                      </dd>
                    </div>
                    {o.promoCodeSnapshot ? (
                      <>
                        <div>
                          <dt className="text-xs uppercase text-white/40">
                            {t('admin.promoOnOrder')}
                          </dt>
                          <dd className="font-mono font-medium text-emerald-400/90">
                            {o.promoCodeSnapshot}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-white/40">
                            {t('admin.promoDiscountAmount')}
                          </dt>
                          <dd className="tabular-nums text-white/80">
                            −{o.discountRub} ₽ · −{o.discountUah} грн
                          </dd>
                        </div>
                      </>
                    ) : null}
                    <div>
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.locale')}
                      </dt>
                      <dd className="text-white/90">{o.locale}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.orderStatus')}
                      </dt>
                      <dd className="mt-1">
                        <select
                          value={
                            ORDER_STATUSES.includes(
                              o.status as (typeof ORDER_STATUSES)[number],
                            )
                              ? o.status
                              : 'pending'
                          }
                          disabled={statusBusyId === o.id}
                          onChange={(e) =>
                            void handleStatusChange(o.id, e.target.value)
                          }
                          className="w-full max-w-xs rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] disabled:opacity-50 sm:w-auto"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {t(STATUS_LABEL_KEYS[s])}
                            </option>
                          ))}
                        </select>
                        {!ORDER_STATUSES.includes(
                          o.status as (typeof ORDER_STATUSES)[number],
                        ) ? (
                          <span className="ml-2 text-xs text-amber-400">
                            ({statusLabel(o.status)})
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    {o.notes ? (
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase text-white/40">
                          {t('admin.notes')}
                        </dt>
                        <dd className="text-white/80">{o.notes}</dd>
                      </div>
                    ) : null}
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase text-white/40">
                        {t('admin.adminNote')}
                      </dt>
                      <dd>
                        <OrderAdminNoteBlock
                          order={o}
                          jwt={jwt}
                          t={t}
                          onDone={loadOrders}
                          onUnauthorized={logout}
                        />
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/45">
                    {t('admin.items')}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-white/75">
                    {o.items.map((it) => (
                      <li key={it.id}>
                        {itemName(it)} ×{it.qty} — {it.unitPriceRub * it.qty}{' '}
                        ₽ · {it.unitPriceUah * it.qty} грн
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
