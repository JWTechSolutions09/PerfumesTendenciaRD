import type { SupabaseClient } from '@supabase/supabase-js'
import type { Brand, Product } from '@/types'
import type { OrderStatus, SiteContent, StoreOrder, StoreOrderItem } from '@/types/store'

// --- DB row shapes (manual, alineado al SQL recomendado) ---

type DbBrand = {
  id: string
  name: string
  slug: string
  description: string
  logo_url: string | null
}

type DbProduct = {
  id: string
  slug: string
  name: string
  brand_id: string | null
  brand_name: string
  price: number
  stock: number
  image_url: string
  short_description: string
  long_description: string
  category: string
  gender: string
  fragrance_type: string
  availability: string
  featured: boolean
  is_new: boolean
  best_seller: boolean
}

type DbSiteContent = {
  id: number
  navbar_logo_url: string
  hero_logo_url: string
  hero_title: string
  hero_subtitle: string
  hero_description: string
  story_image_url: string
}

type DbOrder = {
  id: string
  status: string
  stock_applied: boolean
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string | null
  needs_delivery: boolean
  payment_method: string
  subtotal: number
  delivery_cost: number
  total: number
  created_at: string
}

type DbOrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  brand_name: string
  unit_price: number
  quantity: number
}

export function dbProductToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand_name,
    price: Number(row.price),
    image: row.image_url || '',
    shortDescription: row.short_description || '',
    longDescription: row.long_description || '',
    category: row.category || 'fragancias',
    gender: row.gender as Product['gender'],
    olfactoryNotes: [],
    fragranceType: row.fragrance_type as Product['fragranceType'],
    stock: Number(row.stock),
    availability: row.availability as Product['availability'],
    featured: Boolean(row.featured),
    new: Boolean(row.is_new),
    bestSeller: Boolean(row.best_seller),
  }
}

export function productToDbInsert(
  p: Product,
  brandId: string | null
): Record<string, unknown> {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand_id: brandId,
    brand_name: p.brand,
    price: p.price,
    stock: p.stock,
    image_url: p.image || '',
    short_description: p.shortDescription,
    long_description: p.longDescription,
    category: p.category,
    gender: p.gender,
    fragrance_type: p.fragranceType,
    availability: p.availability,
    featured: p.featured,
    is_new: p.new,
    best_seller: p.bestSeller,
  }
}

export function productPatchToDb(patch: Partial<Product>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (patch.slug !== undefined) out.slug = patch.slug
  if (patch.name !== undefined) out.name = patch.name
  if (patch.brand !== undefined) out.brand_name = patch.brand
  if (patch.price !== undefined) out.price = patch.price
  if (patch.stock !== undefined) out.stock = patch.stock
  if (patch.image !== undefined) out.image_url = patch.image
  if (patch.shortDescription !== undefined) out.short_description = patch.shortDescription
  if (patch.longDescription !== undefined) out.long_description = patch.longDescription
  if (patch.category !== undefined) out.category = patch.category
  if (patch.gender !== undefined) out.gender = patch.gender
  if (patch.fragranceType !== undefined) out.fragrance_type = patch.fragranceType
  if (patch.availability !== undefined) out.availability = patch.availability
  if (patch.featured !== undefined) out.featured = patch.featured
  if (patch.new !== undefined) out.is_new = patch.new
  if (patch.bestSeller !== undefined) out.best_seller = patch.bestSeller
  return out
}

export function dbBrandToBrand(row: DbBrand): Brand {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    logo: row.logo_url || undefined,
  }
}

export function brandToDbInsert(b: Brand): Record<string, unknown> {
  return {
    name: b.name,
    slug: b.slug,
    description: b.description || '',
    logo_url: b.logo ?? null,
  }
}

export function dbSiteToSiteContent(row: DbSiteContent): SiteContent {
  return {
    navbarLogoUrl: row.navbar_logo_url,
    heroLogoUrl: row.hero_logo_url,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroDescription: row.hero_description,
    storyImageUrl: row.story_image_url || '',
  }
}

export function siteContentToDbRow(s: SiteContent): Record<string, unknown> {
  return {
    id: 1,
    navbar_logo_url: s.navbarLogoUrl,
    hero_logo_url: s.heroLogoUrl,
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    hero_description: s.heroDescription,
    story_image_url: s.storyImageUrl,
  }
}

function mapOrder(row: DbOrder, items: DbOrderItem[]): StoreOrder {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    stockApplied: Boolean(row.stock_applied),
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email || '',
      address: row.customer_address || '',
      needsDelivery: row.needs_delivery,
      paymentMethod: row.payment_method as StoreOrder['customer']['paymentMethod'],
    },
    items: items.map((it) => ({
      productId: it.product_id || '',
      name: it.product_name,
      price: Number(it.unit_price),
      quantity: it.quantity,
    })),
    subtotal: Number(row.subtotal),
    deliveryCost: Number(row.delivery_cost),
    total: Number(row.total),
  }
}

