'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="contacto" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
        >
          {/* Info */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">
              Hablemos de tu próxima{' '}
              <span className="text-neutral-500">fragancia</span>
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Si buscas una recomendación personalizada, colaboración o deseas
              más información sobre nuestra colección, completa el formulario o
              contáctanos directamente. Estaremos encantados de ayudarte.
            </p>
            <div className="space-y-3 text-sm text-neutral-700">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <p className="uppercase tracking-wide text-xs text-neutral-500">
                    Teléfono
                  </p>
                  <p className="font-medium text-neutral-900">809 980 9900</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <p className="uppercase tracking-wide text-xs text-neutral-500">
                    Correo
                  </p>
                  <p className="font-medium text-neutral-900">
                    contacto@perfumes-tendencia.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <p className="uppercase tracking-wide text-xs text-neutral-500">
                    WhatsApp
                  </p>
                  <a
                    href="https://wa.me/18099809900"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-800"
                  >
                    Escríbenos directamente
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-neutral-50 border border-neutral-200/80 shadow-sm px-6 py-8 md:px-8 space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                Nombre completo
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2.5 border border-neutral-200 bg-white text-neutral-900 text-sm outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400"
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2.5 border border-neutral-200 bg-white text-neutral-900 text-sm outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400"
                placeholder="tucorreo@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                Mensaje
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-3 py-2.5 border border-neutral-200 bg-white text-neutral-900 text-sm outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 resize-none"
                placeholder="Cuéntanos qué tipo de fragancias buscas, ocasión y estilo."
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black transition-colors"
            >
              Enviar mensaje
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  )
}
