import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/hooks/useCart'

export const metadata: Metadata = {
  title: 'Perfumes Tendencia RD - Tienda de Perfumes Premium',
  description:
    'Perfumes Tendencia RD: fragancias exclusivas de las marcas más prestigiosas del mundo. Elegancia, sofisticación y lujo en cada experiencia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
