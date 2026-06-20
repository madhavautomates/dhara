'use client'

import Link from 'next/link'
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

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const discount   = calcDiscount(product.price, product.mrp)
  const hasPrice   = product.price > 0
  const outOfStock = product.stock === 0
  const mrp        = product.mrp ?? 0
  const isRealImg  = !!product.image_url && !product.image_url.includes('placehold.co')

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock || !hasPrice) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow duration-150 overflow-hidden flex flex-col">

        {/* ── Image ── */}
        <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: 130 }}>
          {isRealImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url!}
              alt={product.name}
              className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <span className="text-5xl select-none">{CAT_ICON[product.category] ?? '💊'}</span>
          )}

          {/* Rx */}
          {product.requires_prescription && (
            <span className="absolute top-1 right-1 rounded bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white leading-none">Rx</span>
          )}

          {/* Out of stock */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-gray-500 border border-gray-300 bg-white px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col gap-1 px-2 pt-1.5 pb-2">
          {/* Name */}
          <p className="text-[11px] font-medium text-gray-800 leading-snug line-clamp-2 min-h-[2.4em]">
            {product.name}
          </p>

          {/* Price row */}
          {hasPrice ? (
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-[13px] font-bold text-gray-900">₹{product.price.toFixed(0)}</span>
              {mrp > product.price && (
                <span className="text-[10px] text-gray-400 line-through">₹{mrp.toFixed(0)}</span>
              )}
              {discount && (
                <span className="text-[9px] font-semibold text-green-600">{discount}% off</span>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 italic">Price not set</p>
          )}

          {/* ADD button */}
          <button
            onClick={handleAdd}
            disabled={outOfStock || !hasPrice}
            className={`mt-0.5 w-full rounded border py-1 text-[11px] font-bold tracking-wider transition-colors
              ${outOfStock
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : !hasPrice
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-orange-400 text-orange-500 hover:bg-orange-50 active:bg-orange-100'
              }`}
          >
            {outOfStock ? 'OUT OF STOCK' : !hasPrice ? 'PRICE PENDING' : 'ADD'}
          </button>
        </div>

      </div>
    </Link>
  )
}
