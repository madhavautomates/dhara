import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '../_utils'

export async function GET(request: Request) {
  const { authorized, response } = await verifyAdmin(request)
  if (!authorized) return response!

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const [todayOrdersRes, pendingRes, revenueRes, productsRes, ordersRes] = await Promise.all([
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('orders').select('total_amount').gte('created_at', todayISO),
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const todayRevenue = (revenueRes.data ?? []).reduce(
    (sum: number, o: { total_amount: number }) => sum + Number(o.total_amount), 0
  )

  return NextResponse.json({
    todayOrders: todayOrdersRes.count ?? 0,
    pendingOrders: pendingRes.count ?? 0,
    todayRevenue,
    totalProducts: productsRes.count ?? 0,
    recentOrders: ordersRes.data ?? [],
  })
}
