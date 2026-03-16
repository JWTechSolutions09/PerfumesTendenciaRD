'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

export default function CartDrawer() {
  const router = useRouter()
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart } =
    useCart()

  const handleContinue = () => {
    setIsOpen(false)
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white border-l border-neutral-200 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                <h2 className="text-neutral-900 text-xl font-serif">Carrito</h2>
                {items.length > 0 && (
                  <span className="px-2 py-1 bg-neutral-900 text-white text-xs font-bold rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
                  <p className="text-neutral-600 font-light">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 bg-neutral-50 border border-neutral-200"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-500 text-xs uppercase tracking-wider truncate font-light">
                          {item.product.brand}
                        </p>
                        <p className="text-neutral-900 font-semibold truncate">
                          {item.product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="p-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-neutral-900 text-sm w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="p-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto p-1 bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700 uppercase tracking-wider text-sm">
                    Productos en el carrito:
                  </span>
                  <span className="text-neutral-900 text-xl font-semibold">
                    {items.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 hover:border-red-500 hover:text-red-600 transition-colors text-sm uppercase tracking-wider bg-white"
                  >
                    Vaciar
                  </button>
                  <motion.button
                    onClick={handleContinue}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-neutral-900 text-white font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                  >
                    Continuar
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
