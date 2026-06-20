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

const CAT_COLOR: Record<string, string> = {
  'Medicines':     '#e0f2fe',
  'Vitamins':      '#dcfce7',
  'Skincare':      '#fce7f3',
  'Baby Care':     '#fef9c3',
  'Surgical':      '#fee2e2',
  'Personal Care': '#f3e8ff',
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
  const discount    = calcDiscount(product.price, product.mrp)
  const hasPrice    = product.price > 0
  const outOfStock  = product.stock === 0
  const mrp         = product.mrp ?? 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock || !hasPrice) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden flex flex-col h-full">

        {/* ── Image area ── */}
        <div
          className="relative w-full"
          style={{ backgroundColor: CAT_COLOR[product.category] ?? '#e0f2fe', paddingBottom: '80%' }}
        >
          {/* image fills the padded box */}
          <div className="absolute inset-0 flex items-center justify-center p-3">
            {product.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <span className="text-4xl">{CAT_ICON[product.category] ?? '💊'}</span>
            )}
          </div>

          {/* Discount badge */}
          {discount && hasPrice && (
            <span className="absolute top-1.5 left-1.5 rounded bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
              {discount}% off
            </span>
          )}

          {/* Rx badge */}
          {product.requires_prescription && (
            <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
              <AlertCircle className="h-2.5 w-2.5" />Rx
            </span>
          )}

          {/* Out of stock */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border">Out of Stock</span>
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="flex flex-col flex-1 px-2.5 pt-2 pb-2.5 gap-1">
          {/* Category */}
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider truncate">
            {product.category}
          </p>

          {/* Name */}
          <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight flex-1">
            {product.name}
          </p>

          {/* Price */}
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            {hasPrice ? (
              <>
                <span className="text-[13px] font-bold text-gray-900">₹{product.price.toFixed(0)}</span>
                {mrp > 0 && mrp > product.price && (
                  <span className="text-[10px] text-gray-400 line-through">₹{mrp.toFixed(0)}</span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-gray-400 italic">Price not set</span>
            )}
          </div>

          {/* ADD button */}
          <button
            onClick={handleAdd}
            disabled={outOfStock || !hasPrice}
            className={`mt-1 w-full rounded-lg border py-[5px] text-[11px] font-bold tracking-widest transition-colors
              ${outOfStock || !hasPrice
                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                : 'border-orange-400 text-orange-500 bg-white hover:bg-orange-500 hover:text-white active:scale-95'
              }`}
          >
            {outOfStock ? 'OUT OF STOCK' : !hasPrice ? 'PRICE PENDING' : 'ADD'}
          </button>
        </div>
      </div>
    </Link>
  )
}
