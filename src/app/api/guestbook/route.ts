import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  message: z.string().min(1).max(280),
})

export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('guestbook_entries')
    .select('id, display_name, avatar_url, provider, message, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 422 })
  }

  const meta = user.user_metadata
  const display_name = meta.full_name || meta.user_name || meta.name || user.email || 'Anonymous'
  const avatar_url = meta.avatar_url || meta.picture || null
  const provider = user.app_metadata.provider ?? 'unknown'

  const admin = createAdminClient()
  const { error } = await admin.from('guestbook_entries').insert({
    user_id: user.id,
    display_name,
    avatar_url,
    provider,
    message: parsed.data.message,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
