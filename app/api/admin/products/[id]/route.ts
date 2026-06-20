import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '../../_utils'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response } = await verifyAdmin(request)
  if (!authorized) return response!

  const { id } = await params
  const payload = await request.json()
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response } = await verifyAdmin(request)
  if (!authorized) return response!

  const { id } = await params
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
