'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, Pill, ArrowLeft, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice, DELIVERY_CHARGE, DELIVERY_FREE_THRESHOLD } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore()
  const subtotal = total()
  const delivery = subtotal > 0 && subtotal < DELIVERY_FREE_THRESHOLD ? DELIVERY_CHARGE : 0
  const grandTotal = subtotal + delivery

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-sky-600">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          {items.length > 0 && (
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sm font-semibold text-sky-700">
              {items.length} item{items.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-24 text-center">
            <div className="rounded-full bg-gray-100 p-8 mb-6">
              <ShoppingBag className="h-14 w-14 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add medicines and healthcare products to get started</p>
            <Button asChild>
              <Link href="/products">
                Browse Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 rounded-2xl bg-white border border-gray-100 p-4">
                  <Link href={`/products/${product.id}`} className="relative h-20 w-20 shrink-0 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Pill className="h-10 w-10 text-sky-200" />
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <Link href={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-sky-600 transition-colors line-clamp-2 text-sm">
                      {product.name}
                    </Link>
                    <span className="text-xs text-gray-400">{product.category}</span>
                    <div className="flex items-center justify-between mt-auto flex-wrap gap-2">
                      <span className="text-lg font-bold text-sky-600">{formatPrice(product.price * quantity)}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-sky-600"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-sky-600"
                            disabled={quantity >= product.stock}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge</span>
                    <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                      {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                    </span>
                  </div>
                  {subtotal < DELIVERY_FREE_THRESHOLD && subtotal > 0 && (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                      💡 Add {formatPrice(DELIVERY_FREE_THRESHOLD - subtotal)} more for free delivery!
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span className="text-sky-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="mt-2 mb-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                  🚚 Cash on Delivery available · Pay when you receive
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
