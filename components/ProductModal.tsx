'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  if (!product) return null

  const handleAddToCart = () => {
    addItem(product, quantity)
    onClose()
  }

  const increaseQuantity = () => setQuantity((q) => q + 1)
  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-black/95 backdrop-blur-md border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto md:h-full min-h-[400px] bg-black/20">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white transition-colors z-10"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col">
                <div className="flex-1">
                  <p className="text-white/70 text-sm uppercase tracking-wider mb-2 font-light">
                    {product.brand}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className={`px-3 py-1 text-xs uppercase tracking-wider ${
                        product.availability === 'disponible'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : product.availability === 'agotado'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {product.availability}
                    </span>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <h3 className="text-white font-semibold mb-2 uppercase tracking-wider text-sm">
                        Descripción
                      </h3>
                      <p className="text-white/70 leading-relaxed font-light">
                        {product.longDescription}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-2 uppercase tracking-wider text-sm">
                        Notas Olfativas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.olfactoryNotes.map((note) => (
                          <span
                            key={note}
                            className="px-3 py-1 bg-white/10 text-white/80 text-sm border border-white/20"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-white font-semibold mb-2 uppercase tracking-wider text-sm">
                          Género
                        </h3>
                        <p className="text-white/70 capitalize font-light">
                          {product.gender}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2 uppercase tracking-wider text-sm">
                          Tipo
                        </h3>
                        <p className="text-white/70 capitalize font-light">
                          {product.fragranceType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-white/10 pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-white/80 text-sm uppercase tracking-wider">
                      Cantidad:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={decreaseQuantity}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white text-lg font-semibold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQuantity}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={product.availability !== 'disponible'}
                    className="w-full px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Carrito
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
