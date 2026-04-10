import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { fetchKits, fetchProducts } from '../../api/shopApi'
import type { CartLine, ShopKit, ShopProduct } from '../../api/shopTypes'
import { accentClasses } from './accentMap'
import { OrderModal } from './OrderModal'

type Tab = 'products' | 'kits'

function lineKey(kind: 'product' | 'kit', id: number) {
  return `${kind}-${id}`
}

export function ShopSection() {
  const { t, locale } = useLanguage()
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<ShopProduct[] | null>(null)
  const [kits, setKits] = useState<ShopKit[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(
    null,
  )
  const [selectedKit, setSelectedKit] = useState<ShopKit | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [qty, setQty] = useState(1)
  const [orderOpen, setOrderOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const [p, k] = await Promise.all([fetchProducts(), fetchKits()])
      setProducts(p)
      setKits(k)
      if (p[0]) setSelectedProduct(p[0])
      if (!p[0] && k[0]) {
        setTab('kits')
        setSelectedKit(k[0])
      }
    } catch {
      setLoadError(true)
      setProducts([])
      setKits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const name = useCallback(
    (p: { nameUk: string; nameRu: string }) =>
      locale === 'ru' ? p.nameRu : p.nameUk,
    [locale],
  )

  const desc = useCallback(
    (p: { descriptionUk: string; descriptionRu: string }) =>
      locale === 'ru' ? p.descriptionRu : p.descriptionUk,
    [locale],
  )

  const addToCart = useCallback(() => {
    if (tab === 'products' && selectedProduct) {
      const k = lineKey('product', selectedProduct.id)
      const q = Math.min(10, Math.max(1, qty))
      setCart((prev) => {
        const rest = prev.filter((x) => x.key !== k)
        return [
          ...rest,
          {
            key: k,
            kind: 'product',
            id: selectedProduct.id,
            qty: q,
            nameUk: selectedProduct.nameUk,
            nameRu: selectedProduct.nameRu,
            unitPriceRub: selectedProduct.priceRub,
          },
        ]
      })
    } else if (tab === 'kits' && selectedKit) {
      const k = lineKey('kit', selectedKit.id)
      const q = Math.min(10, Math.max(1, qty))
      setCart((prev) => {
        const rest = prev.filter((x) => x.key !== k)
        return [
          ...rest,
          {
            key: k,
            kind: 'kit',
            id: selectedKit.id,
            qty: q,
            nameUk: selectedKit.nameUk,
            nameRu: selectedKit.nameRu,
            unitPriceRub: selectedKit.priceRub,
          },
        ]
      })
    }
  }, [tab, selectedProduct, selectedKit, qty])

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((x) => x.key !== key))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = useMemo(
    () => cart.reduce((s, l) => s + l.unitPriceRub * l.qty, 0),
    [cart],
  )

  const selectListItem = (p: ShopProduct) => {
    setSelectedProduct(p)
    setSelectedKit(null)
    setQty(1)
  }

  const selectKitItem = (k: ShopKit) => {
    setSelectedKit(k)
    setSelectedProduct(null)
    setQty(1)
  }

  const detailProduct = tab === 'products' ? selectedProduct : null
  const detailKit = tab === 'kits' ? selectedKit : null

  return (
    <section id="shop" className="scroll-mt-24">
      <h2 className="mb-6 text-center text-2xl font-black uppercase italic tracking-tight sm:text-3xl md:text-4xl">
        <span className="text-white">{t('shop.title1')}</span>
        <span className="bg-gradient-to-r from-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent">
          {t('shop.title2')}
        </span>
      </h2>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-6">
        <div className="rounded-2xl border border-white/[0.06] bg-[#141414] p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setTab('products')
                if (products?.length)
                  setSelectedProduct((prev) => prev ?? products[0]!)
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === 'products'
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-white/5 text-white/50 hover:text-white/80'
              }`}
            >
              {t('shop.products')}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('kits')
                if (kits?.length) setSelectedKit((prev) => prev ?? kits[0]!)
              }}
              className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'kits'
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-white/5 text-white/50 hover:text-white/80'
              }`}
            >
              {t('shop.kits')}
              <span className="absolute -right-1 -top-1 rotate-12 rounded bg-red-500 px-1 text-[8px] font-bold text-white">
                {t('shop.deal')}
              </span>
            </button>
          </div>

          <p className="mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/50">
            {tab === 'products' ? t('shop.allProducts') : t('shop.allKits')}
            <span aria-hidden>⇅</span>
          </p>

          {loading ? (
            <p className="py-8 text-center text-sm text-white/45">
              {t('shop.loading')}
            </p>
          ) : loadError ? (
            <p className="py-6 text-center text-sm text-red-400/90">
              {t('shop.loadError')}
            </p>
          ) : tab === 'products' ? (
            <ul className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
              {(products ?? []).map((p) => {
                const ac = accentClasses(p.accent)
                const active = selectedProduct?.id === p.id
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => selectListItem(p)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        active
                          ? 'border-[#3b82f6]/60 bg-[#3b82f6]/10'
                          : 'border-white/[0.06] bg-black/30 hover:border-white/15 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span
                        className={`h-9 w-9 shrink-0 rounded-full ${ac.dot} opacity-90 ring-2 ring-white/10`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">
                          {name(p)}
                        </p>
                        <p className={`text-xs font-semibold ${ac.price}`}>
                          {t('rank.from')} {p.priceRub}₽
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <ul className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
              {(kits ?? []).map((k) => {
                const active = selectedKit?.id === k.id
                return (
                  <li key={k.id}>
                    <button
                      type="button"
                      onClick={() => selectKitItem(k)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        active
                          ? 'border-[#3b82f6]/60 bg-[#3b82f6]/10'
                          : 'border-white/[0.06] bg-black/30 hover:border-white/15 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] text-[10px] font-black text-white ring-2 ring-white/10">
                        K
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">{name(k)}</p>
                        <p className="text-xs font-semibold text-[#93c5fd]">
                          {t('rank.from')} {k.priceRub}₽
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-white/50">
              {t('shop.cartTitle')}
            </p>
            {cart.length === 0 ? (
              <p className="mt-2 text-xs text-white/35">{t('shop.cartEmpty')}</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {cart.map((l) => (
                  <li
                    key={l.key}
                    className="flex items-center justify-between gap-2 text-xs text-white/80"
                  >
                    <span className="truncate">
                      {name(l)} ×{l.qty}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 tabular-nums">
                      {l.unitPriceRub * l.qty}₽
                      <button
                        type="button"
                        onClick={() => removeLine(l.key)}
                        className="text-red-400 hover:underline"
                      >
                        {t('shop.remove')}
                      </button>
                    </span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-white">
                  <span>{t('shop.total')}</span>
                  <span>{cartTotal}₽</span>
                </li>
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => setOrderOpen(true)}
                className="rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-bold text-white transition enabled:hover:bg-[#2563eb] disabled:opacity-40"
              >
                {t('shop.checkout')}
              </button>
              {cart.length > 0 ? (
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                >
                  {t('shop.clearCart')}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-h-[280px] flex-col rounded-2xl border border-white/[0.06] bg-[#141414] p-6 sm:p-8">
          {loading ? (
            <p className="m-auto text-sm text-white/45">{t('shop.loading')}</p>
          ) : loadError ? (
            <p className="m-auto text-center text-sm text-red-400/90">
              {t('shop.loadError')}
            </p>
          ) : detailProduct ? (
            <>
              <div className="flex items-start gap-4">
                <span
                  className={`h-14 w-14 shrink-0 rounded-full ${accentClasses(detailProduct.accent).dot} ring-2 ring-white/10`}
                />
                <div>
                  <h3 className="text-xl font-black text-white">
                    {name(detailProduct)}
                  </h3>
                  <p
                    className={`mt-1 text-lg font-bold ${accentClasses(detailProduct.accent).price}`}
                  >
                    {t('rank.from')} {detailProduct.priceRub}₽
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {desc(detailProduct)}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <span>{t('shop.qty')}</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={qty}
                    onChange={(e) =>
                      setQty(
                        Math.min(
                          10,
                          Math.max(1, Number(e.target.value) || 1),
                        ),
                      )
                    }
                    className="w-16 rounded-lg border border-white/15 bg-black/50 px-2 py-1.5 text-center text-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={addToCart}
                  className="rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2563eb]"
                >
                  {t('shop.addToCart')}
                </button>
              </div>
            </>
          ) : detailKit ? (
            <>
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#a855f7] text-lg font-black text-white ring-2 ring-white/10">
                  K
                </span>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {name(detailKit)}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-[#93c5fd]">
                    {t('rank.from')} {detailKit.priceRub}₽
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {desc(detailKit)}
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/45">
                {t('shop.kitIncludes')}
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-white/70">
                {detailKit.items.map((it) => (
                  <li key={`${it.productId}-${it.qty}`}>
                    {locale === 'ru' ? it.nameRu : it.nameUk}
                    {it.qty > 1 ? ` ×${it.qty}` : ''}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <span>{t('shop.qty')}</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={qty}
                    onChange={(e) =>
                      setQty(
                        Math.min(
                          10,
                          Math.max(1, Number(e.target.value) || 1),
                        ),
                      )
                    }
                    className="w-16 rounded-lg border border-white/15 bg-black/50 px-2 py-1.5 text-center text-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={addToCart}
                  className="rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2563eb]"
                >
                  {t('shop.addToCart')}
                </button>
              </div>
            </>
          ) : (
            <p className="m-auto text-center text-sm text-white/45">
              {t('shop.pickItem')}
            </p>
          )}
        </div>
      </div>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        cart={cart}
        locale={locale}
        t={t}
        onOrdered={clearCart}
      />
    </section>
  )
}
