import { useLanguage } from '../i18n/LanguageContext'

type Props = {
  onCopyIp: () => void
  copied: boolean
  serverIp: string
  online: number
  maxPlayers: number
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

export function Hero({ onCopyIp, copied, serverIp, online, maxPlayers }: Props) {
  const { t } = useLanguage()
  const pct = Math.min(100, Math.round((online / maxPlayers) * 100))

  const copyLabel = copied
    ? t('hero.copyAria.copied')
    : `${t('hero.copyAria.copy')}: ${serverIp}`

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <h1 className="font-black uppercase leading-[1.05] tracking-tight">
            <span className="block text-3xl text-[#3b82f6] drop-shadow-[0_0_24px_rgba(59,130,246,0.35)] sm:text-4xl md:text-5xl">
              {t('hero.title1')}
            </span>
            <span className="mt-1 block text-2xl text-white sm:text-3xl md:text-4xl">
              {t('hero.title2')}
            </span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
            {t('hero.lead')}
          </p>

          <div className="mt-8">
            <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#3b82f6] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold tabular-nums text-white/80">
              <span className="text-[#3b82f6]">{online}</span>
              <span className="text-white/40"> / </span>
              <span>{maxPlayers}</span>
              <span className="ml-2 text-xs font-normal text-white/45">
                {t('hero.online')}
              </span>
            </p>
          </div>

          <div className="mt-8 flex max-w-md flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCopyIp}
              aria-label={copyLabel}
              className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow-lg shadow-black/30 transition hover:bg-white/95"
            >
              <span className="truncate font-mono text-[13px]">{serverIp}</span>
              <CopyIcon className="shrink-0 text-[#3b82f6]" />
            </button>
            {copied ? (
              <span className="text-xs font-medium text-[#3b82f6]">
                {t('hero.copied')}
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e3a5f] via-[#0f172a] to-[#1e1b4b] shadow-[0_0_60px_-12px_rgba(59,130,246,0.45)]"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(59,130,246,0.35),transparent_55%)]" />
          <div className="absolute left-[12%] top-[28%] h-32 w-24 rounded-sm border-2 border-white/20 bg-white/10 shadow-xl sm:h-40 sm:w-28" />
          <div className="absolute right-[14%] top-[22%] h-36 w-28 rounded-sm border-2 border-blue-400/40 bg-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.5)] sm:h-44 sm:w-32" />
          <div className="absolute bottom-[18%] left-1/2 h-1 w-[60%] -translate-x-1/2 rounded-full bg-[#3b82f6]/30 blur-sm" />
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-orange-400/80"
              style={{
                left: `${20 + (i * 7) % 60}%`,
                top: `${30 + (i * 11) % 45}%`,
                opacity: 0.4 + (i % 3) * 0.2,
              }}
            />
          ))}
          <p className="absolute bottom-4 left-4 right-4 text-center text-[10px] uppercase tracking-widest text-white/35">
            {t('hero.cardTags')}
          </p>
        </div>
      </div>
    </section>
  )
}
