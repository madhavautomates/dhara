'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { calcDiscount } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

const CAT_BG: Record<string, string> = {
  'Medicines':     'bg-sky-50',
  'Vitamins':      'bg-green-50',
  'Skincare':      'bg-pink-50',
  'Baby Care':     'bg-yellow-50',
  'Surgical':      'bg-red-50',
  'Personal Care': 'bg-purple-50',
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
  const bgClass    = CAT_BG[product.category] ?? 'bg-sky-50'
  const icon       = CAT_ICON[product.category] ?? '💊'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock || !hasPrice) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">

        {/* Image — fixed height 120px */}
        <div className={`relative h-28 w-full ${bgClass} flex items-center justify-center overflow-hidden`}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <span className="text-3xl">{icon}</span>
          )}

          {/* Badges */}
          {discount && hasPrice && (
            <span className="absolute top-1.5 left-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {discount}% off
            </span>
          )}
          {product.requires_prescription && (
            <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-red-100 border border-red-200 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
              <AlertCircle className="h-2 w-2" />Rx
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-gray-500">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-2.5 flex flex-col gap-1 flex-1">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            {product.category}
          </span>

          <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight flex-1 min-h-[2rem]">
            {product.name}
          </p>

          <div className="flex items-baseline gap-1">
            {hasPrice ? (
              <>
                <span className="text-sm font-bold text-gray-900">₹{product.price.toFixed(0)}</span>
                {(product.mrp ?? 0) > product.price && (
                  <span className="text-[10px] text-gray-400 line-through">₹{(product.mrp ?? 0).toFixed(0)}</span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-gray-400 italic">Price not set</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock || !hasPrice}
            className={`w-full rounded-lg border py-1 text-[11px] font-bold tracking-wide transition-colors mt-0.5
              ${outOfStock || !hasPrice
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white active:scale-95'
              }`}
          >
            {outOfStock ? 'Out of Stock' : !hasPrice ? 'Price Pending' : 'ADD'}
          </button>
        </div>
      </div>
    </Link>
  )
}
