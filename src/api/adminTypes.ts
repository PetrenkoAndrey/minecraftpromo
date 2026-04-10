export type AdminOrderItem = {
  id: number
  kind: string
  refId: number
  nameUk: string
  nameRu: string
  unitPriceRub: number
  unitPriceUah: number
  qty: number
}

export type AdminOrder = {
  id: number
  createdAt: string
  status: string
  minecraftUsername: string
  contact: string
  locale: string
  totalRub: number
  totalUah: number
  notes: string
  adminNote: string
  promoId: number | null
  discountRub: number
  discountUah: number
  promoCodeSnapshot: string | null
  items: AdminOrderItem[]
}

export type AdminPromo = {
  id: number
  code: string
  discountPercent: number
  maxUsesTotal: number | null
  maxUsesPerUser: number | null
  validFrom: string | null
  validUntil: string | null
  minOrderRub: number
  minOrderUah: number
  active: boolean
  redemptionCount: number
  createdAt: string
}
