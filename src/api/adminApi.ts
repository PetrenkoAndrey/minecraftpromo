import { apiUrl } from './config'
import type { AdminOrder, AdminPromo } from './adminTypes'
import type { SiteSocial } from './settingsTypes'

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ token: string; email: string }> {
  const r = await fetch(apiUrl('/api/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  let data: { token?: string; email?: string; error?: string } = {}
  try {
    data = (await r.json()) as typeof data
  } catch {
    /* ignore */
  }
  if (r.status === 503 && data.error === 'admin_not_configured') {
    throw new Error('admin_not_configured')
  }
  if (r.status === 401 || r.status === 400) throw new Error('bad_login')
  if (!r.ok) throw new Error(data.error || 'failed')
  if (!data.token) throw new Error('failed')
  return { token: data.token, email: data.email ?? email }
}

export async function fetchAdminOrders(jwt: string): Promise<AdminOrder[]> {
  const r = await fetch(apiUrl('/api/admin/orders'), {
    headers: { Authorization: `Bearer ${jwt.trim()}` },
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

export async function fetchAdminSettings(jwt: string): Promise<SiteSocial> {
  const r = await fetch(apiUrl('/api/admin/settings'), {
    headers: { Authorization: `Bearer ${jwt.trim()}` },
  })
  let data: { social?: SiteSocial; error?: string } = {}
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
  if (!data.social) throw new Error('failed')
  return data.social
}

export async function patchAdminSettings(
  jwt: string,
  social: SiteSocial,
): Promise<SiteSocial> {
  const r = await fetch(apiUrl('/api/admin/settings'), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${jwt.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ social }),
  })
  let data: { social?: SiteSocial; error?: string } = {}
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
  if (!data.social) throw new Error('failed')
  return data.social
}

export async function fetchAdminPromos(jwt: string): Promise<AdminPromo[]> {
  const r = await fetch(apiUrl('/api/admin/promos'), {
    headers: { Authorization: `Bearer ${jwt.trim()}` },
  })
  let data: { promos?: AdminPromo[]; error?: string } = {}
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
  return data.promos ?? []
}

export async function createAdminPromo(
  jwt: string,
  body: Record<string, unknown>,
): Promise<AdminPromo> {
  const r = await fetch(apiUrl('/api/admin/promos'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  let data: { promo?: AdminPromo; error?: string } = {}
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
  if (!data.promo) throw new Error('failed')
  return data.promo
}

export async function patchAdminPromo(
  jwt: string,
  id: number,
  body: Record<string, unknown>,
): Promise<AdminPromo> {
  const r = await fetch(apiUrl(`/api/admin/promos/${id}`), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${jwt.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  let data: { promo?: AdminPromo; error?: string } = {}
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
  if (!data.promo) throw new Error('failed')
  return data.promo
}

export async function patchAdminOrder(
  jwt: string,
  orderId: number,
  body: { status?: string; adminNote?: string },
): Promise<void> {
  const r = await fetch(apiUrl(`/api/admin/orders/${orderId}`), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${jwt.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  let data: { error?: string } = {}
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
}
