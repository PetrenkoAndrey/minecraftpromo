import { useLanguage } from '../i18n/LanguageContext'

const rankNames = ['IRON', 'GOLD', 'DELUXE', 'MASTER'] as const
const rankPrices = ['30₽', '90₽', '230₽', '540₽'] as const
const rankColors = [
  'text-emerald-400',
  'text-amber-400',
  'text-cyan-400',
  'text-red-400',
] as const
const rankDots = [
  'bg-emerald-400',
  'bg-amber-400',
  'bg-cyan-400',
  'bg-red-400',
] as const

export function ShopTeaser() {
  const { t } = useLanguage()

  return (
    <section id="shop" className="scroll-mt-24">
      <h2 className="mb-6 text-center text-2xl font-black uppercase italic tracking-tight sm:text-3xl md:text-4xl">
        <span className="text-white">{t('shop.title1')}</span>
        <span className="bg-gradient-to-r from-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent">
          {t('shop.title2')}
        </span>
      </h2>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-6">
        <div className="rounded-2xl border border-white/[0.06] bg-[#141414] p-4 sm:p-5">
          <div className="mb-3 flex gap-2">
            <span className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-bold text-white">
              {t('shop.products')}
            </span>
            <span className="relative rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/50">
              {t('shop.kits')}
              <span className="absolute -right-1 -top-1 rotate-12 rounded bg-red-500 px-1 text-[8px] font-bold text-white">
                {t('shop.deal')}
              </span>
            </span>
          </div>
          <p className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/50">
            {t('shop.allProducts')}
            <span aria-hidden>⇅</span>
          </p>
          <ul className="space-y-2">
            {rankNames.map((name, i) => (
              <li
                key={name}
                className="flex cursor-default items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-3 transition hover:border-white/15 hover:bg-white/[0.04]"
              >
                <span
                  className={`h-9 w-9 shrink-0 rounded-full ${rankDots[i]} opacity-90 ring-2 ring-white/10`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className={`text-xs font-semibold ${rankColors[i]}`}>
                    {t('rank.from')} {rankPrices[i]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#141414] p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#3b82f6]/50 text-[#3b82f6]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </div>
          <p className="max-w-sm text-sm font-semibold text-white">
            {t('shop.empty1')}
          </p>
          <p className="mt-2 max-w-xs text-xs text-white/45">{t('shop.empty2')}</p>
        </div>
      </div>
    </section>
  )
}
