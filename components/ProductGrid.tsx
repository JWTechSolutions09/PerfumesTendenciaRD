'use client'

import { motion } from 'framer-motion'
import { Product } from '@/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  onViewDetails: (product: Product) => void
}

export default function ProductGrid({ products, onViewDetails }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60 text-lg font-light">
          No se encontraron productos que coincidan con tus filtros.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onViewDetails}
          index={index}
        />
      ))}
    </div>
  )
}
