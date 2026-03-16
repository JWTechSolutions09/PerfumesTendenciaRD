'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
  index?: number
}

export default function ProductCard({ product, onViewDetails, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product, 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group bg-white border border-neutral-200 hover:border-neutral-900 transition-all duration-300 overflow-hidden shadow-sm"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-black/20">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading={index < 6 ? "eager" : "lazy"}
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.bestSeller && (
            <span className="px-3 py-1 bg-white text-black text-xs font-semibold uppercase tracking-wider">
              Más Vendido
            </span>
          )}
          {product.new && (
            <span className="px-3 py-1 bg-white text-black text-xs font-semibold uppercase tracking-wider">
              Nuevo
            </span>
          )}
          {product.featured && (
            <span className="px-3 py-1 bg-white/80 text-black text-xs font-semibold uppercase tracking-wider">
              Destacado
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onViewDetails(product)}
            className="p-3 bg-white/90 text-black hover:bg-white transition-colors"
            aria-label="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="p-3 bg-white text-black hover:bg-white/90 transition-colors"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-neutral-500 text-sm uppercase tracking-wider mb-2 font-light">
          {product.brand}
        </p>
        <h3 className="text-neutral-900 text-xl font-serif mb-2">{product.name}</h3>
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2 font-light">
          {product.shortDescription}
        </p>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs uppercase tracking-wider ${
              product.availability === 'disponible'
                ? 'text-green-400'
                : product.availability === 'agotado'
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}
          >
            {product.availability}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
