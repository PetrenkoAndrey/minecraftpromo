import { apiUrl } from './config'
import type { SiteSocial } from './settingsTypes'

export async function fetchSiteSettings(): Promise<SiteSocial> {
  const r = await fetch(apiUrl('/api/settings'))
  if (!r.ok) throw new Error('settings')
  const data = (await r.json()) as { social?: SiteSocial }
  if (!data.social) throw new Error('settings')
  return data.social
}