export async function fetchAllFromSupabase(supabase: SupabaseClient): Promise<{
  brands: Brand[]
  products: Product[]
  orders: StoreOrder[]
  siteContent: SiteContent | null
}> {
  const [brandsRes, productsRes, ordersRes, itemsRes, siteRes] = await Promise.all([
    supabase.from('brands').select('*').order('name', { ascending: true }),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('order_items').select('*'),
    supabase.from('site_content').select('*').eq('id', 1).maybeSingle(),
  ])

  if (brandsRes.error) throw brandsRes.error
  if (productsRes.error) throw productsRes.error
  if (ordersRes.error) throw ordersRes.error
  if (itemsRes.error) throw itemsRes.error
  if (siteRes.error) throw siteRes.error

  const brands = (brandsRes.data as DbBrand[]).map(dbBrandToBrand)
  const products = (productsRes.data as DbProduct[]).map(dbProductToProduct)

  const itemsByOrder = new Map<string, DbOrderItem[]>()
  for (const it of (itemsRes.data as DbOrderItem[]) || []) {
    const list = itemsByOrder.get(it.order_id) || []
    list.push(it)
    itemsByOrder.set(it.order_id, list)
  }
  const orders = (ordersRes.data as DbOrder[]).map((o) =>
    mapOrder(o, itemsByOrder.get(o.id) || [])
  )

  const siteContent = siteRes.data
    ? dbSiteToSiteContent(siteRes.data as DbSiteContent)
    : null

  return { brands, products, orders, siteContent }
}

/** Si no hay marcas ni productos, inserta el seed inicial (una sola vez). */
export async function seedSupabaseIfEmpty(
  supabase: SupabaseClient,
  seedBrands: Brand[],
  seedProducts: Product[]
): Promise<{ brands: Brand[]; products: Product[] }> {
  const { count: bCount } = await supabase
    .from('brands')
    .select('*', { count: 'exact', head: true })
  const { count: pCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if ((bCount ?? 0) > 0 || (pCount ?? 0) > 0) {
    return { brands: [], products: [] }
  }

  const brandRows = seedBrands.map((b) => brandToDbInsert(b))
  const { data: insertedBrands, error: bErr } = await supabase
    .from('brands')
    .insert(brandRows)
    .select('*')
  if (bErr) throw bErr

  const nameToBrandId = new Map<string, string>()
  for (const row of (insertedBrands as DbBrand[]) || []) {
    nameToBrandId.set(row.name.toLowerCase(), row.id)
  }

  const productRows = seedProducts.map((p) => {
    const bid = nameToBrandId.get(p.brand.toLowerCase()) ?? null
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : p.id
    return productToDbInsert({ ...p, id }, bid)
  })

  const { data: insertedProducts, error: pErr } = await supabase
    .from('products')
    .insert(productRows)
    .select('*')
  if (pErr) throw pErr

  const brands = ((insertedBrands as DbBrand[]) || []).map(dbBrandToBrand)
  const products = ((insertedProducts as DbProduct[]) || []).map(dbProductToProduct)
  return { brands, products }
}

export async function ensureSiteContentRow(
  supabase: SupabaseClient,
  defaults: SiteContent
): Promise<SiteContent> {
  const { data, error } = await supabase.from('site_content').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  if (data) return dbSiteToSiteContent(data as DbSiteContent)

  const { error: insErr } = await supabase.from('site_content').insert(siteContentToDbRow(defaults))
  if (insErr) throw insErr
  return defaults
}

export async function upsertSiteContentRemote(
  supabase: SupabaseClient,
  content: SiteContent
): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert(siteContentToDbRow(content), { onConflict: 'id' })
  if (error) throw error
}

export async function insertBrandRemote(supabase: SupabaseClient, brand: Brand): Promise<Brand> {
  const { data, error } = await supabase.from('brands').insert(brandToDbInsert(brand)).select('*').single()
  if (error) throw error
  return dbBrandToBrand(data as DbBrand)
}

export async function updateBrandBySlugRemote(
  supabase: SupabaseClient,
  oldSlug: string,
  patch: Partial<Brand>
): Promise<void> {
  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.slug !== undefined) dbPatch.slug = patch.slug
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.logo !== undefined) dbPatch.logo_url = patch.logo ?? null
  if (Object.keys(dbPatch).length === 0) return
  const { error } = await supabase.from('brands').update(dbPatch).eq('slug', oldSlug)
  if (error) throw error
}

