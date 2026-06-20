'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types'
import { toast } from 'sonner'

export default function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCartStore()

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product)
    toast.success(`${qty} × ${product.name} added to cart`)
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-sky-600 transition-colors disabled:opacity-40"
          disabled={qty <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-semibold text-gray-900">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-sky-600 transition-colors disabled:opacity-40"
          disabled={qty >= product.stock}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button
        className="flex-1"
        size="lg"
        disabled={product.stock === 0}
        onClick={handleAdd}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  )
}
