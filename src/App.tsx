import { useCallback, useState, type ReactNode } from 'react'
import { SiteHeader } from './components/SiteHeader'
import { Hero } from './components/Hero'
import { SectionCard } from './components/SectionCard'
import { ShopSection } from './components/shop/ShopSection'
import { RecentPurchases } from './components/RecentPurchases'
import { Footer } from './components/Footer'
import {
  IconDiscord,
  IconTelegram,
  IconTelegramChannel,
  IconTikTok,
  IconYouTube,
} from './components/SocialIcons'
import { useLanguage } from './i18n/LanguageContext'
import { useHashFragment } from './hooks/useHashFragment'
import { AdminOrdersPanel } from './components/admin/AdminOrdersPanel'

const SERVER_IP = 'play.ytromax.example'
const ONLINE_PLAYERS = 819
const MAX_PLAYERS = 3000

const CONTACT_DISCORD = 'https://discordapp.com/users/romayt1005'
const CONTACT_TELEGRAM_DM = 'https://t.me/YTRomaX'
const CONTACT_TELEGRAM_CHANNEL = 'https://t.me/YTRomaX1005'
const CONTACT_TIKTOK = 'https://www.tiktok.com/@ytromax8605'
const CONTACT_YOUTUBE = 'https://www.youtube.com/@YTRomaX1005'

const headerSocial = {
  telegram: CONTACT_TELEGRAM_CHANNEL,
  discord: CONTACT_DISCORD,
  youtube: CONTACT_YOUTUBE,
  tiktok: CONTACT_TIKTOK,
}

function BookIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      className="shrink-0 text-[#3b82f6]"
      aria-hidden
    >
      <rect x="3" y="2" width="10" height="12" fill="currentColor" opacity="0.35" rx="1" />
      <rect x="4" y="3" width="8" height="10" fill="currentColor" opacity="0.2" />
      <path fill="#93c5fd" d="M5 5h6v1H5zm0 2h4v1H5zm0 2h5v1H5z" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      className="shrink-0 text-[#3b82f6]"
      aria-hidden
    >
      <path fill="currentColor" opacity="0.5" d="M1 3l5-1 4 2 5-2v11l-5 2-4-2-5 2z" />
      <path fill="currentColor" opacity="0.35" d="M6 2v11l4 2V5z" />
      <path fill="#93c5fd" d="M8 4h2v2H8z" />
    </svg>
  )
}

function PickaxeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      className="shrink-0 text-[#3b82f6]"
      aria-hidden
    >
      <path fill="#94a3b8" d="M2 14h3v2H2z" />
      <path fill="#78716c" d="M5 12h2v4H5z" />
      <path fill="#cbd5e1" d="M6 2l8 8-2 2L4 4z" />
    </svg>
  )
}

function ContactLink({
  href,
  children,
  icon,
}: {
  href: string
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/10 hover:text-[#93c5fd] sm:text-sm"
    >
      <span className="shrink-0 [&_svg]:block" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </a>
  )
}

export function App() {
  const hash = useHashFragment()
  if (hash === 'admin') {
    return <AdminOrdersPanel />
  }

  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const onCopyIp = useCallback(() => {
    void navigator.clipboard.writeText(SERVER_IP).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div id="top" className="min-h-screen bg-black text-white">
      <SiteHeader contacts={headerSocial} />

      <main className="relative mx-auto max-w-6xl">
        <Hero
          onCopyIp={onCopyIp}
          copied={copied}
          serverIp={SERVER_IP}
          online={ONLINE_PLAYERS}
          maxPlayers={MAX_PLAYERS}
        />

        <div className="flex flex-col gap-12 px-4 pb-4 sm:gap-14 sm:px-6">
          <ShopSection />
          <RecentPurchases />

          <SectionCard id="rules" title={t('rules.title')} icon={<BookIcon />}>
            <ul className="list-inside list-['▸_'] space-y-3 text-white/70">
              <li>{t('rules.r1')}</li>
              <li>{t('rules.r2')}</li>
              <li>{t('rules.r3')}</li>
              <li>{t('rules.r4')}</li>
            </ul>
          </SectionCard>

          <SectionCard id="world" title={t('world.title')} icon={<MapIcon />}>
            <p className="mb-3">{t('world.p1')}</p>
            <p className="text-white/45">
              {t('world.p2.before')}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#93c5fd]">
                SERVER_IP
              </code>
              {t('world.p2.after')}
              <code className="rounded bg-white/10 px-1.5 py-0.5">App.tsx</code>.
            </p>
          </SectionCard>

          <SectionCard id="forum" title={t('forum.title')} icon={<BookIcon />}>
            <p>{t('forum.p')}</p>
          </SectionCard>

          <SectionCard title={t('howto.title')} icon={<PickaxeIcon />}>
            <ol className="list-inside list-decimal space-y-2 text-white/70">
              <li>{t('howto.1')}</li>
              <li>{t('howto.2')}</li>
              <li>{t('howto.3')}</li>
              <li>{t('howto.4')}</li>
            </ol>
          </SectionCard>

          <section
            id="contacts"
            className="scroll-mt-24"
            aria-labelledby="contacts-heading"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-[#121212] px-5 py-8 sm:px-8 sm:py-10">
              <h2
                id="contacts-heading"
                className="mb-6 text-center text-lg font-black uppercase tracking-wide text-white sm:text-xl"
              >
                {t('contacts.title')}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ContactLink href={CONTACT_DISCORD} icon={<IconDiscord />}>
                  Discord
                </ContactLink>
                <ContactLink href={CONTACT_TELEGRAM_DM} icon={<IconTelegram />}>
                  {t('contact.telegramDm')}
                </ContactLink>
                <ContactLink
                  href={CONTACT_TELEGRAM_CHANNEL}
                  icon={<IconTelegramChannel />}
                >
                  {t('contact.telegramCh')}
                </ContactLink>
                <ContactLink href={CONTACT_TIKTOK} icon={<IconTikTok />}>
                  TikTok
                </ContactLink>
                <ContactLink href={CONTACT_YOUTUBE} icon={<IconYouTube />}>
                  YouTube
                </ContactLink>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </div>
  )
}
