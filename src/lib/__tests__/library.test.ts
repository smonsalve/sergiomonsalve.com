import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'fs'
import { getAllBooks, getBook, getBookAsins } from '../library'

const mockBook = {
  asin: 'B001TEST00',
  title: 'Test Book',
  authors: ['Author A'],
  narrators: ['Narrator A'],
  cover_url: 'https://m.media-amazon.com/test.jpg',
  runtime_length_min: 480,
  purchase_date: '2024-01-01',
  percent_complete: 0,
  publisher_summary: 'A test book',
}

afterEach(() => vi.restoreAllMocks())

describe('getAllBooks', () => {
  it('returns empty array when library.json does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(getAllBooks('es')).toEqual([])
  })

  it('returns books with status queued and rating null when no MDX file exists', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as unknown as Buffer)
    const books = getAllBooks('es')
    expect(books).toHaveLength(1)
    expect(books[0].status).toBe('queued')
    expect(books[0].rating).toBeNull()
  })

  it('merges status and rating from MDX frontmatter when MDX file exists', () => {
    const mdx = `---\nstatus: completed\nrating: 4\n---\n\nReview.`
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
      if (String(p).endsWith('library.json')) return JSON.stringify([mockBook]) as unknown as Buffer
      return mdx as unknown as Buffer
    })
    const books = getAllBooks('es')
    expect(books[0].status).toBe('completed')
    expect(books[0].rating).toBe(4)
  })
})

describe('getBook', () => {
  it('returns null when library.json does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(getBook('B001TEST00', 'es')).toBeNull()
  })

  it('returns null when asin is not in library.json', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([]) as unknown as Buffer)
    expect(getBook('NOTEXIST', 'es')).toBeNull()
  })

  it('returns book with empty highlights and null content when no MDX file', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as unknown as Buffer)
    const book = getBook('B001TEST00', 'es')
    expect(book).not.toBeNull()
    expect(book!.highlights).toEqual([])
    expect(book!.content).toBeNull()
    expect(book!.status).toBe('queued')
  })

  it('returns book with highlights and content from MDX when file exists', () => {
    const mdx = `---\nstatus: completed\nrating: 5\nhighlights:\n  - "Great quote"\n---\n\nMy review.`
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
      if (String(p).endsWith('library.json')) return JSON.stringify([mockBook]) as unknown as Buffer
      return mdx as unknown as Buffer
    })
    const book = getBook('B001TEST00', 'es')
    expect(book!.highlights).toEqual(['Great quote'])
    expect(book!.content).toContain('My review.')
    expect(book!.rating).toBe(5)
  })
})

describe('getBookAsins', () => {
  it('returns empty array when library.json does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(getBookAsins()).toEqual([])
  })

  it('returns array of asins from library.json', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as unknown as Buffer)
    expect(getBookAsins()).toEqual(['B001TEST00'])
  })
})
