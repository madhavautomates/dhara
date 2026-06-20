'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, Trash2, ShoppingBag, Pill } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { formatPrice, DELIVERY_FREE_THRESHOLD, DELIVERY_CHARGE } from '@/lib/utils'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore()
  const subtotal = total()
  const delivery = subtotal > 0 && subtotal < DELIVERY_FREE_THRESHOLD ? DELIVERY_CHARGE : 0
  const grandTotal = subtotal + delivery

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
            {items.length > 0 && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="rounded-full bg-gray-100 p-6">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add medicines and healthcare products</p>
              </div>
              <Button onClick={closeCart} asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="relative h-16 w-16 shrink-0 rounded-lg bg-white overflow-hidden border border-gray-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Pill className="h-8 w-8 text-sky-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-sky-600">{formatPrice(product.price)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-gray-600 hover:text-sky-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-gray-600 hover:text-sky-600 transition-colors"
                          disabled={quantity >= product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </span>
              </div>
              {subtotal < DELIVERY_FREE_THRESHOLD && (
                <p className="text-xs text-gray-400">
                  Add {formatPrice(DELIVERY_FREE_THRESHOLD - subtotal)} more for free delivery
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-sky-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => closeCart()}
              asChild
            >
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
