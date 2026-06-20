import Link from 'next/link'
import { ArrowRight, Truck, ShieldCheck, Tag, RotateCcw, Pill, Heart, Baby, Scissors, User, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Product } from '@/types'
import SearchBar from '@/components/SearchBar'

async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
}

const categories = [
  { name: 'Medicines', icon: Pill, color: 'bg-blue-50 text-blue-600 border-blue-100', href: '/products?category=Medicines' },
  { name: 'Vitamins', icon: FlaskConical, color: 'bg-green-50 text-green-600 border-green-100', href: '/products?category=Vitamins' },
  { name: 'Skincare', icon: Heart, color: 'bg-pink-50 text-pink-600 border-pink-100', href: '/products?category=Skincare' },
  { name: 'Baby Care', icon: Baby, color: 'bg-yellow-50 text-yellow-600 border-yellow-100', href: '/products?category=Baby Care' },
  { name: 'Surgical', icon: Scissors, color: 'bg-red-50 text-red-600 border-red-100', href: '/products?category=Surgical' },
  { name: 'Personal Care', icon: User, color: 'bg-purple-50 text-purple-600 border-purple-100', href: '/products?category=Personal Care' },
]

const features = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Same day delivery in Indore city area', color: 'text-sky-500' },
  { icon: ShieldCheck, title: 'Genuine Products', desc: '100% authentic medicines from licensed distributors', color: 'text-green-500' },
  { icon: Tag, title: 'Best Prices', desc: 'Lowest prices guaranteed on all products', color: 'text-orange-500' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free returns within 7 days', color: 'text-purple-500' },
]

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white opacity-5 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white opacity-5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Delivering in Kasrawad, Barwani, MP
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
              Your Trusted Medical Store in{' '}
              <span className="text-yellow-300">Kasrawad</span>
            </h1>
            <p className="text-lg sm:text-xl text-sky-100 mb-8 max-w-xl">
              Fast delivery at your doorstep. Genuine medicines, vitamins, and healthcare products at the best prices.
            </p>
            <SearchBar />
            <div className="flex flex-wrap gap-3 mt-6">
              <Button size="lg" variant="outline" className="bg-white text-sky-700 border-white hover:bg-sky-50 hover:text-sky-800" asChild>
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 mt-1">Find exactly what you need</p>
          </div>
          <Link href="/products" className="text-sky-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ name, icon: Icon, color, href }) => (
            <Link
              key={name}
              href={href}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-white"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${color}`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-500 mt-1">Top-selling medicines and healthcare products</p>
              </div>
              <Link href="/products" className="text-sky-600 text-sm font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Choose MediShop?</h2>
          <p className="text-gray-500 mt-2">We care about your health and convenience</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Need medicines delivered today?
          </h2>
          <p className="text-sky-100 mb-6 max-w-md mx-auto">
            Order before 6 PM for same-day delivery in Kasrawad. Free delivery on orders above ₹500.
          </p>
          <Button size="lg" className="bg-white text-sky-700 hover:bg-sky-50 font-semibold" asChild>
            <Link href="/products">
              Order Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
