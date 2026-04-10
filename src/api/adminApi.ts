import { apiUrl } from './config'
import type { AdminOrder } from './adminTypes'

export async function fetchAdminOrders(token: string): Promise<AdminOrder[]> {
  const r = await fetch(apiUrl('/api/admin/orders'), {
    headers: { 'X-Admin-Token': token.trim() },
  })
  let data: { orders?: AdminOrder[]; error?: string } = {}
  try {
    data = (await r.json()) as typeof data
  } catch {
    /* ignore */
  }
  if (r.status === 503 && data.error === 'admin_not_configured') {
    throw new Error('admin_not_configured')
  }
  if (r.status === 401) throw new Error('unauthorized')
  if (!r.ok) throw new Error(data.error || 'failed')
  return data.orders ?? []
}
