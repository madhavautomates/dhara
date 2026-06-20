import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/utils'

export async function verifyAdmin(request: Request): Promise<{ authorized: boolean; response?: Response }> {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const token = auth.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user || !isAdminEmail(user.email)) {
    return { authorized: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { authorized: true }
}
