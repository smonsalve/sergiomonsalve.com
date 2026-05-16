import { createAdminClient } from '@/lib/supabase/server'
import { getAllBooks, getBook, VALID_STATUSES } from '@/lib/library'
import type { BookStatus } from '@/lib/library'

export type BookSource = 'audible' | 'manual'
export type BookSourceType = 'physical' | 'ebook' | 'other'

export type UnifiedBook = {
  id: string
  source: BookSource
  source_type?: BookSourceType
  title: string
  authors: string[]
  narrators: string[]
  cover_url: string
  runtime_length_min: number
  purchase_date: string
  description: string
  visible: boolean
  status: BookStatus
  rating: number | null
}

export type UnifiedBookDetail = UnifiedBook & {
  highlights: string[]
  review_md: string | null
}

export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(id)
}

function toStatus(s: string): BookStatus {
  return VALID_STATUSES.includes(s as BookStatus) ? (s as BookStatus) : 'queued'
}

export async function getAllUnifiedBooks(locale: string): Promise<UnifiedBook[]> {
  const admin = createAdminClient()

  const [manualResult, overridesResult, notesResult] = await Promise.all([
    admin.from('manual_books').select('*'),
    admin.from('library_books').select('asin, visible, status'),
    admin.from('book_notes').select('book_id, rating'),
  ])

  const overrideMap = new Map((overridesResult.data ?? []).map(r => [r.asin, r]))
  const notesMap = new Map((notesResult.data ?? []).map(r => [r.book_id, r.rating as number | null]))

  const audibleBooks: UnifiedBook[] = getAllBooks(locale).map(book => {
    const o = overrideMap.get(book.asin)
    return {
      id: book.asin,
      source: 'audible' as const,
      title: book.title,
      authors: book.authors,
      narrators: book.narrators,
      cover_url: book.cover_url,
      runtime_length_min: book.runtime_length_min,
      purchase_date: book.purchase_date,
      description: book.publisher_summary,
      visible: o ? Boolean(o.visible) : true,
      status: toStatus(o?.status ?? book.status),
      rating: notesMap.has(book.asin) ? notesMap.get(book.asin) ?? null : book.rating,
    }
  })

  const manualBooks: UnifiedBook[] = (manualResult.data ?? []).map(b => ({
    id: b.id as string,
    source: 'manual' as const,
    source_type: (b.source_type ?? 'physical') as BookSourceType,
    title: b.title as string,
    authors: (b.authors ?? []) as string[],
    narrators: [],
    cover_url: (b.cover_url ?? '') as string,
    runtime_length_min: 0,
    purchase_date: ((b.added_at as string | null)?.split('T')[0]) ?? '',
    description: (b.description ?? '') as string,
    visible: Boolean(b.visible),
    status: toStatus(b.status ?? 'queued'),
    rating: notesMap.has(b.id) ? notesMap.get(b.id) ?? null : null,
  }))

  return [...audibleBooks, ...manualBooks]
    .filter(b => b.visible)
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
}

export async function getUnifiedBook(id: string, locale: string): Promise<UnifiedBookDetail | null> {
  const admin = createAdminClient()

  if (isUuid(id)) {
    const { data: book } = await admin.from('manual_books').select('*').eq('id', id).maybeSingle()
    if (!book) return null
    const { data: notes } = await admin.from('book_notes').select('*').eq('book_id', id).maybeSingle()
    return {
      id: book.id as string,
      source: 'manual' as const,
      source_type: (book.source_type ?? 'physical') as BookSourceType,
      title: book.title as string,
      authors: (book.authors ?? []) as string[],
      narrators: [],
      cover_url: (book.cover_url ?? '') as string,
      runtime_length_min: 0,
      purchase_date: ((book.added_at as string | null)?.split('T')[0]) ?? '',
      description: (book.description ?? '') as string,
      visible: Boolean(book.visible),
      status: toStatus(book.status ?? 'queued'),
      rating: (notes?.rating as number | null) ?? null,
      highlights: (notes?.highlights as string[] | null) ?? [],
      review_md: (notes?.review_md as string | null) ?? null,
    }
  }

  const book = getBook(id, locale)
  if (!book) return null

  const [overrideResult, notesResult] = await Promise.all([
    admin.from('library_books').select('visible, status').eq('asin', id).maybeSingle(),
    admin.from('book_notes').select('*').eq('book_id', id).maybeSingle(),
  ])

  const o = overrideResult.data
  const n = notesResult.data

  return {
    id: book.asin,
    source: 'audible' as const,
    title: book.title,
    authors: book.authors,
    narrators: book.narrators,
    cover_url: book.cover_url,
    runtime_length_min: book.runtime_length_min,
    purchase_date: book.purchase_date,
    description: book.publisher_summary,
    visible: o ? Boolean(o.visible) : true,
    status: toStatus(o?.status ?? book.status),
    rating: (n?.rating as number | null) ?? book.rating,
    highlights: (n?.highlights as string[] | null) ?? book.highlights,
    review_md: (n?.review_md as string | null) ?? null,
  }
}
