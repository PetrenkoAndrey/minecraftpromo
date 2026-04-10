import { apiUrl } from './config'
import type { OrderPayload, OrderResponse, ShopKit, ShopProduct } from './shopTypes'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Повтори, поки API піднімається після `npm run dev` (server стартує не миттєво). */
async function fetchResilient(
  url: string,
  init?: RequestInit,
  attempts = 12,
): Promise<Response> {
  let last: Error | null = null
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url, init)
      return r
    } catch (e) {
      last = e instanceof Error ? e : new Error(String(e))
      await sleep(250 + i * 100)
    }
  }
  throw last ?? new Error('fetch_failed')
}

export async function fetchProducts(): Promise<ShopProduct[]> {
  const r = await fetchResilient(apiUrl('/api/products'))
  if (!r.ok) throw new Error('products')
  const data = (await r.json()) as { products: ShopProduct[] }
  return data.products
}

export async function fetchKits(): Promise<ShopKit[]> {
  const r = await fetchResilient(apiUrl('/api/kits'))
  if (!r.ok) throw new Error('kits')
  const data = (await r.json()) as { kits: ShopKit[] }
  return data.kits
}

export async function createOrder(
  body: OrderPayload,
): Promise<OrderResponse> {
  const r = await fetchResilient(apiUrl('/api/orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await r.json()) as Partial<OrderResponse> & { error?: string }
  if (!r.ok) throw new Error(data.error || 'order_failed')
  return data as OrderResponse
}
