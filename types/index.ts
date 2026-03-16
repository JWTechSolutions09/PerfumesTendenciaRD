export type Gender = 'masculino' | 'femenino' | 'unisex'
export type FragranceType = 'eau de parfum' | 'eau de toilette' | 'eau de cologne' | 'parfum'
export type Availability = 'disponible' | 'agotado' | 'próximamente'

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  image: string
  shortDescription: string
  longDescription: string
  category: string
  gender: Gender
  olfactoryNotes: string[]
  fragranceType: FragranceType
  stock: number
  availability: Availability
  featured: boolean
  new: boolean
  bestSeller: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface FilterState {
  search: string
  brand: string[]
  priceRange: [number, number]
  gender: Gender[]
  fragranceType: FragranceType[]
  availability: Availability[]
}

export interface Brand {
  name: string
  slug: string
  description: string
  logo?: string
}
