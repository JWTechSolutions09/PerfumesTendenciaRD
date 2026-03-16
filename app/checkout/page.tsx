'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Mail, Phone, MapPin, Truck, CreditCard, Wallet } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { CheckoutFormData } from '@/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const DELIVERY_COST = 5000 // Costo de envío en pesos

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    phone: '',
    name: '',
    address: '',
    needsDelivery: false,
    paymentMethod: 'efectivo',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/catalogo')
    }
  }, [items.length, router])

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const deliveryCost = formData.needsDelivery ? DELIVERY_COST : 0
  const total = subtotal + deliveryCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Preparar datos del pedido
      const orderData = {
        ...formData,
        items: items.map((item) => ({
          product: item.product.name,
          brand: item.product.brand,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal,
        deliveryCost,
        total,
        date: new Date().toISOString(),
      }

      // Enviar por correo (requiere backend)
      await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      // Enviar por WhatsApp
      const whatsappMessage = `Nuevo pedido de ${formData.name}%0A%0A` +
        `📧 Email: ${formData.email}%0A` +
        `📱 Teléfono: ${formData.phone}%0A` +
        `${formData.needsDelivery ? `📍 Dirección: ${formData.address}%0A` : '🚶 Retiro en tienda%0A'}` +
        `💳 Método de pago: ${formData.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}%0A%0A` +
        `🛍️ Productos:%0A` +
        items.map((item) => 
          `- ${item.product.brand} ${item.product.name} x${item.quantity}`
        ).join('%0A') +
        `%0A%0A💰 Total: ${formatPrice(total)}`

      window.open(
        `https://wa.me/18099809900?text=${whatsappMessage}`,
        '_blank'
      )

      // Limpiar carrito y redirigir
      clearCart()
      router.push('/?order=success')
    } catch (error) {
      console.error('Error al procesar pedido:', error)
      alert('Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Navbar onSearchClick={() => setIsSearchOpen(true)} />
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Tu carrito está vacío</p>
          <Link
            href="/catalogo"
            className="inline-block px-6 py-3 bg-neutral-900 text-white font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Ir al Catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-2">
            Finalizar Pedido
          </h1>
          <p className="text-neutral-600 font-light">
            Completa tus datos para procesar tu pedido
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-white border border-neutral-200 shadow-sm p-6 md:p-8 space-y-6"
            >
              {/* Información Personal */}
              <div>
                <h2 className="text-2xl font-serif text-neutral-900 mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Información de Contacto
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-neutral-700 text-sm font-semibold mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-neutral-700 text-sm font-semibold mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-neutral-700 text-sm font-semibold mb-2">
                      Número de Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                      placeholder="809 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Opción de Envío */}
              <div>
                <h2 className="text-2xl font-serif text-neutral-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Opciones de Entrega
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-neutral-200 hover:border-neutral-900 transition-colors">
                    <input
                      type="radio"
                      name="delivery"
                      checked={!formData.needsDelivery}
                      onChange={() => setFormData({ ...formData, needsDelivery: false, address: '' })}
                      className="w-4 h-4 accent-neutral-900"
                    />
                    <div>
                      <span className="text-neutral-900 font-semibold">Retiro en Tienda</span>
                      <p className="text-neutral-600 text-sm font-light">Recoge tu pedido en nuestra tienda física</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-neutral-200 hover:border-neutral-900 transition-colors">
                    <input
                      type="radio"
                      name="delivery"
                      checked={formData.needsDelivery}
                      onChange={() => setFormData({ ...formData, needsDelivery: true })}
                      className="w-4 h-4 accent-neutral-900"
                    />
                    <div>
                      <span className="text-neutral-900 font-semibold">Envío a Domicilio</span>
                      <p className="text-neutral-600 text-sm font-light">Envío por {formatPrice(DELIVERY_COST)}</p>
                    </div>
                  </label>
                  {formData.needsDelivery && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4"
                    >
                      <label htmlFor="address" className="block text-neutral-700 text-sm font-semibold mb-2">
                        Dirección de Envío *
                      </label>
                      <textarea
                        id="address"
                        required={formData.needsDelivery}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder="Calle, número, sector, ciudad..."
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <h2 className="text-2xl font-serif text-neutral-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Método de Pago
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-neutral-200 hover:border-neutral-900 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="efectivo"
                      checked={formData.paymentMethod === 'efectivo'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'efectivo' | 'transferencia' })}
                      className="w-4 h-4 accent-neutral-900"
                    />
                    <Wallet className="w-5 h-5 text-neutral-700" />
                    <div>
                      <span className="text-neutral-900 font-semibold">Efectivo</span>
                      <p className="text-neutral-600 text-sm font-light">Pago al momento de la entrega</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-neutral-200 hover:border-neutral-900 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="transferencia"
                      checked={formData.paymentMethod === 'transferencia'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'efectivo' | 'transferencia' })}
                      className="w-4 h-4 accent-neutral-900"
                    />
                    <CreditCard className="w-5 h-5 text-neutral-700" />
                    <div>
                      <span className="text-neutral-900 font-semibold">Transferencia Bancaria</span>
                      <p className="text-neutral-600 text-sm font-light">Transferencia o depósito bancario</p>
                    </div>
                  </label>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-neutral-900 text-white font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
              </motion.button>
            </motion.form>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-neutral-200 shadow-sm p-6 sticky top-24"
            >
              <h2 className="text-2xl font-serif text-neutral-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 pb-4 border-b border-neutral-200">
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
                      <p className="text-neutral-500 text-xs uppercase tracking-wider font-light">
                        {item.product.brand}
                      </p>
                      <p className="text-neutral-900 font-semibold truncate">
                        {item.product.name}
                      </p>
                      <p className="text-neutral-600 text-sm">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-neutral-900 font-semibold mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex justify-between text-neutral-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {formData.needsDelivery && (
                  <div className="flex justify-between text-neutral-700">
                    <span>Envío:</span>
                    <span className="font-semibold">{formatPrice(deliveryCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-serif text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total:</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
