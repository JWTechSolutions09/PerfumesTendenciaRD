'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    tienda: [
      { href: '/#catalogo', label: 'Catálogo' },
      { href: '/#marcas', label: 'Marcas' },
      { href: '/#destacados', label: 'Destacados' },
    ],
    empresa: [
      { href: '/#sobre-nosotros', label: 'Sobre Nosotros' },
      { href: '/#contacto', label: 'Contacto' },
      { href: '/politica-privacidad', label: 'Política de Privacidad' },
    ],
  }

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ]

  return (
    <footer className="bg-black text-white/80 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-serif font-bold text-white mb-4">
                Perfumes Tendencia RD
              </h3>
              <p className="text-white/60 mb-6 max-w-md font-light leading-relaxed">
                Tu destino para fragancias premium de las marcas más exclusivas del
                mundo. Elegancia, sofisticación y lujo en cada experiencia.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-white/60 hover:text-white transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Links */}
          <div>
            <motion.h4
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white font-semibold mb-4 uppercase tracking-wider text-sm"
            >
              Tienda
            </motion.h4>
            <ul className="space-y-2">
              {footerLinks.tienda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors font-light text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <motion.h4
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white font-semibold mb-4 uppercase tracking-wider text-sm"
            >
              Empresa
            </motion.h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors font-light text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 pt-12 border-t border-white/10"
        >
          <div className="max-w-md">
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              Suscríbete a nuestro newsletter
            </h4>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-white text-black font-semibold uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm"
        >
          <p>© {currentYear} Perfumes Tendencia RD. Todos los derechos reservados.</p>
        </motion.div>
      </div>
    </footer>
  )
}
