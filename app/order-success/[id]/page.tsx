import Link from 'next/link'
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderWithItems } from '@/types'

interface Props { params: Promise<{ id: string }> }

async function getOrder(id: string): Promise<OrderWithItems | null> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()
  return data
}

export default async function OrderSuccessPage({ params }: Props) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Button asChild><Link href="/">Go Home</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        {/* Success Card */}
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-500 mb-4">
            Thank you for your order. We&apos;ll confirm it shortly.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-mono text-gray-600">
            Order ID: {order.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-sky-500" />
            <h2 className="font-bold text-gray-900">Delivery Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Estimated Delivery</p>
              <p className="font-semibold text-gray-900">2–4 Business Days</p>
            </div>
            <div>
              <p className="text-gray-400">Payment</p>
              <p className="font-semibold text-gray-900">Cash on Delivery</p>
            </div>
            <div>
              <p className="text-gray-400">Deliver To</p>
              <p className="font-semibold text-gray-900">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-gray-400">Order Date</p>
              <p className="font-semibold text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Address</p>
              <p className="font-semibold text-gray-900">
                {order.delivery_address}, {order.city} — {order.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-sky-500" />
            <h2 className="font-bold text-gray-900">Order Items</h2>
            <Badge variant="secondary">{order.order_items.length} items</Badge>
          </div>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="text-sm font-bold text-sky-600">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className={order.delivery_charge === 0 ? 'text-green-600 font-medium' : ''}>
                {order.delivery_charge === 0 ? 'FREE' : formatPrice(order.delivery_charge)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
              <span>Total Amount</span>
              <span className="text-sky-600">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" asChild>
            <Link href="/my-orders">
              <Package className="h-4 w-4 mr-2" />
              Track Order
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
