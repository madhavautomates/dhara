import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertCircle, ArrowLeft, Pill } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'
import type { Product } from '@/types'
import { formatPrice, calcDiscount } from '@/lib/utils'

interface Props { params: Promise<{ id: string }> }

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  return data
}

async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(4)
  return data ?? []
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)
  const discount = calcDiscount(product.price, product.mrp)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-sky-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative bg-gray-50 flex items-center justify-center p-8 min-h-80">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-contain max-h-80 w-auto"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center">
                  <Pill className="h-32 w-32 text-sky-200" />
                </div>
              )}
              {discount && (
                <div className="absolute top-4 left-4 rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-white">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="default">{product.category}</Badge>
                {product.requires_prescription && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Prescription Required
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>
              )}

              <Separator className="my-4" />

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-sky-600">{formatPrice(product.price)}</span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                )}
              </div>
              {discount && (
                <p className="text-sm text-green-600 font-medium mb-4">
                  You save {formatPrice(product.mrp! - product.price)} ({discount}% off)
                </p>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-5">
                <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {product.stock > 10
                    ? 'In Stock'
                    : product.stock > 0
                    ? `Only ${product.stock} left!`
                    : 'Out of Stock'}
                </span>
              </div>

              {product.requires_prescription && (
                <div className="flex gap-2 rounded-xl bg-red-50 border border-red-100 p-3 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    This medicine requires a valid prescription. Please upload your prescription at the time of delivery.
                  </p>
                </div>
              )}

              <AddToCartSection product={product} />

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Delivery', value: 'Free above ₹500' },
                  { label: 'Returns', value: '7 days easy return' },
                  { label: 'Payment', value: 'Cash on Delivery' },
                  { label: 'Authenticity', value: 'Genuine product' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
