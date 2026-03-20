'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { products as seedProducts } from '@/data/products'
import { brands as seedBrands } from '@/data/brands'
import type { Brand, Product } from '@/types'
import type { AdminRole, OrderStatus, SiteContent, StoreOrder, StoreOrderItem } from '@/types/store'
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  deleteBrandBySlugRemote,
  deleteProductRemote,
  ensureSiteContentRow,
  fetchAllFromSupabase,
  insertBrandRemote,
  insertOrderRemote,
  insertProductRemote,
  resolveBrandIdByName,
  seedSupabaseIfEmpty,
  updateBrandBySlugRemote,
  updateOrderStatusRemote,
  updateProductRemote,
  upsertSiteContentRemote,
} from '@/lib/supabase/operations'

export type { OrderStatus, StoreOrder, StoreOrderItem, SiteContent, AdminRole } from '@/types/store'

const DEFAULT_SITE_CONTENT: SiteContent = {
  navbarLogoUrl: '/Logo.png',
  heroLogoUrl: '/Logo.png',
  heroTitle: 'Perfumes',
  heroSubtitle: 'Tendencia RD',
  heroDescription:
    'Descubre fragancias que definen momentos, crean recuerdos y expresan tu esencia unica. Lujo, elegancia y sofisticacion en cada gota.',
  storyImageUrl:
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop',
}

interface StoreContextValue {
  products: Product[]
  brands: Brand[]
  orders: StoreOrder[]
  siteContent: SiteContent
  /** true mientras carga datos remotos por primera vez */
  storeLoading: boolean
  useRemote: boolean
  isAdminAuthenticated: boolean
  adminRole: AdminRole
  loginAdmin: (username: string, password: string) => boolean
  loginAsRole: (role: Exclude<AdminRole, null>) => void
  logoutAdmin: () => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addBrand: (brand: Brand) => void
  updateBrand: (slug: string, patch: Partial<Brand>) => void
  deleteBrand: (slug: string) => void
  addOrder: (
    input: Omit<StoreOrder, 'id' | 'createdAt' | 'status' | 'stockApplied'>
  ) => Promise<StoreOrder>
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updateSiteContent: (patch: Partial<SiteContent>) => void
  resetSiteContent: () => void
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined)

