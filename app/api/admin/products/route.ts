import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '../_utils'

export async function GET(request: Request) {
  const { authorized, response } = await verifyAdmin(request)
  if (!authorized) return response!

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { authorized, response } = await verifyAdmin(request)
  if (!authorized) return response!

  const payload = await request.json()
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
