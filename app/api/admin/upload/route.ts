import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '../_utils'

export async function POST(request: Request) {
  const { authorized, response } = await verifyAdmin(request)
  if (!authorized) return response!

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `products/${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
