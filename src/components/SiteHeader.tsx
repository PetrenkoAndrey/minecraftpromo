import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import {
  IconDiscord,
  IconTelegram,
  IconTikTok,
  IconYouTube,
} from './SocialIcons'
import { useLanguage } from '../i18n/LanguageContext'

type NavItem = { href: string; label: string }

type Props = {
  contacts: {
    telegram: string
    discord: string
    youtube: string
    tiktok: string
  }
}

const iconClass = 'h-[15px] w-[15px] shrink-0 sm:h-4 sm:w-4'

export function SiteHeader({ contacts }: Props) {
  const { t } = useLanguage()

  const main: NavItem[] = [
    { href: '#shop', label: t('nav.shop') },
    { href: '#forum', label: t('nav.forum') },
    { href: '#rules', label: t('nav.help') },
  ]

  const social: (NavItem & { icon: ReactNode })[] = [
    {
      href: contacts.telegram,
      label: 'Telegram',
      icon: <IconTelegram className={iconClass} />,
    },
    {
      href: contacts.discord,
      label: 'Discord',
      icon: <IconDiscord className={iconClass} />,
    },
    {
      href: contacts.youtube,
      label: 'YouTube',
      icon: <IconYouTube className={iconClass} />,
    },
    {
      href: contacts.tiktok,
      label: 'TikTok',
      icon: <IconTikTok className={iconClass} />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:gap-4">
          <Logo />
          <LanguageSwitcher />
        </div>
        <nav
          className="flex w-full flex-wrap items-center justify-end gap-x-4 gap-y-2 text-[13px] font-medium text-white/90 sm:w-auto sm:gap-x-7 sm:text-sm"
          aria-label={t('nav.aria')}
        >
          {main.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[#3b82f6]"
            >
              {item.label}
            </a>
          ))}
          <span className="hidden h-4 w-px bg-white/20 sm:inline" aria-hidden />
          {social.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[#3b82f6]"
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
