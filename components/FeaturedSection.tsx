'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { products } from '@/data/products'
import ProductCard from './ProductCard'
import { Product } from '@/types'

interface FeaturedSectionProps {
  onViewDetails: (product: Product) => void
}

export default function FeaturedSection({ onViewDetails }: FeaturedSectionProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const bestSellers = products.filter((p) => p.bestSeller)
  const featured = products.filter((p) => p.featured)

  return (
    <section
      id="destacados"
      ref={ref}
      className="py-24 bg-neutral-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Perfumes Destacados */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-4">
              Perfumes <span className="text-neutral-500">Destacados</span>
            </h2>
            <p className="text-neutral-500 font-light max-w-xl mx-auto">
              Una curaduría de fragancias que representan la esencia de nuestra colección.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewDetails}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Más Vendidos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-4">
              Más <span className="text-neutral-500">Vendidos</span>
            </h2>
            <p className="text-neutral-500 font-light max-w-xl mx-auto">
              Las fragancias preferidas por nuestros clientes, probadas y amadas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bestSellers.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewDetails}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
