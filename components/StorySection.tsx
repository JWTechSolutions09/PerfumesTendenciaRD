'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { useStore } from '@/hooks/storeContext'

export default function StorySection() {
  const { siteContent } = useStore()
  const ref1 = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)
  const inView1 = useInView(ref1, { once: true, margin: '-100px' })
  const inView2 = useInView(ref2, { once: true, margin: '-100px' })
  const inView3 = useInView(ref3, { once: true, margin: '-100px' })

  return (
    <section className="py-24 bg-neutral-50">
      {/* Story 1 */}
      <div ref={ref1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative h-96 lg:h-[500px] flex items-center justify-center bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-lg"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={inView1 ? { scale: 1, opacity: 1, rotate: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
              className="relative w-72 h-72 md:w-96 md:h-96 z-10"
            >
              <Image
                src={siteContent.heroLogoUrl}
                alt="Perfumes Tendencia RD"
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 288px, 384px"
                priority
              />
            </motion.div>
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100" />
            <div className="absolute top-4 right-4 w-32 h-32 bg-neutral-200/30 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-neutral-300/20 rounded-full blur-xl" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <Image
                  src={siteContent.heroLogoUrl}
                  alt="Perfumes Tendencia RD"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 64px, 80px"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-neutral-900">
                El Arte del{' '}
                <span className="text-neutral-500">Aroma</span>
              </h2>
            </div>
            <p className="text-neutral-700 text-lg leading-relaxed font-light">
              Cada fragancia cuenta una historia única. En Perfumes Tendencia RD, creemos
              que un perfume no es solo un aroma, es una expresión de identidad, un
              recuerdo que perdura y una experiencia sensorial que trasciende el
              tiempo.
            </p>
            <p className="text-neutral-600 leading-relaxed font-light">
              Nuestro catálogo cuidadosamente seleccionado reúne las creaciones más
              exquisitas de las casas de perfumería más prestigiosas del mundo,
              cada una con su propia narrativa olfativa.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Story 2 */}
      <div ref={ref2} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-6 order-2 lg:order-1"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-neutral-900">
              Lujo y{' '}
              <span className="text-neutral-500">Elegancia</span>
            </h2>
            <p className="text-neutral-700 text-lg leading-relaxed font-light">
              La elegancia no es solo apariencia, es una actitud. Cada botella en
              nuestra colección representa décadas de maestría artesanal, ingredientes
              de la más alta calidad y un compromiso inquebrantable con la excelencia.
            </p>
            <p className="text-neutral-600 leading-relaxed font-light">
              Desde los clásicos atemporales hasta las creaciones más vanguardistas,
              cada fragancia ha sido elegida por su capacidad de evocar emociones,
              crear conexiones y definir momentos inolvidables.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-96 lg:h-[500px] order-1 lg:order-2"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${siteContent.storyImageUrl})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Story 3 */}
      <div ref={ref3} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto space-y-6 bg-white border border-neutral-200 shadow-sm px-8 py-10 md:px-12 md:py-12 rounded-lg"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-neutral-900">
            Tu Esencia,{' '}
            <span className="text-neutral-500">Tu Historia</span>
          </h2>
          <p className="text-neutral-700 text-lg leading-relaxed font-light">
            En Perfumes Tendencia RD, entendemos que elegir una fragancia es un viaje
            personal. Por eso, nuestro equipo de expertos está dedicado a ayudarte
            a encontrar el aroma perfecto que resuene con tu personalidad única.
          </p>
          <p className="text-neutral-600 leading-relaxed font-light">
            Descubre la fragancia que te define. Explora nuestro catálogo y deja que
            cada nota te guíe hacia una experiencia olfativa inolvidable.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
