import { useLanguage } from '../i18n/LanguageContext'

/** Піксельна «Y» + напис YTRomaX у стилі бренду (без асетів Mojang) */
export function Logo() {
  const { t } = useLanguage()

  return (
    <a
      href="#top"
      className="flex min-w-0 items-center gap-2.5 sm:gap-3"
      aria-label={t('logo.aria')}
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        className="shrink-0"
        aria-hidden
      >
        <rect width="44" height="44" rx="4" fill="#1e40af" />
        <path
          fill="#3b82f6"
          d="M4 4h6v2H4V4zm30 0h6v6h-2V6h-4V4zM4 34v6h6v-2H6v-4H4zm34 0v4h-4v2h6v-6h-2z"
        />
        <g fill="#fff">
          <rect x="18" y="10" width="8" height="4" />
          <rect x="14" y="14" width="6" height="4" />
          <rect x="24" y="14" width="6" height="4" />
          <rect x="10" y="18" width="6" height="4" />
          <rect x="28" y="18" width="6" height="4" />
          <rect x="18" y="22" width="8" height="16" />
        </g>
      </svg>
      <span
        className="min-w-0 truncate text-[11px] leading-tight tracking-tight text-white sm:text-[13px]"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        YTRomaX
      </span>
    </a>
  )
}
