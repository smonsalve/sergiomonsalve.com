# Admin Biblioteca — Design Spec

**Date:** 2026-05-16
**Status:** Approved

---

## Overview

Add an `/admin/biblioteca` section to the existing admin panel that lets Sergio control which Audible books appear on the public `/biblioteca` page and set their reading status — without commits or deploys. Changes persist in Supabase and take effect immediately.

---

## Data Architecture

### Supabase table `library_books`

Sparse table — only rows for books that have been modified from defaults. An absent row means `visible=true, status='queued'`.

```sql
CREATE TABLE library_books (
  asin        TEXT PRIMARY KEY,
  visible     BOOLEAN NOT NULL DEFAULT TRUE,
  status      TEXT    NOT NULL DEFAULT 'queued',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

RLS: disabled (only accessed via service role key from API routes).

### Override function in `src/lib/library.ts`

New exported types and a pure function added to the existing library module:

```ts
export type BookOverride = {
  asin: string
  visible: boolean
  status: BookStatus
}

export function applyBookOverrides(books: BookMeta[], overrides: BookOverride[]): BookMeta[] {
  const map = new Map(overrides.map(o => [o.asin, o]))
  return books
    .map(b => {
      const o = map.get(b.asin)
      return o ? { ...b, status: o.status } : b
    })
    .filter(b => {
      const o = map.get(b.asin)
      return o ? o.visible : true
    })
}
```

**Status priority:** Supabase row > MDX frontmatter > default `'queued'`.
**Visibility:** Supabase only (MDX has no visible field). Default visible=true if no row.

`getAllBooks` and `getBook` remain synchronous. The page component handles the async Supabase call.

---

## Public Page Changes

### `/[locale]/biblioteca/page.tsx`

Becomes async, fetches overrides from Supabase before rendering:

```ts
const supabase = createAdminClient()
const { data: overrides } = await supabase
  .from('library_books')
  .select('asin, visible, status')
const books = applyBookOverrides(getAllBooks(locale), overrides ?? [])
```

Books with `visible=false` are excluded from the list by `applyBookOverrides`.

### `/[locale]/biblioteca/[asin]/page.tsx`

No changes. Hidden books remain accessible by direct URL — they are simply not listed. This avoids complexity and preserves permanent links.

---

## Admin Page

### Route: `src/app/[locale]/admin/biblioteca/page.tsx`

Client component (`'use client'`), following the exact pattern of `AdminCommentsPage`.

**UI:**
- Header: `Biblioteca` + `// {totalBooks} libros · {hiddenCount} ocultos`
- Search input (filter by title client-side — useful with 116 books)
- List of all books, one row per book:
  - Cover thumbnail (32×40px)
  - Title + author (truncated)
  - Status selector: 4-button group (leyendo / completado / en lista / abandonado)
  - Visibility toggle: single button showing `visible` / `oculto`
- While saving: spinner on the row being updated
- After save: green border flash on the row (1.5s), then back to normal
- Hidden books: `opacity-50` on the row

**Data flow:**
1. On mount: `GET /api/admin/biblioteca` → list of all books with current overrides merged
2. On status/visibility change: optimistic UI update → `PATCH /api/admin/biblioteca/[asin]`
3. On 401: redirect to `/admin/login`

---

## API Routes

### `GET /api/admin/biblioteca`

```
src/app/api/admin/biblioteca/route.ts
```

- Auth check via session cookie (same pattern as `/api/admin/comments`)
- Reads `data/library.json` (all books)
- Queries `SELECT asin, visible, status FROM library_books`
- Merges: for each book, overlays Supabase row if exists
- Returns `{ books: AdminBook[] }` where `AdminBook = BookMeta & { visible: boolean }`

### `PATCH /api/admin/biblioteca/[asin]`

```
src/app/api/admin/biblioteca/[asin]/route.ts
```

- Auth check
- Zod-validates body: `{ visible?: boolean, status?: z.enum(['listening','completed','queued','abandoned']) }`
- At least one field required
- Upserts into `library_books`: `{ asin, visible, status, updated_at: new Date() }`
- If only `visible` sent: keeps existing status (uses SELECT first or merge in upsert)
- Returns `{ asin, visible, status }`

---

## Sidebar & Overview Changes

### `src/components/admin/AdminSidebar.tsx`

Add to NAV array:
```ts
{ href: '/admin/biblioteca', label: 'Biblioteca', icon: '◎' }
```
Placed between Firmas and the end of the list.

### `src/app/[locale]/admin/page.tsx`

Add to `getStats()`:
```ts
const { data: libBooks } = await admin.from('library_books').select('asin, visible')
```

Add stat card: "Libros ocultos" — value=hiddenCount, total=totalBooksFromJson.
Add quick-access link: "Gestionar biblioteca →".

---

## Type: AdminBook

Used in the admin GET response and admin page state:

```ts
type AdminBook = {
  asin: string
  title: string
  authors: string[]
  cover_url: string
  runtime_length_min: number
  visible: boolean
  status: BookStatus
}
```

---

## Testing

- Unit test for `applyBookOverrides` in `src/lib/__tests__/library.test.ts`:
  - All visible when no overrides
  - Hidden book excluded
  - Status override applied
  - Non-modified book keeps MDX status
- No component tests (follows project pattern)

---

## Out of Scope

- Editing ratings, highlights, or review text from admin (those remain MDX-only)
- Bulk hide/show
- Reordering books
- The detail page respecting visibility (hidden books still accessible by direct URL)
