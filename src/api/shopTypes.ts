export type ShopProduct = {
  id: number
  slug: string
  nameUk: string
  nameRu: string
  descriptionUk: string
  descriptionRu: string
  priceRub: number
  priceUah: number
  accent: string
  sortOrder: number
}

export type KitItem = {
  productId: number
  qty: number
  nameUk: string
  nameRu: string
}

export type ShopKit = {
  id: number
  slug: string
  nameUk: string
  nameRu: string
  descriptionUk: string
  descriptionRu: string
  priceRub: number
  priceUah: number
  sortOrder: number
  items: KitItem[]
}

export type CartLine = {
  key: string
  kind: 'product' | 'kit'
  id: number
  qty: number
  nameUk: string
  nameRu: string
  unitPriceRub: number
  unitPriceUah: number
}

export type OrderPayload = {
  minecraftUsername: string
  contact: string
  locale: 'uk' | 'ru'
  notes?: string
  promoCode?: string
  items: { kind: 'product' | 'kit'; id: number; qty: number }[]
}

export type OrderResponse = {
  orderId: number
  totalRub: number
  totalUah: number
  subtotalRub: number
  subtotalUah: number
  discountRub: number
  discountUah: number
  promoCode: string | null
  status: string
}

export type PromoValidatePayload = {
  items: { kind: 'product' | 'kit'; id: number; qty: number }[]
  locale: 'uk' | 'ru'
  minecraftUsername: string
  promoCode: string
}

export type PromoValidateResponse = {
  ok: true
  discountPercent: number
  subtotalRub: number
  subtotalUah: number
  discountRub: number
  discountUah: number
  totalRub: number
  totalUah: number
}
