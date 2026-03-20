'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'
import { useStore } from '@/hooks/storeContext'

interface NavbarProps {
  onSearchClick: () => void
}

export default function Navbar({ onSearchClick }: NavbarProps) {
  const { siteContent } = useStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { getTotalItems, setIsOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/catalogo#marcas', label: 'Marcas' },
    { href: '/#destacados', label: 'Destacados' },
    { href: '/#contacto', label: 'Contacto' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-neutral-200'
          : 'bg-white/80 backdrop-blur-md border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-full border border-white bg-white"
            >
              <Image
                src={siteContent.navbarLogoUrl}
                alt="Perfumes Tendencia RD"
                fill
                className="object-contain p-1"
                sizes="48px"
                priority
              />
            </motion.div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm md:text-xs uppercase tracking-[0.2em] text-neutral-500">
                Perfumes
              </span>
              <span className="text-lg md:text-xl font-serif text-neutral-900 group-hover:text-neutral-700 transition-colors">
                {siteContent.heroSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-neutral-700 hover:text-neutral-900 transition-colors duration-200 font-light text-sm uppercase tracking-wider relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center border border-neutral-300 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
            >
              Admin
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSearchClick}
              className="text-neutral-600 hover:text-neutral-900 transition-colors p-2"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="relative text-neutral-600 hover:text-neutral-900 transition-colors p-2"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-neutral-700 hover:text-neutral-900 transition-colors p-2"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white backdrop-blur-md border-t border-neutral-200"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-neutral-900 transition-colors font-light text-sm uppercase tracking-wider py-2"
              >
                Panel Admin
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-neutral-700 hover:text-neutral-900 transition-colors font-light text-sm uppercase tracking-wider py-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
