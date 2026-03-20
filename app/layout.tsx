import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/hooks/useCart'
import { StoreProvider } from '@/hooks/storeContext'

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
        <StoreProvider>
          <CartProvider>{children}</CartProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
