'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import CatalogSection from '@/components/CatalogSection'
import SearchBar from '@/components/SearchBar'
import ProductModal from '@/components/ProductModal'
import CartDrawer from '@/components/CartDrawer'
import Footer from '@/components/Footer'
import { Product } from '@/types'

export default function CatalogPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onProductSelect={handleViewDetails}
      />
      <CatalogSection onViewDetails={handleViewDetails} />
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
    </main>
  )
}
