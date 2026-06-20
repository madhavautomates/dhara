'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Pill, Menu, X, User, LogOut, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { isAdminEmail } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import EmailOTPModal from '@/components/EmailOTPModal'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount, openCart } = useCartStore()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const count = itemCount()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const isAdmin = isAdminEmail(user?.email)
  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/my-orders', label: 'My Orders' },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-sky-600 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span>MediShop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'text-sky-600'
                    : 'text-gray-600 hover:text-sky-600'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'text-sky-600'
                    : 'text-gray-600 hover:text-sky-600'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-gray-500 max-w-32 truncate">{user.email}</span>
                <Button variant="ghost" size="icon-sm" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => setLoginOpen(true)}
              >
                <User className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 pb-4 md:hidden">
            <div className="flex flex-col gap-1 pt-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === l.href
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Package className="inline h-4 w-4 mr-2" />
                  Admin
                </Link>
              )}
              {user ? (
                <div className="border-t border-gray-100 mt-2 pt-2 px-3">
                  <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="border-t border-gray-100 mt-2 pt-2 px-3">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => { setLoginOpen(true); setMenuOpen(false) }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <EmailOTPModal onSuccess={() => setLoginOpen(false)} />
        </DialogContent>
      </Dialog>
    </nav>
  )
}
