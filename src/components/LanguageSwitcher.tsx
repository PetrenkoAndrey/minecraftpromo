import { useLanguage } from '../i18n/LanguageContext'
import type { Locale } from '../i18n/translations'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage()

  const btn = (l: Locale, label: string) => (
    <button
      type="button"
      onClick={() => setLocale(l)}
      className={`min-w-[2.5rem] rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition sm:min-w-[2.75rem] sm:px-3 sm:text-[13px] ${
        locale === l
          ? 'bg-[#3b82f6] text-white shadow-[0_0_12px_rgba(59,130,246,0.35)]'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      }`}
      aria-pressed={locale === l}
    >
      {label}
    </button>
  )

  return (
    <div
      className="flex items-center rounded-lg border border-white/15 bg-black/40 p-0.5"
      role="group"
      aria-label={t('lang.aria')}
    >
      {btn('uk', t('lang.uk'))}
      {btn('ru', t('lang.ru'))}
    </div>
  )
}
