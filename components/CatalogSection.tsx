'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Filter } from 'lucide-react'
import { useFilters } from '@/hooks/useFilters'
import { products } from '@/data/products'
import ProductGrid from './ProductGrid'
import FilterPanel from './FilterPanel'
import { Product } from '@/types'

interface CatalogSectionProps {
  onViewDetails: (product: Product) => void
}

export default function CatalogSection({ onViewDetails }: CatalogSectionProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { filteredProducts } = useFilters(products)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="catalogo" ref={ref} className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
                Catálogo <span className="text-white/80">Completo</span>
              </h2>
              <p className="text-white/60 font-light">
                Explora nuestra colección completa de fragancias premium
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden px-4 py-2 border border-white/20 text-white/80 hover:border-white hover:text-white transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filter Panel */}
            <div className="hidden lg:block">
              <FilterPanel isOpen={true} onClose={() => {}} isMobile={false} />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <ProductGrid
                products={filteredProducts}
                onViewDetails={onViewDetails}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Filter Panel */}
      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} isMobile={true} />
    </section>
  )
}