const KEYS = {
  products: 'esencia-products',
  brands: 'esencia-brands',
  orders: 'esencia-orders',
  siteContent: 'esencia-site-content',
  adminAuth: 'esencia-admin-auth',
  adminRole: 'esencia-admin-role',
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const useRemote = isSupabaseConfigured()
  const supabaseRef = useRef<ReturnType<typeof getSupabaseBrowser>>(null)

  const [storeLoading, setStoreLoading] = useState(useRemote)
  const [products, setProducts] = useState<Product[]>(() => (useRemote ? [] : seedProducts))
  const [brands, setBrands] = useState<Brand[]>(() => (useRemote ? [] : seedBrands))
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminRole, setAdminRole] = useState<AdminRole>(null)

  // Carga inicial: Supabase o localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    supabaseRef.current = getSupabaseBrowser()

    const rawAuth = window.localStorage.getItem(KEYS.adminAuth)
    const rawRole = window.localStorage.getItem(KEYS.adminRole)
    if (rawAuth === 'true') setIsAdminAuthenticated(true)
    if (rawRole === 'admin' || rawRole === 'manager' || rawRole === 'viewer') {
      setAdminRole(rawRole)
    }

    if (!useRemote) {
      try {
        const rawProducts = window.localStorage.getItem(KEYS.products)
        const rawBrands = window.localStorage.getItem(KEYS.brands)
        const rawOrders = window.localStorage.getItem(KEYS.orders)
        const rawContent = window.localStorage.getItem(KEYS.siteContent)
        if (rawProducts) setProducts(JSON.parse(rawProducts))
        if (rawBrands) setBrands(JSON.parse(rawBrands))
        if (rawOrders) setOrders(JSON.parse(rawOrders))
        if (rawContent) {
          const parsed = JSON.parse(rawContent) as Partial<SiteContent> & { logoUrl?: string }
          const legacyLogo = parsed.logoUrl || DEFAULT_SITE_CONTENT.navbarLogoUrl
          setSiteContent({
            ...DEFAULT_SITE_CONTENT,
            ...parsed,
            navbarLogoUrl: parsed.navbarLogoUrl || legacyLogo,
            heroLogoUrl: parsed.heroLogoUrl || legacyLogo,
          })
        }
      } catch (e) {
        console.error('Error loading local store:', e)
      }
      setStoreLoading(false)
      return
    }

    const supabase = supabaseRef.current
    if (!supabase) {
      setStoreLoading(false)
      return
    }

    void (async () => {
      try {
        const seeded = await seedSupabaseIfEmpty(supabase, seedBrands, seedProducts)
        const all = await fetchAllFromSupabase(supabase)
        setBrands(seeded.brands.length ? seeded.brands : all.brands)
        setProducts(seeded.products.length ? seeded.products : all.products)
        setOrders(all.orders)
        const site = await ensureSiteContentRow(supabase, all.siteContent ?? DEFAULT_SITE_CONTENT)
        setSiteContent(site)
      } catch (err) {
        console.error('Supabase init error:', err)
        setProducts(seedProducts)
        setBrands(seedBrands)
      } finally {
        setStoreLoading(false)
      }
    })()
  }, [useRemote])

  // Persistencia local solo si no hay Supabase
  useEffect(() => {
    if (typeof window === 'undefined' || useRemote) return
    window.localStorage.setItem(KEYS.products, JSON.stringify(products))
  }, [products, useRemote])

  useEffect(() => {
    if (typeof window === 'undefined' || useRemote) return
    window.localStorage.setItem(KEYS.brands, JSON.stringify(brands))
  }, [brands, useRemote])

  useEffect(() => {
    if (typeof window === 'undefined' || useRemote) return
    window.localStorage.setItem(KEYS.orders, JSON.stringify(orders))
  }, [orders, useRemote])

  useEffect(() => {
    if (typeof window === 'undefined' || useRemote) return
    window.localStorage.setItem(KEYS.siteContent, JSON.stringify(siteContent))
  }, [siteContent, useRemote])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(KEYS.adminAuth, isAdminAuthenticated ? 'true' : 'false')
  }, [isAdminAuthenticated])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(KEYS.adminRole, adminRole ?? '')
  }, [adminRole])

  const loginAdmin = (username: string, password: string) => {
    const ok = username === 'admin' && password === 'admin290426'
    if (ok) {
      setIsAdminAuthenticated(true)
      setAdminRole('admin')
    }
    return ok
  }

  const loginAsRole = (role: Exclude<AdminRole, null>) => {
    setIsAdminAuthenticated(true)
    setAdminRole(role)
  }

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false)
    setAdminRole(null)
  }

  const adjustStockLocal = (items: StoreOrderItem[], direction: 1 | -1) => {
    setProducts((prev) =>
      prev.map((product) => {
        const item = items.find((it) => it.productId === product.id)
        if (!item) return product
        const nextStock = Math.max(0, product.stock + direction * item.quantity)
        const nextAvailability = nextStock === 0 ? 'agotado' : product.availability
        return { ...product, stock: nextStock, availability: nextAvailability }
      })
    )
  }

  const addProduct = (product: Product) => {
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      void (async () => {
        try {
          const bid = await resolveBrandIdByName(supabase, product.brand)
          const created = await insertProductRemote(supabase, product, bid)
          setProducts((prev) => [created, ...prev])
        } catch (e) {
          console.error(e)
          setProducts((prev) => [product, ...prev])
        }
      })()
      return
    }
    setProducts((prev) => [product, ...prev])
  }

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      void (async () => {
        try {
          let brandId: string | null | undefined
          if (patch.brand !== undefined) {
            brandId = await resolveBrandIdByName(supabase, patch.brand)
          }
          await updateProductRemote(supabase, id, patch, brandId)
        } catch (e) {
          console.error(e)
        }
      })()
    }
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      void deleteProductRemote(supabase, id).catch(console.error)
    }
  }

  const addBrand = (brand: Brand) => {
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      void (async () => {
        try {
          const created = await insertBrandRemote(supabase, brand)
          setBrands((prev) => [created, ...prev])
        } catch (e) {
          console.error(e)
          setBrands((prev) => [brand, ...prev])
        }
      })()
      return
    }
    setBrands((prev) => [brand, ...prev])
  }

  const updateBrand = (slug: string, patch: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((b) => (b.slug === slug ? { ...b, ...patch } : b))
    )
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      void updateBrandBySlugRemote(supabase, slug, patch).catch(console.error)
    }
  }

  const deleteBrand = (slug: string) => {
    setBrands((prev) => prev.filter((b) => b.slug !== slug))
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      void deleteBrandBySlugRemote(supabase, slug).catch(console.error)
    }
  }

  const addOrder: StoreContextValue['addOrder'] = async (input) => {
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      try {
        const created = await insertOrderRemote(supabase, input)
        setOrders((prev) => [created, ...prev])
        const all = await fetchAllFromSupabase(supabase)
        setProducts(all.products)
        return created
      } catch (e) {
        console.error(e)
        const fallback: StoreOrder = {
          ...input,
          id: `o-${Date.now().toString(36)}`,
          createdAt: new Date().toISOString(),
          status: 'en-curso',
          stockApplied: true,
        }
        adjustStockLocal(fallback.items, -1)
        setOrders((prev) => [fallback, ...prev])
        return fallback
      }
    }

    const order: StoreOrder = {
      ...input,
      id: `o-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: 'en-curso',
      stockApplied: true,
    }
    adjustStockLocal(order.items, -1)
    setOrders((prev) => [order, ...prev])
    return order
  }

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const supabase = supabaseRef.current
    setOrders((prev) => {
      const current = prev.find((o) => o.id === id)
      if (!current || current.status === status) return prev

      if (!useRemote) {
        if (status === 'cancelado' && current.stockApplied) {
          adjustStockLocal(current.items, 1)
        }
        if (current.status === 'cancelado' && status !== 'cancelado' && !current.stockApplied) {
          adjustStockLocal(current.items, -1)
        }
        const nextStockApplied = status === 'cancelado' ? false : true
        return prev.map((order) =>
          order.id === id ? { ...order, status, stockApplied: nextStockApplied } : order
        )
      }

      if (useRemote && supabase) {
        void updateOrderStatusRemote(supabase, id, status, current)
          .then(async () => {
            const all = await fetchAllFromSupabase(supabase)
            setProducts(all.products)
            setOrders(all.orders)
          })
          .catch(console.error)
      }

      const nextStockApplied = status === 'cancelado' ? false : true
      return prev.map((order) =>
        order.id === id ? { ...order, status, stockApplied: nextStockApplied } : order
      )
    })
  }

  const updateSiteContent = (patch: Partial<SiteContent>) => {
    setSiteContent((prev) => {
      const next = { ...prev, ...patch }
      const supabase = supabaseRef.current
      if (useRemote && supabase) {
        void upsertSiteContentRemote(supabase, next).catch(console.error)
      }
      return next
    })
  }

  const resetSiteContent = () => {
    setSiteContent(DEFAULT_SITE_CONTENT)
    const supabase = supabaseRef.current
    if (useRemote && supabase) {
      void upsertSiteContentRemote(supabase, DEFAULT_SITE_CONTENT).catch(console.error)
    }
  }

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      brands,
      orders,
      siteContent,
      storeLoading,
      useRemote,
      isAdminAuthenticated,
      adminRole,
      loginAdmin,
      loginAsRole,
      logoutAdmin,
      addProduct,
      updateProduct,
      deleteProduct,
      addBrand,
      updateBrand,
      deleteBrand,
      addOrder,
      updateOrderStatus,
      updateSiteContent,
      resetSiteContent,
    }),
    [products, brands, orders, siteContent, storeLoading, useRemote, isAdminAuthenticated, adminRole]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
