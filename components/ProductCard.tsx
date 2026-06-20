'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, AlertCircle, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { formatPrice, calcDiscount } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()

  const discount = calcDiscount(product.price, product.mrp)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.stock === 0) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gray-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Pill className="h-16 w-16 text-sky-200" />
            </div>
          )}
          {discount && (
            <div className="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
              {discount}% OFF
            </div>
          )}
          {product.requires_prescription && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                Rx
              </Badge>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="font-semibold text-gray-500 text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <Badge variant="secondary" className="w-fit mb-2 text-[10px]">
            {product.category}
          </Badge>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 flex-1">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-sky-600">{formatPrice(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>

          <Button
            size="sm"
            className="w-full"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  )
}
