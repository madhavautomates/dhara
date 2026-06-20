'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, AlertCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { calcDiscount } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

const CAT_BG: Record<string, string> = {
  'Medicines':     '#e0f2fe',
  'Vitamins':      '#dcfce7',
  'Skincare':      '#fce7f3',
  'Baby Care':     '#fef9c3',
  'Surgical':      '#fee2e2',
  'Personal Care': '#f3e8ff',
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const discount  = calcDiscount(product.price, product.mrp)
  const hasPrice  = product.price > 0
  const outOfStock = product.stock === 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock || !hasPrice) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  const imgBg = CAT_BG[product.category] ?? '#e0f2fe'

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 h-full flex flex-col overflow-hidden">

        {/* Rx badge */}
        {product.requires_prescription && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 rounded-full bg-red-50 border border-red-200 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
            <AlertCircle className="h-2.5 w-2.5" />
            Rx
          </div>
        )}

        {/* Discount badge */}
        {discount && hasPrice && (
          <div className="absolute top-2 right-2 z-10 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {discount}% off
          </div>
        )}

        {/* Image area */}
        <div
          className="relative flex items-center justify-center p-4 overflow-hidden"
          style={{ backgroundColor: imgBg, aspectRatio: '1/1' }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="text-4xl select-none">💊</div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 p-3 gap-1.5">
          {/* Category chip */}
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
            {product.category}
          </span>

          {/* Name */}
          <h3 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-baseline gap-1.5 mt-1">
            {hasPrice ? (
              <>
                <span className="text-sm font-bold text-gray-900">
                  ₹{product.price.toFixed(0)}
                </span>
                {product.mrp > 0 && product.mrp > product.price && (
                  <span className="text-[11px] text-gray-400 line-through">
                    ₹{product.mrp.toFixed(0)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">Price not set</span>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={outOfStock || !hasPrice}
            className={`mt-1 w-full rounded-lg border py-1.5 text-xs font-bold tracking-wide transition-colors
              ${outOfStock || !hasPrice
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white'
              }`}
          >
            {outOfStock ? 'OUT OF STOCK' : !hasPrice ? 'PRICE PENDING' : 'ADD'}
          </button>
        </div>
      </div>
    </Link>
  )
}
