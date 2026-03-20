import type { CheckoutFormData } from '@/types'

export type OrderStatus = 'en-curso' | 'cancelado' | 'entregado'
export type AdminRole = 'admin' | 'manager' | 'viewer' | null

export type StoreOrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface StoreOrder {
  id: string
  createdAt: string
  status: OrderStatus
  stockApplied: boolean
  customer: CheckoutFormData
  items: StoreOrderItem[]
  subtotal: number
  deliveryCost: number
  total: number
}

export interface SiteContent {
  navbarLogoUrl: string
  heroLogoUrl: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  storyImageUrl: string
}
