import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Locale, MessageKey } from './translations'
import { translations } from './translations'

const STORAGE_KEY = 'ytromax-locale'

type Ctx = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: MessageKey) => string
}

const LanguageContext = createContext<Ctx | null>(null)

function readStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'ru' || v === 'uk') return v
  } catch {
    /* ignore */
  }
  return 'uk'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (key: MessageKey) => translations[locale][key] ?? translations.uk[key] ?? key,
    [locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale === 'ru' ? 'ru' : 'uk'
  }, [locale])

  useEffect(() => {
    const titleKey: MessageKey = 'doc.title'
    document.title = translations[locale][titleKey] ?? translations.uk[titleKey]
  }, [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
