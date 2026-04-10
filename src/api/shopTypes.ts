export type ShopProduct = {
  id: number
  slug: string
  nameUk: string
  nameRu: string
  descriptionUk: string
  descriptionRu: string
  priceRub: number
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
}

export type OrderPayload = {
  minecraftUsername: string
  contact: string
  locale: 'uk' | 'ru'
  notes?: string
  items: { kind: 'product' | 'kit'; id: number; qty: number }[]
}

export type OrderResponse = {
  orderId: number
  totalRub: number
  status: string
}
