import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getAllBooks } from '@/lib/library'
import type { BookStatus } from '@/lib/library'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: rows, error } = await admin
    .from('library_books')
    .select('asin, visible, status')
  if (error) return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 })

  const overrideMap = new Map((rows ?? []).map(r => [r.asin, r]))
  const books = getAllBooks('es').map(book => {
    const o = overrideMap.get(book.asin)
    return {
      asin: book.asin,
      title: book.title,
      authors: book.authors,
      cover_url: book.cover_url,
      runtime_length_min: book.runtime_length_min,
      visible: o ? Boolean(o.visible) : true,
      status: o ? (o.status as BookStatus) : book.status,
    }
  })

  return NextResponse.json({ books })
}
