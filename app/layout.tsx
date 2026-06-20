import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'MediShop — Trusted Medical Store in Indore',
  description:
    'Order medicines, vitamins, skincare, and healthcare products online. Fast delivery in Indore, MP. Genuine products at best prices.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-white text-gray-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px' },
          }}
        />
      </body>
    </html>
  )
}
