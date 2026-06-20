'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { calcDiscount } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

const CAT_ICON: Record<string, string> = {
  'Medicines':     '💊',
  'Vitamins':      '🌿',
  'Skincare':      '🧴',
  'Baby Care':     '🍼',
  'Surgical':      '🩺',
  'Personal Care': '🪥',
}

const CAT_TEXT: Record<string, string> = {
  'Medicines':     'text-sky-600',
  'Vitamins':      'text-green-600',
  'Skincare':      'text-pink-600',
  'Baby Care':     'text-yellow-600',
  'Surgical':      'text-red-600',
  'Personal Care': 'text-purple-600',
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const discount    = calcDiscount(product.price, product.mrp)
  const hasPrice    = product.price > 0
  const outOfStock  = product.stock === 0
  const mrp         = product.mrp ?? 0

  // placehold.co images look terrible — use emoji icon instead
  const isRealImage = product.image_url && !product.image_url.includes('placehold.co')
  const icon        = CAT_ICON[product.category] ?? '💊'
  const catText     = CAT_TEXT[product.category] ?? 'text-sky-600'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock || !hasPrice) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="h-full rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col overflow-hidden">

        {/* Image */}
        <div className="relative h-28 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
          {isRealImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url!}
              alt={product.name}
              className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 select-none">
              <span className="text-4xl">{icon}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${catText}`}>
                {product.category}
              </span>
            </div>
          )}

          {/* Badges */}
          {discount && hasPrice && (
            <span className="absolute top-1.5 left-1.5 rounded bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {discount}% off
            </span>
          )}
          {product.requires_prescription && (
            <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              <AlertCircle className="h-2 w-2" />Rx
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-2.5 py-2 gap-1">
          <p className="text-[10px] font-semibold text-gray-800 line-clamp-2 leading-tight flex-1">
            {product.name}
          </p>

          <div className="flex items-center gap-1.5">
            {hasPrice ? (
              <>
                <span className="text-sm font-bold text-gray-900">₹{product.price.toFixed(0)}</span>
                {mrp > product.price && (
                  <span className="text-[10px] text-gray-400 line-through">₹{mrp.toFixed(0)}</span>
                )}
                {discount && (
                  <span className="text-[9px] font-semibold text-green-600">{discount}% off</span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-gray-400 italic">Price not set</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock || !hasPrice}
            className={`mt-0.5 w-full rounded-lg border py-1.5 text-[11px] font-bold tracking-widest transition-all duration-150
              ${outOfStock || !hasPrice
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white active:scale-95'
              }`}
          >
            {outOfStock ? 'OUT OF STOCK' : !hasPrice ? 'PRICE PENDING' : 'ADD'}
          </button>
        </div>

      </div>
    </Link>
  )
}
