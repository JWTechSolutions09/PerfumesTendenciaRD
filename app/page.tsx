'use client'

import { useState } from 'react'
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
    </main>
  )
}