export async function deleteBrandBySlugRemote(supabase: SupabaseClient, slug: string): Promise<void> {
  const { error } = await supabase.from('brands').delete().eq('slug', slug)
  if (error) throw error
}

export async function resolveBrandIdByName(
  supabase: SupabaseClient,
  brandName: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('id')
    .ilike('name', brandName)
    .maybeSingle()
  if (error) throw error
  return data?.id ?? null
}

function ensureUuid(id: string): string {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRe.test(id)) return id
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : id
}

export async function insertProductRemote(
  supabase: SupabaseClient,
  product: Product,
  brandId: string | null
): Promise<Product> {
  const withId = { ...product, id: ensureUuid(product.id) }
  const { data, error } = await supabase
    .from('products')
    .insert(productToDbInsert(withId, brandId))
    .select('*')
    .single()
  if (error) throw error
  return dbProductToProduct(data as DbProduct)
}

export async function updateProductRemote(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Product>,
  brandId?: string | null
): Promise<void> {
  const dbPatch = productPatchToDb(patch)
  if (brandId !== undefined) dbPatch.brand_id = brandId
  if (patch.brand !== undefined && brandId === undefined) {
    // solo nombre de marca; intentar enlazar
    const bid = await resolveBrandIdByName(supabase, patch.brand)
    dbPatch.brand_id = bid
  }
  const { error } = await supabase.from('products').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteProductRemote(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function updateProductStockRemote(
  supabase: SupabaseClient,
  productId: string,
  delta: number
): Promise<void> {
  const { data: row, error: gErr } = await supabase
    .from('products')
    .select('stock, availability')
    .eq('id', productId)
    .maybeSingle()
  if (gErr) throw gErr
  if (!row) return
  const nextStock = Math.max(0, Number(row.stock) + delta)
  const nextAvail = nextStock === 0 ? 'agotado' : row.availability
  const { error } = await supabase
    .from('products')
    .update({ stock: nextStock, availability: nextAvail })
    .eq('id', productId)
  if (error) throw error
}

export async function insertOrderRemote(
  supabase: SupabaseClient,
  input: Omit<StoreOrder, 'id' | 'createdAt' | 'status' | 'stockApplied'>
): Promise<StoreOrder> {
  const orderInsert = {
    status: 'en-curso' as const,
    stock_applied: true,
    customer_name: input.customer.name,
    customer_phone: input.customer.phone,
    customer_email: input.customer.email || null,
    customer_address: input.customer.address || null,
    needs_delivery: input.customer.needsDelivery,
    payment_method: input.customer.paymentMethod,
    subtotal: input.subtotal,
    delivery_cost: input.deliveryCost,
    total: input.total,
  }

  const { data: orderRow, error: oErr } = await supabase
    .from('orders')
    .insert(orderInsert)
    .select('*')
    .single()
  if (oErr) throw oErr

  const oid = (orderRow as DbOrder).id
  const itemRows = await Promise.all(
    input.items.map(async (it) => {
      let brandName = ''
      if (it.productId) {
        const { data: prod } = await supabase
          .from('products')
          .select('brand_name')
          .eq('id', it.productId)
          .maybeSingle()
        brandName = (prod as { brand_name?: string } | null)?.brand_name || ''
      }
      return {
        order_id: oid,
        product_id: it.productId || null,
        product_name: it.name,
        brand_name: brandName,
        unit_price: it.price,
        quantity: it.quantity,
      }
    })
  )

  const { error: iErr } = await supabase.from('order_items').insert(itemRows)
  if (iErr) throw iErr

  for (const it of input.items) {
    if (!it.productId) continue
    await updateProductStockRemote(supabase, it.productId, -it.quantity)
  }

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', oid)
  return mapOrder(orderRow as DbOrder, (items as DbOrderItem[]) || [])
}

export async function updateOrderStatusRemote(
  supabase: SupabaseClient,
  orderId: string,
  status: OrderStatus,
  current: StoreOrder
): Promise<void> {
  if (current.status === status) return

  if (status === 'cancelado' && current.stockApplied) {
    for (const it of current.items) {
      if (it.productId) await updateProductStockRemote(supabase, it.productId, it.quantity)
    }
  }
  if (current.status === 'cancelado' && status !== 'cancelado' && !current.stockApplied) {
    for (const it of current.items) {
      if (it.productId) await updateProductStockRemote(supabase, it.productId, -it.quantity)
    }
  }

  const nextStockApplied = status === 'cancelado' ? false : true
  const { error } = await supabase
    .from('orders')
    .update({ status, stock_applied: nextStockApplied })
    .eq('id', orderId)
  if (error) throw error
}
