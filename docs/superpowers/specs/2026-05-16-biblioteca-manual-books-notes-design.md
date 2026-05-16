# Biblioteca: Libros Manuales + Notas — Design Spec

**Date:** 2026-05-16
**Status:** Approved

---

## Overview

Extend the `/biblioteca` section with two capabilities:
1. **Manual books** — add physical books, ebooks, and others (not from Audible) via an admin form with external metadata search (Google Books + Open Library fallback).
2. **Notes management** — edit rating, highlights, and Markdown review for any book (Audible or manual) from the admin panel. Notes move from static MDX files to Supabase so they're editable without commits.

All manual books and notes are stored in Supabase. The public `/biblioteca` page shows all books (Audible + manual) merged into a single list.

---

## Database Tables

### `manual_books`

```sql
CREATE TABLE manual_books (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  authors        TEXT[] NOT NULL DEFAULT '{}',
  cover_url      TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  source_type    TEXT NOT NULL DEFAULT 'physical',  -- 'physical' | 'ebook' | 'other'
  isbn           TEXT,
  published_year INT,
  visible        BOOLEAN NOT NULL DEFAULT TRUE,
  status         TEXT NOT NULL DEFAULT 'queued',
  added_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### `book_notes`

Notes shared across both Audible books (keyed by ASIN) and manual books (keyed by UUID).

```sql
CREATE TABLE book_notes (
  book_id     TEXT PRIMARY KEY,  -- ASIN for Audible, UUID for manual
  rating      INT CHECK (rating >= 1 AND rating <= 5),
  highlights  TEXT[] NOT NULL DEFAULT '{}',
  review_md   TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**`library_books` table is unchanged** — continues to manage visibility/status overrides for Audible books only.

---

## Unified Book Type

A new `UnifiedBook` type replaces `BookMeta` in contexts where Audible and manual books are combined:

```ts
export type BookSource = 'audible' | 'manual'
export type BookSourceType = 'physical' | 'ebook' | 'other'

export type UnifiedBook = {
  id: string              // ASIN for Audible, UUID for manual
  source: BookSource
  source_type?: BookSourceType  // only for manual
  title: string
  authors: string[]
  narrators: string[]     // empty for manual
  cover_url: string
  runtime_length_min: number   // 0 for physical/ebook
  purchase_date: string   // added_at for manual
  description: string     // publisher_summary for Audible
  visible: boolean
  status: BookStatus
  rating: number | null   // from book_notes
}

export type UnifiedBookDetail = UnifiedBook & {
  highlights: string[]
  review_md: string | null
}
```

`BookMeta` is kept for the existing Audible-only functions (`getAllBooks`, `getBook`). New functions return `UnifiedBook`.

---

## New lib functions in `src/lib/library.ts`

```ts
// Merge Audible books + manual books from Supabase into unified list
// Called server-side from pages (not exported as sync helper)
export async function getAllUnifiedBooks(
  locale: string,
  supabase: SupabaseClient
): Promise<UnifiedBook[]>

// Get single book by id (ASIN or UUID) for detail page
export async function getUnifiedBook(
  id: string,
  locale: string,
  supabase: SupabaseClient
): Promise<UnifiedBookDetail | null>
```

`getAllUnifiedBooks` internally:
1. Reads Audible books from `getAllBooks(locale)` (existing sync function)
2. Queries `manual_books` from Supabase
3. Queries `library_books` for Audible overrides
4. Queries `book_notes` for ratings
5. Merges and sorts by date descending

`getUnifiedBook` handles both sources: if `id` is a valid UUID (matches `/^[0-9a-f]{8}-[0-9a-f]{4}-/i`) use manual path; otherwise treat as ASIN and use Audible path.

---

## API Routes

### `GET /api/admin/book-search?q=`

```
src/app/api/admin/book-search/route.ts
```

- Auth guard
- Tries Google Books API first: `https://www.googleapis.com/books/v1/volumes?q={q}&maxResults=8`
- If 0 results, falls back to Open Library: `https://openlibrary.org/search.json?q={q}&limit=8`
- Returns:
```ts
{ results: SearchResult[] }

type SearchResult = {
  title: string
  authors: string[]
  cover_url: string
  description: string
  isbn?: string
  published_year?: number
}
```
- No external API key required for either source at this volume.

### `POST /api/admin/manual-books`

```
src/app/api/admin/manual-books/route.ts
```

- Auth guard
- Zod-validates body: `{ title, authors[], cover_url, description, source_type, isbn?, published_year? }`
- Inserts into `manual_books`
- Returns `{ id, ...book }`

### `DELETE /api/admin/manual-books/[id]`

```
src/app/api/admin/manual-books/[id]/route.ts
```

- Auth guard
- Deletes from `manual_books` by UUID
- Also deletes corresponding `book_notes` row if exists
- Returns `{ success: true }`

### `GET /api/admin/book-notes/[id]`

```
src/app/api/admin/book-notes/[id]/route.ts
```

- Auth guard
- Queries `book_notes` by `book_id`
- Returns `{ rating, highlights, review_md }` or `{ rating: null, highlights: [], review_md: '' }` if no row

### `PUT /api/admin/book-notes/[id]`

```
src/app/api/admin/book-notes/[id]/route.ts
```

- Auth guard
- Zod-validates body: `{ rating?: number|null, highlights?: string[], review_md?: string }`
- Upserts into `book_notes`
- Returns `{ book_id, rating, highlights, review_md }`

### Updated `GET /api/admin/biblioteca`

Add manual books to the response: queries `manual_books` table and appends them (with their `visible`/`status` from the table directly, not from `library_books`).

---

## Admin Pages

### `/admin/biblioteca` (modified)

- Add **"+ Agregar libro"** button in header → links to `/admin/biblioteca/add`
- Each book row adds a **"notas →"** button → links to `/admin/biblioteca/[id]/notes`
- Manual books show a small badge: `físico` / `ebook` / `otro` in `text-text-muted font-mono text-[10px]`
- Manual books show a **delete button** (🗑 or `delete`) — Audible books don't have this

### `/admin/biblioteca/add` (new)

```
src/app/[locale]/admin/biblioteca/add/page.tsx
```

Client component. Flow:
1. Search input → debounced 400ms → `GET /api/admin/book-search?q=`
2. Loading indicator while searching
3. Results grid (cover + title + authors) — click to select
4. Selected result fills form: title, authors, cover_url, description (all editable)
5. `source_type` radio: físico | ebook | otro (default: físico)
6. Optional: isbn, published_year
7. "Guardar" → `POST /api/admin/manual-books` → redirect to `/admin/biblioteca`
8. "Cancelar" → back to `/admin/biblioteca`

### `/admin/biblioteca/[id]/notes` (new)

```
src/app/[locale]/admin/biblioteca/[id]/notes/page.tsx
```

Client component. Loads on mount via `GET /api/admin/book-notes/[id]`.

**Rating section:**
- 5 clickable star buttons (★ filled = text-accent, ☆ empty = text-border)
- Click star N → sets rating to N; click same star → clears to null

**Highlights section:**
- List of existing highlights, each with a delete (×) button
- Input field + "Agregar" button to add new highlight
- No editing of existing highlights — delete and re-add

**Reseña section:**
- Tabs: "Editar" | "Preview"
- Editar: `<textarea>` (monospace, full width, min 8 rows)
- Preview: renders Markdown with `react-markdown` (new dependency — `npm install react-markdown`)
- Note: NOT full MDX — plain Markdown rendered client-side is sufficient

**Save:**
- "Guardar notas" button → `PUT /api/admin/book-notes/[id]`
- Optimistic: button shows "Guardando..." then "✓ Guardado" for 1.5s
- "← Biblioteca" link at top

---

## Public Page Changes

### `/[locale]/biblioteca/page.tsx`

Replace `getAllBooks` + `applyBookOverrides` with `getAllUnifiedBooks`. Passes `UnifiedBook[]` to `BookList`.

`BookList` receives `UnifiedBook[]` — `BookCard` needs to handle the `source` field for the badge and link path. Link: `/biblioteca/[book.id]` (works for both ASIN and UUID).

### `/[locale]/biblioteca/[id]/page.tsx`

Route param renamed from `[asin]` to `[id]` to handle both ASINs and UUIDs.

Uses `getUnifiedBook(id, locale, supabase)` instead of `getBook`. Renders `review_md` with `react-markdown` if present (replaces MDXContent for this use case — plain Markdown, not MDX with custom components).

**Audible link:** only shown if `source === 'audible'`.

### `BookCard` (modified)

Receives `UnifiedBook`. The cover thumbnail, title, authors, duration display stays the same. Adds optional `source_type` badge for manual books.

---

## Migrating existing MDX notes

Existing `content/library/[locale]/[asin].mdx` files remain readable but are superseded by `book_notes`. If both exist, `book_notes` wins (Supabase is the source of truth). No automatic migration script — done manually as needed.

The `getBook` function (used by current detail page) is replaced by `getUnifiedBook`. The old MDX merge logic in `mergeWithMdx` is kept for backward compatibility but only used if no `book_notes` row exists.

---

## Testing

- Unit tests for `getAllUnifiedBooks` helper logic (merge Audible + manual, apply notes)
- Unit tests for book-search route (mock fetch, verify fallback)
- No component tests (project pattern)

---

## Out of Scope

- Editing a manual book after creation (delete + re-add)
- Syncing notes between locales (notes are locale-agnostic — one `book_notes` row per book)
- Image upload for covers (use URL from search or paste manually)
- Pagination on admin book list
- Public filtering by source type (physical vs audio)
