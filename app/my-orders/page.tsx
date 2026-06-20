'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderWithItems, OrderStatus } from '@/types'
import type { User } from '@supabase/supabase-js'

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'default' | 'orange' | 'success' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  dispatched: { label: 'Dispatched', variant: 'orange' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

function OrderRow({ order }: { order: OrderWithItems }) {
  const [expanded, setExpanded] = useState(false)
  const { label, variant } = statusConfig[order.status] ?? { label: order.status, variant: 'secondary' as const }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="rounded-xl bg-sky-50 p-2 shrink-0">
            <Package className="h-5 w-5 text-sky-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 font-mono text-sm">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <Badge variant={variant as Parameters<typeof Badge>[0]['variant']}>{label}</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''} · {order.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-bold text-sky-600">{formatPrice(order.total_amount)}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mb-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Delivery Address</p>
              <p className="font-medium text-gray-700">{order.delivery_address}, {order.city} — {order.pincode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <p className="font-medium text-gray-700">Cash on Delivery</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</p>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="font-semibold text-sky-600">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-900 pt-2">
              <span>Total</span>
              <span className="text-sky-600">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user
      if (!u) {
        router.push('/checkout')
        return
      }
      setUser(u)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
      setOrders(ordersData ?? [])
      setLoading(false)
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-6 w-6 text-sky-500" />
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          {!loading && (
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sm font-semibold text-sky-700">
              {orders.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-24 text-center">
            <div className="rounded-full bg-gray-100 p-8 mb-6">
              <Package className="h-14 w-14 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button
              className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600 transition-colors"
              onClick={() => router.push('/products')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
