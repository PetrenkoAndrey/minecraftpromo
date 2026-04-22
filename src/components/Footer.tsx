import { useLanguage } from '../i18n/LanguageContext'

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-white/10 px-4 py-10 text-center text-xs text-white/40 sm:px-6">
      <p>{t('footer.1')}</p>
      <p className="mt-2">{t('footer.2').replace('{year}', String(year))}</p>
      <p className="mt-4">
        <span>{t('footer.developedBy')} </span>
        <a
          href="https://t.me/andrey_petrenko27"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3b82f6]/90 underline-offset-2 hover:underline"
        >
          @andrey_petrenko27
        </a>
      </p>
      <p className="mt-3">
        <a
          href={`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}#admin`}
          className="text-[#3b82f6]/90 underline-offset-2 hover:underline"
        >
          {t('footer.adminLink')}
        </a>
      </p>
    </footer>
  )
}
