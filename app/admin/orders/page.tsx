'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderWithItems, OrderStatus } from '@/types'
import { ORDER_STATUSES } from '@/types'
import { toast } from 'sonner'

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'default' | 'orange' | 'success' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  dispatched: { label: 'Dispatched', variant: 'orange' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? ''
}

function OrderCard({ order, onStatusChange }: { order: OrderWithItems; onStatusChange: (id: string, status: OrderStatus) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { label, variant } = statusConfig[order.status]

  const handleStatus = async (newStatus: OrderStatus) => {
    setUpdating(true)
    const token = await getToken()
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdating(false)
    if (!res.ok) { toast.error('Failed to update status'); return }
    onStatusChange(order.id, newStatus)
    toast.success(`Status updated to ${newStatus}`)
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between p-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
          <div>
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="font-mono font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Customer</p>
            <p className="font-medium text-gray-900 truncate">{order.customer_name}</p>
            <p className="text-xs text-gray-500">{order.customer_phone}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">Date</p>
            <p className="font-medium text-gray-700">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total</p>
            <p className="font-bold text-sky-600">{formatPrice(order.total_amount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Badge variant={variant as Parameters<typeof Badge>[0]['variant']}>{label}</Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mb-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium text-gray-700">{order.customer_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="font-medium text-gray-700">{order.customer_phone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400">Delivery Address</p>
              <p className="font-medium text-gray-700">{order.delivery_address}, {order.city} — {order.pincode}</p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">Notes</p>
                <p className="font-medium text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
          <div className="space-y-2 mb-4">
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
            <div className="flex justify-between font-bold text-gray-900 pt-2 text-sm">
              <span>Total</span>
              <span className="text-sky-600">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">Update Status:</p>
            <div className="flex-1 max-w-48">
              <Select value={order.status} onValueChange={(v) => handleStatus(v as OrderStatus)} disabled={updating}>
                <SelectTrigger className={updating ? 'opacity-50' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s: OrderStatus) => (
                    <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {updating && <RefreshCw className="h-4 w-4 animate-spin text-sky-500" />}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/'); return
      }
      const token = await getToken()
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setOrders(await res.json())
      setLoading(false)
    })
  }, [router])

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setOrders((os) => os.map((o) => o.id === id ? { ...o, status } : o))
  }

  const filteredOrders = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab)

  const tabs = [
    { value: 'all', label: 'All', count: orders.length },
    ...ORDER_STATUSES.map((s: OrderStatus) => ({
      value: s,
      label: statusConfig[s].label,
      count: orders.filter((o) => o.status === s).length,
    })),
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-gray-400 hover:text-sky-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} total orders</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-1">
            <TabsList className="mb-4 gap-1 h-auto flex-wrap bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:border-sky-500 data-[state=active]:shadow-none"
                >
                  {tab.label}
                  <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-semibold data-[state=active]:bg-sky/20">
                    {tab.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-16 text-center text-gray-400 rounded-2xl bg-white border border-gray-100">
                  No {tab.value === 'all' ? '' : tab.label.toLowerCase()} orders
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
