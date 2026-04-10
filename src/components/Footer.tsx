import { useLanguage } from '../i18n/LanguageContext'

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-white/10 px-4 py-10 text-center text-xs text-white/40 sm:px-6">
      <p>{t('footer.1')}</p>
      <p className="mt-2">{t('footer.2').replace('{year}', String(year))}</p>
    </footer>
  )
}
