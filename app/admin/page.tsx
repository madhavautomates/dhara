'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Package, TrendingUp, Clock, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'default' | 'orange' | 'success' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  dispatched: { label: 'Dispatched', variant: 'orange' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

interface Stats {
  todayOrders: number
  pendingOrders: number
  todayRevenue: number
  totalProducts: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user
      if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/')
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      const [todayOrdersRes, pendingRes, revenueRes, productsRes, ordersRes] = await Promise.all([
        supabaseAdmin.from('orders').select('id', { count: 'exact' }).gte('created_at', todayISO),
        supabaseAdmin.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabaseAdmin.from('orders').select('total_amount').gte('created_at', todayISO),
        supabaseAdmin.from('products').select('id', { count: 'exact' }).eq('is_active', true),
        supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
      ])

      const todayRevenue = (revenueRes.data ?? []).reduce((sum: number, o: { total_amount: number }) => sum + o.total_amount, 0)

      setStats({
        todayOrders: todayOrdersRes.count ?? 0,
        pendingOrders: pendingRes.count ?? 0,
        todayRevenue,
        totalProducts: productsRes.count ?? 0,
      })
      setRecentOrders(ordersRes.data ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  const statCards = stats ? [
    { icon: ShoppingBag, label: "Today's Orders", value: stats.todayOrders, color: 'text-sky-500', bg: 'bg-sky-50' },
    { icon: Clock, label: 'Pending Orders', value: stats.pendingOrders, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { icon: TrendingUp, label: "Today's Revenue", value: formatPrice(stats.todayRevenue), color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Package, label: 'Active Products', value: stats.totalProducts, color: 'text-purple-500', bg: 'bg-purple-50' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">MediShop management panel</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/products" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors">
              Manage Products
            </Link>
            <Link href="/admin/orders" className="rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5">
                <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : (
            statCards.map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg} mb-3`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))
          )}
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-sky-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const sc = statusConfig[order.status] ?? { label: order.status, variant: 'secondary' as const }
                    return (
                      <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-4 font-semibold text-sky-600">{formatPrice(order.total_amount)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={sc.variant as Parameters<typeof Badge>[0]['variant']}>{sc.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Link href="/admin/orders" className="text-gray-400 hover:text-sky-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {recentOrders.length === 0 && (
                <div className="py-16 text-center text-gray-400">No orders yet</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
