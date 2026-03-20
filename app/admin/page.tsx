'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, type OrderStatus } from '@/hooks/storeContext'
import type { Availability, FragranceType, Gender, Product } from '@/types'

type AdminTab =
  | 'dashboard'
  | 'pedidos'
  | 'analiticas'
  | 'inventario'
  | 'marcas'
  | 'apariencia'
  | 'roles'

const GENDERS: Gender[] = ['masculino', 'femenino', 'unisex']
const FRAGRANCE_TYPES: FragranceType[] = [
  'eau de parfum',
  'eau de toilette',
  'eau de cologne',
  'parfum',
]
const AVAILABILITIES: Availability[] = ['disponible', 'agotado', 'próximamente']

export default function AdminPage() {
  const {
    products,
    brands,
    orders,
    siteContent,
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
    updateOrderStatus,
    updateSiteContent,
    resetSiteContent,
  } = useStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [analyticsDays, setAnalyticsDays] = useState<7 | 15 | 30>(7)
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryView, setInventoryView] = useState<'cards' | 'table'>('cards')
  const [inventoryFeaturedFilter, setInventoryFeaturedFilter] = useState<
    'all' | 'featured' | 'not-featured'
  >('all')
  const [inventoryAvailabilityFilter, setInventoryAvailabilityFilter] = useState<
    Availability | 'all'
  >('all')
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    slug: '',
    name: '',
    brand: '',
    price: 0,
    image: '',
    shortDescription: '',
    longDescription: '',
    category: 'fragancias',
    gender: 'unisex',
    olfactoryNotes: [],
    fragranceType: 'eau de parfum',
    stock: 0,
    availability: 'disponible',
    featured: false,
    new: false,
    bestSeller: false,
  })
  const [newBrand, setNewBrand] = useState({ name: '', slug: '', description: '' })

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
      reader.readAsDataURL(file)
    })

  const totalOrders = orders.length
  const inProgressOrders = useMemo(
    () => orders.filter((order) => order.status === 'en-curso').length,
    [orders]
  )
  const lowStock = useMemo(() => products.filter((product) => product.stock <= 2), [products])
  const totalStock = useMemo(
    () => products.reduce((acc, product) => acc + Math.max(0, product.stock), 0),
    [products]
  )
  const activeProducts = useMemo(
    () => products.filter((product) => product.availability !== 'agotado').length,
    [products]
  )
  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).length,
    [products]
  )
  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === 'entregado'),
    [orders]
  )
  const deliveredRevenue = useMemo(
    () => deliveredOrders.reduce((acc, order) => acc + order.total, 0),
    [deliveredOrders]
  )
  const deliveredUnits = useMemo(
    () =>
      deliveredOrders.reduce(
        (acc, order) => acc + order.items.reduce((itemsAcc, item) => itemsAcc + item.quantity, 0),
        0
      ),
    [deliveredOrders]
  )
  const deliveredOrdersInRange = useMemo(() => {
    const cutoff = Date.now() - analyticsDays * 24 * 60 * 60 * 1000
    return deliveredOrders.filter((order) => new Date(order.createdAt).getTime() >= cutoff)
  }, [deliveredOrders, analyticsDays])
  const deliveredRevenueInRange = useMemo(
    () => deliveredOrdersInRange.reduce((acc, order) => acc + order.total, 0),
    [deliveredOrdersInRange]
  )
  const previousDeliveredRevenueInRange = useMemo(() => {
    const now = Date.now()
    const rangeMs = analyticsDays * 24 * 60 * 60 * 1000
    const previousStart = now - rangeMs * 2
    const previousEnd = now - rangeMs
    return deliveredOrders
      .filter((order) => {
        const created = new Date(order.createdAt).getTime()
        return created >= previousStart && created < previousEnd
      })
      .reduce((acc, order) => acc + order.total, 0)
  }, [deliveredOrders, analyticsDays])
  const averageTicketInRange = useMemo(() => {
    if (deliveredOrdersInRange.length === 0) return 0
    return deliveredRevenueInRange / deliveredOrdersInRange.length
  }, [deliveredRevenueInRange, deliveredOrdersInRange])
  const deliveredRateInRange = useMemo(() => {
    const cutoff = Date.now() - analyticsDays * 24 * 60 * 60 * 1000
    const allInRange = orders.filter((order) => new Date(order.createdAt).getTime() >= cutoff)
    if (allInRange.length === 0) return 0
    return (deliveredOrdersInRange.length / allInRange.length) * 100
  }, [orders, deliveredOrdersInRange, analyticsDays])
  const topBrandsInRange = useMemo(() => {
    const cutoff = Date.now() - analyticsDays * 24 * 60 * 60 * 1000
    const counter = new Map<string, number>()
    orders
      .filter((order) => {
        const created = new Date(order.createdAt).getTime()
        return created >= cutoff && order.status !== 'cancelado'
      })
      .forEach((order) => {
        order.items.forEach((item) => {
          const matched = products.find((product) => product.id === item.productId)
          const brandName = matched?.brand || 'Sin marca'
          counter.set(brandName, (counter.get(brandName) || 0) + item.quantity)
        })
      })
    return Array.from(counter.entries())
      .map(([brand, qty]) => ({ brand, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)
  }, [orders, products, analyticsDays])
  const revenueTrendPct = useMemo(() => {
    if (previousDeliveredRevenueInRange <= 0) {
      return deliveredRevenueInRange > 0 ? 100 : 0
    }
    return (
      ((deliveredRevenueInRange - previousDeliveredRevenueInRange) /
        previousDeliveredRevenueInRange) *
      100
    )
  }, [deliveredRevenueInRange, previousDeliveredRevenueInRange])

  const salesByDay = useMemo(() => {
    const days: Array<{ key: string; label: string; total: number; orders: number }> = []
    const today = new Date()
    for (let i = analyticsDays - 1; i >= 0; i -= 1) {
      const date = new Date(today)
      date.setHours(0, 0, 0, 0)
      date.setDate(today.getDate() - i)
      const key = date.toISOString().slice(0, 10)
      const label = date.toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })
      days.push({ key, label, total: 0, orders: 0 })
    }

    const indexByKey = new Map(days.map((day, index) => [day.key, index]))
    deliveredOrdersInRange.forEach((order) => {
      const key = new Date(order.createdAt).toISOString().slice(0, 10)
      const index = indexByKey.get(key)
      if (index === undefined) return
      days[index].total += order.total
      days[index].orders += 1
    })
    return days
  }, [deliveredOrdersInRange, analyticsDays])
  const topSellersLastDays = useMemo(() => {
    const cutoff = Date.now() - analyticsDays * 24 * 60 * 60 * 1000
    const counter = new Map<string, { name: string; qty: number }>()

    orders
      .filter((order) => {
        const created = new Date(order.createdAt).getTime()
        return created >= cutoff && order.status !== 'cancelado'
      })
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = counter.get(item.productId)
          if (current) {
            current.qty += item.quantity
          } else {
            counter.set(item.productId, { name: item.name, qty: item.quantity })
          }
        })
      })

    return Array.from(counter.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8)
  }, [orders, analyticsDays])
  const filteredInventoryProducts = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase()
    return products.filter((product) => {
      const byQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query)
      const byFeatured =
        inventoryFeaturedFilter === 'all' ||
        (inventoryFeaturedFilter === 'featured' && product.featured) ||
        (inventoryFeaturedFilter === 'not-featured' && !product.featured)
      const byAvailability =
        inventoryAvailabilityFilter === 'all' ||
        product.availability === inventoryAvailabilityFilter
      return byQuery && byFeatured && byAvailability
    })
  }, [
    products,
    inventorySearch,
    inventoryFeaturedFilter,
    inventoryAvailabilityFilter,
  ])

  const canAccess = (target: AdminTab) => {
    if (adminRole === 'admin') return true
    if (adminRole === 'manager') {
      return target === 'dashboard' || target === 'pedidos' || target === 'analiticas'
    }
    if (adminRole === 'viewer') {
      return target === 'dashboard' || target === 'pedidos'
    }
    return false
  }

  const handleChangeTab = (target: AdminTab) => {
    if (canAccess(target)) setTab(target)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = loginAdmin(username.trim(), password)
    if (!ok) {
      setError('Credenciales invalidas.')
      return
    }
    setError('')
  }

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.brand || !newProduct.slug) return
    const normalizedBrand = newProduct.brand.trim()
    if (!normalizedBrand) return
    if (!brands.some((brand) => brand.name.toLowerCase() === normalizedBrand.toLowerCase())) {
      const autoSlug = normalizedBrand
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const uniqueSlug = brands.some((brand) => brand.slug === autoSlug)
        ? `${autoSlug}-${Date.now().toString(36)}`
        : autoSlug
      addBrand({
        name: normalizedBrand,
        slug: uniqueSlug || `marca-${Date.now().toString(36)}`,
        description: `Marca creada automaticamente desde inventario: ${normalizedBrand}.`,
      })
    }
    const created: Product = {
      id: `p-${Date.now().toString(36)}`,
      ...newProduct,
      brand: normalizedBrand,
      olfactoryNotes: [],
    }
    addProduct(created)
    setNewProduct({
      slug: '',
      name: '',
      brand: '',
      price: 0,
      image: '',
      shortDescription: '',
      longDescription: '',
      category: 'fragancias',
      gender: 'unisex',
      olfactoryNotes: [],
      fragranceType: 'eau de parfum',
      stock: 0,
      availability: 'disponible',
      featured: false,
      new: false,
      bestSeller: false,
    })
  }

  const handleCreateBrand = () => {
    if (!newBrand.name.trim() || !newBrand.slug.trim()) return
    if (brands.some((brand) => brand.slug === newBrand.slug.trim())) return
    addBrand({
      name: newBrand.name.trim(),
      slug: newBrand.slug.trim(),
      description: newBrand.description.trim(),
    })
    setNewBrand({ name: '', slug: '', description: '' })
  }

  const parsePriceInput = (rawValue: string) => {
    const normalized = rawValue.replace(/,/g, '').replace(/[^\d.]/g, '')
    if (!normalized) return 0
    const parsed = Number.parseFloat(normalized)
    if (Number.isNaN(parsed)) return 0
    return Math.max(0, parsed)
  }

  const parseStockInput = (rawValue: string) => {
    const normalized = rawValue.replace(/,/g, '').replace(/[^\d]/g, '')
    if (!normalized) return 0
    const parsed = Number.parseInt(normalized, 10)
    if (Number.isNaN(parsed)) return 0
    return Math.max(0, parsed)
  }

  const formatPriceInput = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value || 0)
  }

  const formatStockInput = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(Math.max(0, Math.trunc(value || 0)))
  }

  const handleNewProductImageUpload = async (file?: File | null) => {
    if (!file) return
    try {
      const imageDataUrl = await readFileAsDataUrl(file)
      setNewProduct((prev) => ({ ...prev, image: imageDataUrl }))
    } catch (error) {
      console.error(error)
    }
  }

  const handleAppearanceImageUpload = async (
    key: 'navbarLogoUrl' | 'heroLogoUrl' | 'storyImageUrl',
    file?: File | null
  ) => {
    if (!file) return
    try {
      const imageDataUrl = await readFileAsDataUrl(file)
      updateSiteContent({ [key]: imageDataUrl })
    } catch (error) {
      console.error(error)
    }
  }

  const handleExistingProductImageUpload = async (
    productId: string,
    file?: File | null
  ) => {
    if (!file) return
    try {
      const imageDataUrl = await readFileAsDataUrl(file)
      updateProduct(productId, { image: imageDataUrl })
    } catch (error) {
      console.error(error)
    }
  }

  if (!isAdminAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-16">
        <div className="mx-auto max-w-md border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-serif text-neutral-900">Panel Admin</h1>
          <p className="mb-6 text-sm text-neutral-600">
            Accede para gestionar inventario, contenedores del home y pedidos.
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              className="w-full border border-neutral-300 px-3 py-2"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="w-full border border-neutral-300 px-3 py-2"
              placeholder="Contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button className="w-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
              Iniciar sesion
            </button>
          </form>
          <Link href="/" className="mt-4 inline-block text-sm text-neutral-600 underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-neutral-100 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-neutral-200 bg-white/95 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-serif text-neutral-900">Panel Administrativo</h1>
            <p className="text-sm text-neutral-600">
              Gestion total de tienda y contenido. Rol actual:{' '}
              <strong>{adminRole ?? 'sin rol'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm transition hover:bg-neutral-50">
              Ver tienda
            </Link>
            <button
              onClick={logoutAdmin}
              className="rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm text-white transition hover:opacity-90"
            >
              Cerrar sesion
            </button>
          </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard label="Productos" value={String(products.length)} />
          <StatCard label="Pedidos totales" value={String(totalOrders)} />
          <StatCard label="Pedidos en curso" value={String(inProgressOrders)} />
        </div>

        <div className="sticky top-20 z-20 rounded-xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'pedidos', label: 'Pedidos' },
            { key: 'analiticas', label: 'Analiticas' },
            { key: 'inventario', label: 'Inventario' },
            { key: 'marcas', label: 'Marcas' },
            { key: 'apariencia', label: 'Apariencia' },
            { key: 'roles', label: 'Roles' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleChangeTab(item.key as AdminTab)}
              disabled={!canAccess(item.key as AdminTab)}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                tab === item.key
                  ? 'bg-neutral-900 text-white shadow'
                  : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              } ${!canAccess(item.key as AdminTab) ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <section className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <StatCard label="Productos" value={String(products.length)} />
              <StatCard label="Pedidos" value={String(totalOrders)} />
              <StatCard label="Stock total" value={String(totalStock)} />
              <StatCard label="Destacados Home" value={String(featuredProducts)} />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <QuickCard
                title="Pedidos"
                desc="Ver pendientes y existentes"
                emoji="📦"
                onClick={() => handleChangeTab('pedidos')}
              />
              <QuickCard
                title="Analiticas"
                desc="Stock y productos por agotarse"
                emoji="📊"
                onClick={() => handleChangeTab('analiticas')}
              />
              <QuickCard
                title="Inventario"
                desc="Editar productos y visibilidad"
                emoji="🛍️"
                onClick={() => handleChangeTab('inventario')}
              />
              <QuickCard
                title="Marcas"
                desc="Agregar y editar marcas"
                emoji="🏷️"
                onClick={() => handleChangeTab('marcas')}
              />
              <QuickCard
                title="Roles"
                desc="Gestion de permisos"
                emoji="🔐"
                onClick={() => handleChangeTab('roles')}
              />
            </div>
          </section>
        )}

        {tab === 'analiticas' && (
          <section className="space-y-4">
            {!canAccess('analiticas') ? (
              <AccessDenied />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Resumen Analitico</h2>
                    <p className="text-sm text-neutral-500">
                      Rendimiento comercial, inventario y tendencias de venta.
                    </p>
                  </div>
                  <div className="inline-flex overflow-hidden rounded-lg border border-neutral-300">
                    {[7, 15, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => setAnalyticsDays(days as 7 | 15 | 30)}
                        className={`px-3 py-1.5 text-xs transition ${
                          analyticsDays === days
                            ? 'bg-neutral-900 text-white'
                            : 'bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {days} dias
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard label="Productos" value={String(products.length)} />
                  <StatCard label="Activos" value={String(activeProducts)} />
                  <StatCard label="Stock total" value={String(totalStock)} />
                  <StatCard label="Bajo stock" value={String(lowStock.length)} />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <StatCard
                    label={`Ingresos entregados (${analyticsDays}d)`}
                    value={`RD$ ${deliveredRevenueInRange.toLocaleString()}`}
                  />
                  <StatCard
                    label="Ingresos entregados (total)"
                    value={`RD$ ${deliveredRevenue.toLocaleString()}`}
                  />
                  <StatCard
                    label="Ventas entregadas (unidades)"
                    value={String(deliveredUnits)}
                  />
                  <StatCard
                    label="Ticket promedio"
                    value={`RD$ ${Math.round(averageTicketInRange).toLocaleString()}`}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <StatCard
                    label="Ratio entregado"
                    value={`${deliveredRateInRange.toFixed(1)}%`}
                  />
                  <StatCard
                    label="Crecimiento vs periodo anterior"
                    value={`${revenueTrendPct >= 0 ? '+' : ''}${revenueTrendPct.toFixed(1)}%`}
                  />
                  <StatCard
                    label={`Pedidos entregados (${analyticsDays}d)`}
                    value={String(deliveredOrdersInRange.length)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-neutral-900">Stock por producto</h3>
                    <div className="space-y-2">
                      {products.slice(0, 12).map((product) => {
                        const max = Math.max(1, ...products.map((p) => p.stock))
                        const width = Math.max(4, (product.stock / max) * 100)
                        return (
                          <div key={product.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="truncate text-neutral-700">{product.name}</span>
                              <span className="text-neutral-500">Stock: {product.stock}</span>
                            </div>
                            <div className="h-2 rounded-full bg-neutral-200">
                              <div
                                className="h-2 rounded-full bg-neutral-900 transition-all duration-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold text-neutral-900">
                      Proximos a agotarse (2 o menos)
                    </h3>
                    {lowStock.length === 0 ? (
                      <p className="text-sm text-neutral-500">No hay productos en bajo stock.</p>
                    ) : (
                      <ul className="space-y-2">
                        {lowStock.map((product) => (
                          <li
                            key={product.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{product.name}</span>
                            <span className="text-neutral-500">Stock: {product.stock}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 font-semibold text-neutral-900">
                    Evolucion diaria de ventas entregadas
                  </h3>
                  {salesByDay.every((day) => day.total === 0) ? (
                    <p className="text-sm text-neutral-500">
                      No hay pedidos entregados en los ultimos {analyticsDays} dias.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {salesByDay.map((day) => {
                        const max = Math.max(1, ...salesByDay.map((d) => d.total))
                        const width = Math.max(3, (day.total / max) * 100)
                        return (
                          <div key={day.key} className="grid grid-cols-[90px_1fr_110px] items-center gap-2">
                            <span className="text-xs text-neutral-600">{day.label}</span>
                            <div className="h-2 rounded-full bg-neutral-200">
                              <div
                                className="h-2 rounded-full bg-neutral-900 transition-all duration-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <span className="text-right text-xs text-neutral-600">
                              RD$ {day.total.toLocaleString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-neutral-900">
                      Perfumes mas vendidos (ultimos dias)
                    </h3>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                      Top {topSellersLastDays.length}
                    </span>
                  </div>
                  {topSellersLastDays.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No hay ventas registradas en los ultimos {analyticsDays} dias.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {topSellersLastDays.map((item) => {
                        const max = topSellersLastDays[0]?.qty || 1
                        const width = Math.max(8, (item.qty / max) * 100)
                        return (
                          <div key={item.productId} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="truncate text-neutral-700">{item.name}</span>
                              <span className="text-neutral-500">{item.qty} vendidos</span>
                            </div>
                            <div className="h-2 rounded-full bg-neutral-200">
                              <div
                                className="h-2 rounded-full bg-neutral-900 transition-all duration-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 font-semibold text-neutral-900">
                    Marcas con mayor salida
                  </h3>
                  {topBrandsInRange.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No hay datos de marcas en los ultimos {analyticsDays} dias.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {topBrandsInRange.map((brand) => {
                        const max = topBrandsInRange[0]?.qty || 1
                        const width = Math.max(8, (brand.qty / max) * 100)
                        return (
                          <div key={brand.brand} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="truncate text-neutral-700">{brand.brand}</span>
                              <span className="text-neutral-500">{brand.qty} uds</span>
                            </div>
                            <div className="h-2 rounded-full bg-neutral-200">
                              <div
                                className="h-2 rounded-full bg-neutral-700 transition-all duration-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'inventario' && (
          <section className="space-y-5">
            {!canAccess('inventario') ? (
              <AccessDenied />
            ) : (
              <>
            <div className="border border-neutral-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <input
                  className="border border-neutral-300 px-3 py-2"
                  placeholder="Buscar por nombre, marca o slug"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                />
                <select
                  className="border border-neutral-300 px-3 py-2"
                  value={inventoryFeaturedFilter}
                  onChange={(e) =>
                    setInventoryFeaturedFilter(
                      e.target.value as 'all' | 'featured' | 'not-featured'
                    )
                  }
                >
                  <option value="all">Todos los destacados</option>
                  <option value="featured">Solo destacados</option>
                  <option value="not-featured">Solo no destacados</option>
                </select>
                <select
                  className="border border-neutral-300 px-3 py-2"
                  value={inventoryAvailabilityFilter}
                  onChange={(e) =>
                    setInventoryAvailabilityFilter(e.target.value as Availability | 'all')
                  }
                >
                  <option value="all">Todas las disponibilidades</option>
                  {AVAILABILITIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <div className="inline-flex overflow-hidden border border-neutral-300">
                  <button
                    onClick={() => setInventoryView('cards')}
                    className={`px-3 py-2 text-sm ${
                      inventoryView === 'cards'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-700'
                    }`}
                  >
                    Tarjetas
                  </button>
                  <button
                    onClick={() => setInventoryView('table')}
                    className={`px-3 py-2 text-sm ${
                      inventoryView === 'table'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-700'
                    }`}
                  >
                    Tabla
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Mostrando {filteredInventoryProducts.length} de {products.length} productos.
              </p>
            </div>
            <div className="border border-neutral-200 bg-white p-4">
              <h2 className="mb-3 text-xl font-serif text-neutral-900">Agregar perfume</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                <input
                  className="border border-neutral-300 px-3 py-2"
                  placeholder="Slug"
                  value={newProduct.slug}
                  onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                />
                <input
                  className="border border-neutral-300 px-3 py-2"
                  placeholder="Nombre"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  className="border border-neutral-300 px-3 py-2"
                  placeholder="Marca"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  list="admin-brand-options"
                />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-600">Precio (RD$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full border border-neutral-300 px-3 py-2"
                    placeholder="0"
                    value={formatPriceInput(newProduct.price)}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: parsePriceInput(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-600">
                    Stock (unidades)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full border border-neutral-300 px-3 py-2"
                    placeholder="0"
                    value={formatStockInput(newProduct.stock)}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: parseStockInput(e.target.value) })
                    }
                  />
                </div>
                <label className="inline-flex items-center justify-center border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                  Subir imagen desde mi equipo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handleNewProductImageUpload(e.target.files?.[0])
                    }}
                  />
                </label>
                <input
                  className="border border-neutral-300 px-3 py-2 md:col-span-2"
                  placeholder="Descripcion corta"
                  value={newProduct.shortDescription}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, shortDescription: e.target.value })
                  }
                />
                <textarea
                  className="border border-neutral-300 px-3 py-2 md:col-span-2 lg:col-span-3"
                  placeholder="Descripcion larga"
                  value={newProduct.longDescription}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, longDescription: e.target.value })
                  }
                />
                <select
                  className="border border-neutral-300 px-3 py-2"
                  value={newProduct.gender}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, gender: e.target.value as Gender })
                  }
                >
                  {GENDERS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 px-3 py-2"
                  value={newProduct.fragranceType}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      fragranceType: e.target.value as FragranceType,
                    })
                  }
                >
                  {FRAGRANCE_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 px-3 py-2"
                  value={newProduct.availability}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      availability: e.target.value as Availability,
                    })
                  }
                >
                  {AVAILABILITIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newProduct.featured}
                    onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                  />
                  Destacado
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newProduct.bestSeller}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, bestSeller: e.target.checked })
                    }
                  />
                  Mas vendido
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newProduct.new}
                    onChange={(e) => setNewProduct({ ...newProduct, new: e.target.checked })}
                  />
                  Nuevo
                </label>
              </div>
              <button
                onClick={handleCreateProduct}
                className="mt-4 bg-neutral-900 px-4 py-2 text-sm text-white"
              >
                Guardar producto
              </button>
            </div>

            {inventoryView === 'cards' ? (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredInventoryProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded object-cover border border-neutral-200 bg-neutral-100"
                          />
                          <p className="font-semibold text-neutral-900">
                            {product.brand} {product.name}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                              product.featured
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {product.featured ? 'Destacado' : 'Normal'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="rounded border border-red-200 px-3 py-1 text-xs text-red-700 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                        <input
                          className="border border-neutral-300 px-2 py-1"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                        />
                        <input
                          className="border border-neutral-300 px-2 py-1"
                          value={product.brand}
                          onChange={(e) => updateProduct(product.id, { brand: e.target.value })}
                          list="admin-brand-options"
                        />
                        <div className="space-y-1">
                          <label className="block text-[11px] font-medium text-neutral-500">
                            Precio (RD$)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="w-full border border-neutral-300 px-2 py-1"
                            value={formatPriceInput(product.price)}
                            onChange={(e) =>
                              updateProduct(product.id, { price: parsePriceInput(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-medium text-neutral-500">
                            Stock (unidades)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="w-full border border-neutral-300 px-2 py-1"
                            value={formatStockInput(product.stock)}
                            onChange={(e) =>
                              updateProduct(product.id, { stock: parseStockInput(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input
                          className="border border-neutral-300 px-2 py-1"
                          value={product.image}
                          onChange={(e) => updateProduct(product.id, { image: e.target.value })}
                        />
                        <select
                          className="border border-neutral-300 px-2 py-1"
                          value={product.availability}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              availability: e.target.value as Availability,
                            })
                          }
                        >
                          {AVAILABILITIES.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <label className="inline-flex items-center justify-center border border-dashed border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 md:col-span-2">
                          Subir imagen local para este producto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              void handleExistingProductImageUpload(
                                product.id,
                                e.target.files?.[0]
                              )
                            }}
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => updateProduct(product.id, { featured: true })}
                          className="rounded border border-neutral-900 bg-neutral-900 px-3 py-1 text-xs text-white transition hover:opacity-90"
                        >
                          Agregar a Perfumes Destacados
                        </button>
                        <button
                          onClick={() => updateProduct(product.id, { featured: false })}
                          className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 transition hover:bg-neutral-50"
                        >
                          Quitar de Perfumes Destacados
                        </button>
                        <button
                          onClick={() =>
                            updateProduct(product.id, {
                              availability: product.availability === 'agotado' ? 'disponible' : 'agotado',
                            })
                          }
                          className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 transition hover:bg-neutral-50"
                        >
                          {product.availability === 'agotado' ? 'Marcar disponible' : 'Marcar agotado'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-100 text-neutral-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Imagen</th>
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-left">Marca</th>
                      <th className="px-3 py-2 text-left">Precio</th>
                      <th className="px-3 py-2 text-left">Stock</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-left">Destacado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventoryProducts.map((product) => (
                      <tr key={product.id} className="border-t">
                        <td className="px-3 py-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover border border-neutral-200 bg-neutral-100"
                          />
                        </td>
                        <td className="px-3 py-2">{product.name}</td>
                        <td className="px-3 py-2">{product.brand}</td>
                        <td className="px-3 py-2">RD$ {product.price.toLocaleString()}</td>
                        <td className="px-3 py-2">{product.stock}</td>
                        <td className="px-3 py-2">{product.availability}</td>
                        <td className="px-3 py-2">{product.featured ? 'Si' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </>
            )}
          </section>
        )}

        {tab === 'marcas' && (
          <section className="space-y-4">
            {!canAccess('marcas') ? (
              <AccessDenied />
            ) : (
              <>
                <div className="border border-neutral-200 bg-white p-4">
                  <h2 className="mb-3 text-xl font-serif text-neutral-900">Agregar marca</h2>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input
                      className="border border-neutral-300 px-3 py-2"
                      placeholder="Nombre de marca"
                      value={newBrand.name}
                      onChange={(e) => setNewBrand((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      className="border border-neutral-300 px-3 py-2"
                      placeholder="Slug (ej: jean-paul-gaultier)"
                      value={newBrand.slug}
                      onChange={(e) => setNewBrand((prev) => ({ ...prev, slug: e.target.value }))}
                    />
                    <textarea
                      className="border border-neutral-300 px-3 py-2 md:col-span-2"
                      placeholder="Descripcion de la marca"
                      value={newBrand.description}
                      onChange={(e) =>
                        setNewBrand((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    onClick={handleCreateBrand}
                    className="mt-3 bg-neutral-900 px-4 py-2 text-sm text-white"
                  >
                    Guardar marca
                  </button>
                </div>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <div key={brand.slug} className="border border-neutral-200 bg-white p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-neutral-900">{brand.name}</p>
                        <button
                          onClick={() => deleteBrand(brand.slug)}
                          className="border border-red-200 px-3 py-1 text-xs text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input
                          className="border border-neutral-300 px-3 py-2"
                          value={brand.name}
                          onChange={(e) =>
                            updateBrand(brand.slug, {
                              name: e.target.value,
                            })
                          }
                        />
                        <input
                          className="border border-neutral-300 px-3 py-2"
                          value={brand.slug}
                          onChange={(e) =>
                            updateBrand(brand.slug, {
                              slug: e.target.value,
                            })
                          }
                        />
                        <textarea
                          className="border border-neutral-300 px-3 py-2 md:col-span-2"
                          value={brand.description}
                          onChange={(e) =>
                            updateBrand(brand.slug, {
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'apariencia' && (
          <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            {!canAccess('apariencia') ? (
              <AccessDenied />
            ) : (
              <>
                <h2 className="mb-1 text-xl font-serif text-neutral-900">Editar Apariencia del Home</h2>
                <p className="mb-4 text-sm text-neutral-600">
                  Cada bloque indica exactamente que parte del home estas modificando.
                </p>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-neutral-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Logo del Navbar
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      Esta imagen se usa solo en la barra superior (navbar).
                    </p>
                    <div className="mt-3 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <img
                        src={siteContent.navbarLogoUrl}
                        alt="Preview logo navbar"
                        className="h-14 w-14 rounded object-cover border border-neutral-200 bg-white"
                      />
                      <div className="text-xs text-neutral-600">
                        <p><strong>Ubicacion:</strong> parte superior (navbar)</p>
                        <p><strong>No afecta:</strong> logo del hero</p>
                      </div>
                    </div>
                    <input
                      className="mt-3 w-full border border-neutral-300 px-3 py-2"
                      placeholder="URL del logo navbar"
                      value={siteContent.navbarLogoUrl}
                      onChange={(e) => updateSiteContent({ navbarLogoUrl: e.target.value })}
                    />
                    <label className="mt-2 inline-flex w-full items-center justify-center rounded border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      Subir logo navbar desde mi equipo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          void handleAppearanceImageUpload('navbarLogoUrl', e.target.files?.[0])
                        }}
                      />
                    </label>
                  </div>

                  <div className="rounded-lg border border-neutral-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Logo del Hero
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      Esta imagen se usa solo en la cabecera principal (hero).
                    </p>
                    <div className="mt-3 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <img
                        src={siteContent.heroLogoUrl}
                        alt="Preview logo hero"
                        className="h-14 w-14 rounded object-cover border border-neutral-200 bg-white"
                      />
                      <div className="text-xs text-neutral-600">
                        <p><strong>Ubicacion:</strong> bloque principal del home</p>
                        <p><strong>No afecta:</strong> logo del navbar</p>
                      </div>
                    </div>
                    <input
                      className="mt-3 w-full border border-neutral-300 px-3 py-2"
                      placeholder="URL del logo hero"
                      value={siteContent.heroLogoUrl}
                      onChange={(e) => updateSiteContent({ heroLogoUrl: e.target.value })}
                    />
                    <label className="mt-2 inline-flex w-full items-center justify-center rounded border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      Subir logo hero desde mi equipo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          void handleAppearanceImageUpload('heroLogoUrl', e.target.files?.[0])
                        }}
                      />
                    </label>
                  </div>

                  <div className="rounded-lg border border-neutral-200 p-4 lg:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Seccion Story
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      Esta imagen aparece en el bloque visual de historia del home.
                    </p>
                    <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <img
                        src={siteContent.storyImageUrl}
                        alt="Preview story"
                        className="h-32 w-full rounded object-cover border border-neutral-200 bg-white"
                      />
                      <p className="mt-2 text-xs text-neutral-600">
                        <strong>Ubicacion:</strong> modulo Story (bloque visual derecho).
                      </p>
                    </div>
                    <input
                      className="mt-3 w-full border border-neutral-300 px-3 py-2"
                      placeholder="URL imagen story"
                      value={siteContent.storyImageUrl}
                      onChange={(e) => updateSiteContent({ storyImageUrl: e.target.value })}
                    />
                    <label className="mt-2 inline-flex w-full items-center justify-center rounded border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      Subir imagen story desde mi equipo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          void handleAppearanceImageUpload('storyImageUrl', e.target.files?.[0])
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-neutral-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Textos del Hero (pantalla principal)
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input
                      className="border border-neutral-300 px-3 py-2"
                      placeholder="Titulo principal"
                      value={siteContent.heroTitle}
                      onChange={(e) => updateSiteContent({ heroTitle: e.target.value })}
                    />
                    <input
                      className="border border-neutral-300 px-3 py-2"
                      placeholder="Subtitulo"
                      value={siteContent.heroSubtitle}
                      onChange={(e) => updateSiteContent({ heroSubtitle: e.target.value })}
                    />
                    <textarea
                      className="border border-neutral-300 px-3 py-2 md:col-span-2"
                      placeholder="Descripcion del hero"
                      value={siteContent.heroDescription}
                      onChange={(e) => updateSiteContent({ heroDescription: e.target.value })}
                    />
                  </div>

                  <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-500">Vista previa del Hero:</p>
                    <p className="mt-1 text-lg font-serif text-neutral-900">{siteContent.heroTitle}</p>
                    <p className="text-sm text-neutral-500">{siteContent.heroSubtitle}</p>
                    <p className="mt-2 text-sm text-neutral-700 line-clamp-2">
                      {siteContent.heroDescription}
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetSiteContent}
                  className="mt-4 rounded border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-50"
                >
                  Restaurar valores por defecto
                </button>
              </>
            )}
          </section>
        )}

        {tab === 'pedidos' && (
          <section className="space-y-3">
            {!canAccess('pedidos') ? (
              <AccessDenied />
            ) : (
              <>
            {orders.length === 0 ? (
              <div className="border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                Aun no hay pedidos.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-neutral-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-neutral-900">Pedido #{order.id}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <select
                      className="border border-neutral-300 px-3 py-1 text-sm"
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                    >
                      <option value="en-curso">En curso</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="text-sm text-neutral-700">
                      <p>
                        <strong>Cliente:</strong> {order.customer.name}
                      </p>
                      <p>
                        <strong>Telefono:</strong> {order.customer.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.customer.email}
                      </p>
                      <p>
                        <strong>Direccion:</strong>{' '}
                        {order.customer.needsDelivery ? order.customer.address || '-' : 'Retiro'}
                      </p>
                      <p>
                        <strong>Pago:</strong> {order.customer.paymentMethod}
                      </p>
                    </div>
                    <div className="text-sm text-neutral-700">
                      <p className="mb-1 font-medium">Items</p>
                      <ul className="space-y-1">
                        {order.items.map((item, index) => (
                          <li key={`${order.id}-${item.productId}-${index}`}>
                            {item.name} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 font-semibold">Total: RD$ {order.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
              </>
            )}
          </section>
        )}

        {tab === 'roles' && (
          <section className="space-y-4">
            {!canAccess('roles') ? (
              <AccessDenied />
            ) : (
              <div className="border border-neutral-200 bg-white p-4">
                <h2 className="mb-2 text-xl font-serif text-neutral-900">Gestion de roles</h2>
                <p className="mb-4 text-sm text-neutral-600">
                  Rol actual: <strong>{adminRole ?? 'ninguno'}</strong>
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[
                    {
                      key: 'viewer',
                      title: 'Viewer',
                      desc: 'Solo visualiza dashboard y pedidos',
                    },
                    {
                      key: 'manager',
                      title: 'Manager',
                      desc: 'Gestiona pedidos y analiticas',
                    },
                    {
                      key: 'admin',
                      title: 'Admin',
                      desc: 'Acceso completo al panel',
                    },
                  ].map((role) => (
                    <div key={role.key} className="border border-neutral-200 p-4">
                      <p className="font-semibold text-neutral-900">{role.title}</p>
                      <p className="mb-3 text-sm text-neutral-500">{role.desc}</p>
                      <button
                        onClick={() =>
                          loginAsRole(role.key as 'viewer' | 'manager' | 'admin')
                        }
                        className={`w-full px-3 py-2 text-sm ${
                          role.key === 'admin'
                            ? 'bg-neutral-900 text-white'
                            : 'border border-neutral-300 bg-white text-neutral-700'
                        }`}
                      >
                        Asignar {role.title}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      <datalist id="admin-brand-options">
        {brands.map((brand) => (
          <option key={brand.slug} value={brand.name} />
        ))}
      </datalist>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow"
    >
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
    </motion.div>
  )
}

function QuickCard({
  title,
  desc,
  emoji,
  onClick,
}: {
  title: string
  desc: string
  emoji: string
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:shadow"
    >
      <p className="mb-2 text-xl">{emoji}</p>
      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="text-sm text-neutral-500">{desc}</p>
    </motion.button>
  )
}

function AccessDenied() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Tu rol no tiene permisos para esta seccion.
    </div>
  )
}
