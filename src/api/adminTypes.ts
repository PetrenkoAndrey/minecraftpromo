export type AdminOrderItem = {
  id: number
  kind: string
  refId: number
  nameUk: string
  nameRu: string
  unitPriceRub: number
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
  notes: string
  items: AdminOrderItem[]
}
