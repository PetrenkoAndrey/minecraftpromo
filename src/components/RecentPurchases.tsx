import { useLanguage } from '../i18n/LanguageContext'
import type { MessageKey } from '../i18n/translations'

const keys: MessageKey[] = [
  'recent.i1',
  'recent.i2',
  'recent.i3',
  'recent.i4',
  'recent.i5',
]
const mockNames = ['Steve_', 'AlexPro', 'Creeper_Kid', 'EnderGirl', 'Villager99']
const hues = [
  'from-slate-500 to-slate-700',
  'from-amber-600 to-amber-900',
  'from-cyan-600 to-cyan-900',
  'from-red-600 to-red-900',
  'from-emerald-600 to-emerald-900',
] as const

export function RecentPurchases() {
  const { t } = useLanguage()

  return (
    <section className="scroll-mt-24" aria-labelledby="purchases-heading">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121212] px-5 py-8 sm:px-10 sm:py-10">
        <h2
          id="purchases-heading"
          className="mb-8 text-center text-xl font-black uppercase tracking-wide sm:text-2xl"
        >
          <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]">
            {t('recent.title1')}
          </span>
          <span className="text-[#3b82f6] drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]">
            {t('recent.title2')}
          </span>
        </h2>

        <ul className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {keys.map((key, i) => (
            <li
              key={key}
              className="flex w-[100px] flex-col items-center text-center sm:w-[110px]"
            >
              <div
                className={`mb-2 h-14 w-14 rounded-lg bg-gradient-to-br ${hues[i]} shadow-lg shadow-black/50 ring-2 ring-white/10 sm:h-16 sm:w-16`}
                style={{ imageRendering: 'pixelated' }}
              />
              <p className="text-xs font-bold text-white">{mockNames[i]}</p>
              <span className="mt-1.5 inline-block max-w-full truncate rounded-full bg-[#3b82f6]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#3b82f6]">
                {t(key)}
              </span>
            </li>
          ))}
        </ul>

        <svg
          className="absolute bottom-4 left-4 h-10 w-10 text-white/20"
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden
        >
          <path d="M4 6h18v2H4V6zm0 4h22v14H4V10zm2 2v10h18V12H6zm4 16H4v2h8l-2-2z" />
          <path d="M22 4h6v6h-2V6h-4V4z" opacity="0.5" />
        </svg>
      </div>
    </section>
  )
}
