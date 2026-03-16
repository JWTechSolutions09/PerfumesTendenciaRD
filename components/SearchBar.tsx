'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import { useFilters } from '@/hooks/useFilters'
import { products } from '@/data/products'
import { Product } from '@/types'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
  onProductSelect?: (product: Product) => void
}

export default function SearchBar({ isOpen, onClose, onProductSelect }: SearchBarProps) {
  const { filters, filteredProducts, updateSearch } = useFilters(products)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    updateSearch('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10"
          >
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center gap-4 mb-6">
                <Search className="w-6 h-6 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar perfumes, marcas, categorías..."
                  value={filters.search}
                  onChange={(e) => updateSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white text-lg placeholder-white/40 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {filters.search && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-h-[60vh] overflow-y-auto"
                >
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredProducts.slice(0, 6).map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            if (onProductSelect) {
                              onProductSelect(product)
                            }
                            handleClose()
                          }}
                          className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
                        >
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-xs uppercase tracking-wider truncate">
                              {product.brand}
                            </p>
                            <p className="text-white font-semibold truncate">
                              {product.name}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-white/60">No se encontraron resultados</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
