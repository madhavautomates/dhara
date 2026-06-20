import Link from 'next/link'
import { Pill, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-sky-600 text-xl mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span>MediShop</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your trusted medical store in Indore. We deliver genuine medicines and healthcare products right to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/products', label: 'Products' },
                { href: '/my-orders', label: 'My Orders' },
                { href: '/cart', label: 'Cart' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-sky-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                <span>Indore, Madhya Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4 text-sky-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4 text-sky-500 shrink-0" />
                <span>support@medishop.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© 2024 MediShop. All rights reserved.</p>
          <p className="text-xs text-gray-400">Fast Delivery · Genuine Products · Best Prices</p>
        </div>
      </div>
    </footer>
  )
}
