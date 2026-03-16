'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import StorySection from '@/components/StorySection'
import SearchBar from '@/components/SearchBar'
import FeaturedSection from '@/components/FeaturedSection'
import ContactSection from '@/components/ContactSection'
import ProductModal from '@/components/ProductModal'
import CartDrawer from '@/components/CartDrawer'
import Footer from '@/components/Footer'
import { Product } from '@/types'

function SuccessMessage() {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('order') === 'success') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      // Limpiar URL
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  if (!showSuccess) return null

  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 z-50 bg-white border border-neutral-200 shadow-xl p-6 max-w-md"
        >
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-neutral-900 font-semibold mb-1">¡Pedido Confirmado!</h3>
              <p className="text-neutral-600 text-sm font-light">
                Tu pedido ha sido recibido correctamente. Te contactaremos pronto para confirmar los detalles.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  return (
    <main className="min-h-screen">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <HeroSection />
      <StorySection />
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onProductSelect={handleViewDetails}
      />
      <FeaturedSection onViewDetails={handleViewDetails} />
      <ContactSection />
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setSelectedProduct(null)
        }}
      />
      <CartDrawer />
      <Footer />

      {/* Success Message */}
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>
    </main>
  )
}
