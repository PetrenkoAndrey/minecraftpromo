import { useCallback, useEffect, useState } from 'react'
import type { MessageKey } from '../../i18n/translations'
import type { SiteSocial } from '../../api/settingsTypes'
import { fetchAdminSettings, patchAdminSettings } from '../../api/adminApi'

type T = (key: MessageKey) => string

type Props = {
  jwt: string
  t: T
  onUnauthorized: () => void
}

const fields: { key: keyof SiteSocial; labelKey: MessageKey }[] = [
  { key: 'discord', labelKey: 'admin.socialDiscord' },
  { key: 'telegramDm', labelKey: 'admin.socialTelegramDm' },
  { key: 'telegramChannel', labelKey: 'admin.socialTelegramCh' },
  { key: 'tiktok', labelKey: 'admin.socialTiktok' },
  { key: 'youtube', labelKey: 'admin.socialYoutube' },
]

export function AdminSocialSettingsForm({ jwt, t, onUnauthorized }: Props) {
  const [form, setForm] = useState<SiteSocial | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const load = useCallback(async () => {
    setErr(null)
    setOk(false)
    try {
      const s = await fetchAdminSettings(jwt)
      setForm(s)
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      if (code === 'unauthorized') onUnauthorized()
      setErr(code)
      setForm(null)
    }
  }, [jwt, onUnauthorized])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    if (!form) return
    setBusy(true)
    setErr(null)
    setOk(false)
    try {
      const next = await patchAdminSettings(jwt, form)
      setForm(next)
      setOk(true)
      window.setTimeout(() => setOk(false), 4000)
    } catch (e) {
      const code = e instanceof Error ? e.message : 'failed'
      if (code === 'unauthorized') onUnauthorized()
      if (code === 'invalid_social') setErr('invalid_social')
      else setErr(code)
    } finally {
      setBusy(false)
    }
  }

  if (!form && err && err !== 'failed') {
    return (
      <p className="text-sm text-red-400">
        {t('admin.loadError')} ({err})
      </p>
    )
  }

  if (!form) {
    return <p className="text-sm text-white/50">{t('admin.loading')}</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-white/50">
        {t('admin.socialHint')}
      </p>

      {fields.map(({ key, labelKey }) => (
        <label key={key} className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
            {t(labelKey)}
          </span>
          <input
            type="url"
            value={form[key]}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, [key]: e.target.value } : prev,
              )
            }
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            placeholder="https://"
            autoComplete="off"
          />
        </label>
      ))}

      {err === 'invalid_social' ? (
        <p className="text-sm text-red-400">{t('admin.socialInvalid')}</p>
      ) : err ? (
        <p className="text-sm text-red-400">
          {t('admin.loadError')} ({err})
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2563eb] disabled:opacity-50"
        >
          {busy ? t('admin.socialSaving') : t('admin.socialSave')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void load()}
          className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          {t('admin.socialReload')}
        </button>
        {ok ? (
          <span className="text-sm font-medium text-emerald-400">
            {t('admin.socialSaved')}
          </span>
        ) : null}
      </div>
    </div>
  )
}
