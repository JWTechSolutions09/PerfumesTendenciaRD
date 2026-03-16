'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  const scrollToCatalog = () => {
    const element = document.getElementById('destacados')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-100">
      {/* Background subtle shapes */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-neutral-200/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-96 h-96 bg-neutral-300/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/60 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo inline in hero */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-neutral-300 bg-white shadow-sm">
              <Image
                src="/Logo.png"
                alt="Perfumes Tendencia RD"
                fill
                className="object-contain p-1.5"
                sizes="48px"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Perfumes
              </span>
              <span className="text-lg md:text-xl font-serif text-neutral-900">
                Tendencia RD
              </span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold text-neutral-900 mb-6 text-center"
          >
            Perfumes
            <span className="block text-neutral-500 font-light mt-2 text-lg md:text-2xl tracking-wide">
              Tendencia RD
            </span>
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed text-center"
        >
          Descubre fragancias que definen momentos, crean recuerdos y expresan tu
          esencia única. Lujo, elegancia y sofisticación en cada gota.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/catalogo">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider hover:bg-white/90 transition-colors duration-200"
            >
              Explorar Catálogo
            </motion.button>
          </Link>
          <Link href="/#destacados">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white/60 text-white font-semibold uppercase tracking-wider hover:border-white hover:text-white transition-all duration-200"
            >
              Comprar Ahora
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.button
          onClick={scrollToCatalog}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-neutral-500 hover:text-neutral-900 transition-colors"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </motion.div>
    </section>
  )
}
