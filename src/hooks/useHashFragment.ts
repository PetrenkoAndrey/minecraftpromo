import { useEffect, useState } from 'react'

/** Наприклад `#admin` → `admin` */
export function useHashFragment(): string {
  const [frag, setFrag] = useState(() =>
    typeof window !== 'undefined'
      ? window.location.hash.replace(/^#/, '').split(/[?/]/)[0] ?? ''
      : '',
  )

  useEffect(() => {
    const sync = () =>
      setFrag(window.location.hash.replace(/^#/, '').split(/[?/]/)[0] ?? '')
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return frag
}
