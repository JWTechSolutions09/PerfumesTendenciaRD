'use client'

import { motion } from 'framer-motion'
import { X, Filter } from 'lucide-react'
import { useFilters } from '@/hooks/useFilters'
import { products } from '@/data/products'
import { Gender, FragranceType, Availability } from '@/types'
// import { formatPrice } from '@/lib/utils'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

export default function FilterPanel({ isOpen, onClose, isMobile = false }: FilterPanelProps) {
  const {
    filters,
    toggleBrand,
    updatePriceRange,
    toggleGender,
    toggleFragranceType,
    toggleAvailability,
    clearFilters,
    hasActiveFilters,
  } = useFilters(products)

  // Get unique values
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort()
  const maxPrice = Math.max(...products.map((p) => p.price))
  const minPrice = Math.min(...products.map((p) => p.price))

  const genders: Gender[] = ['masculino', 'femenino', 'unisex']
  const fragranceTypes: FragranceType[] = [
    'eau de parfum',
    'eau de toilette',
    'eau de cologne',
    'parfum',
  ]
  const availabilities: Availability[] = ['disponible', 'agotado', 'próximamente']

  const FilterContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white" />
          <h2 className="text-white text-xl font-serif">Filtros</h2>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Cerrar filtros"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters() && (
        <button
          onClick={clearFilters}
          className="w-full mb-6 px-4 py-2 border border-white/20 text-white/80 hover:border-white hover:text-white transition-colors text-sm uppercase tracking-wider"
        >
          Limpiar Filtros
        </button>
      )}

      {/* Price Range */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
          Precio
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-white/60 text-xs uppercase tracking-wider">
            <span>Precio mínimo</span>
            <span>Precio máximo</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={filters.priceRange[1]}
              onChange={(e) =>
                updatePriceRange([filters.priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-white"
            />
          </div>
        </div>
      </div>

      {/* Brand */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
          Marca
        </h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.brand.includes(brand)}
                onChange={() => toggleBrand(brand)}
                    className="w-4 h-4 accent-white"
              />
              <span className="text-sm font-light">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
          Género
        </h3>
        <div className="space-y-2">
          {genders.map((gender) => (
            <label
              key={gender}
              className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer capitalize"
            >
              <input
                type="checkbox"
                checked={filters.gender.includes(gender)}
                onChange={() => toggleGender(gender)}
                    className="w-4 h-4 accent-white"
              />
              <span className="text-sm font-light">{gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fragrance Type */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
          Tipo de Fragancia
        </h3>
        <div className="space-y-2">
          {fragranceTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer capitalize"
            >
              <input
                type="checkbox"
                checked={filters.fragranceType.includes(type)}
                onChange={() => toggleFragranceType(type)}
                    className="w-4 h-4 accent-white"
              />
              <span className="text-sm font-light">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
          Disponibilidad
        </h3>
        <div className="space-y-2">
          {availabilities.map((availability) => (
            <label
              key={availability}
              className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer capitalize"
            >
              <input
                type="checkbox"
                checked={filters.availability.includes(availability)}
                onChange={() => toggleAvailability(availability)}
                    className="w-4 h-4 accent-white"
              />
              <span className="text-sm font-light">{availability}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  )

  if (!isMobile) {
    // Desktop version - always visible sidebar
    return (
      <div className="bg-black/50 backdrop-blur-sm border border-white/10 p-6">
        <FilterContent />
      </div>
    )
  }

  // Mobile version - drawer
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-md border-r border-white/10 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <FilterContent />
        </div>
      </motion.div>
    </>
  )
}
