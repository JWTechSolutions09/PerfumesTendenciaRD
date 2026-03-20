'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useStore } from '@/hooks/storeContext'
import ProductCard from './ProductCard'
import { Product } from '@/types'

interface BrandSectionProps {
  onViewDetails: (product: Product) => void
}

export default function BrandSection({ onViewDetails }: BrandSectionProps) {
  const { products, brands } = useStore()
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const brandProducts = selectedBrand
    ? products.filter((p) => p.brand === selectedBrand)
    : products

  const groupedByBrand = brands.map((brand) => ({
    ...brand,
    products: products.filter((p) => p.brand === brand.name),
  }))

  return (
    <section id="marcas" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-4">
            Nuestras <span className="text-neutral-500">Marcas</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto font-light">
            Descubre las colecciones exclusivas de las casas de perfumería más
            prestigiosas del mundo
          </p>
        </motion.div>

        {/* Brand Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
            <button
              onClick={() => setSelectedBrand(null)}
              className={`px-6 py-3 uppercase tracking-wider text-sm font-light transition-all duration-200 ${
                selectedBrand === null
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
            Todas
          </button>
          {brands.map((brand) => (
              <button
                key={brand.slug}
                onClick={() => setSelectedBrand(brand.name)}
                className={`px-6 py-3 uppercase tracking-wider text-sm font-light transition-all duration-200 ${
                  selectedBrand === brand.name
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900'
                }`}
              >
              {brand.name}
            </button>
          ))}
        </motion.div>

        {/* Brand Sections */}
        <AnimatePresence mode="wait">
          {selectedBrand ? (
            <motion.div
              key={selectedBrand}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h3 className="text-3xl font-serif text-neutral-900 mb-2">
                  {selectedBrand}
                </h3>
                <p className="text-neutral-600 font-light">
                  {
                    brands.find((b) => b.name === selectedBrand)?.description
                  }
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brandProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={onViewDetails}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="all-brands"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-24"
            >
              {groupedByBrand.map((brandGroup, brandIndex) => (
                <motion.div
                  key={brandGroup.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: brandIndex * 0.1 }}
                >
                  <div className="mb-8">
                    <h3 className="text-3xl font-serif text-neutral-900 mb-2">
                      {brandGroup.name}
                    </h3>
                    <p className="text-neutral-600 font-light max-w-2xl">
                      {brandGroup.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {brandGroup.products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewDetails={onViewDetails}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
