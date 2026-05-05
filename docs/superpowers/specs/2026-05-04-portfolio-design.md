# sergiomonsalve.com — Design Spec

**Date:** 2026-05-04
**Scope:** v1 — Hero + About/CV + Contact form

---

## 1. Goal

Launch a professional personal site for Sergio Andrés Monsalve Castañeda (AI Software Engineer) that establishes a bilingual online presence and enables inbound contact from freelance clients and employers. Blog, recipes, auth, and comments are explicitly out of scope for v1 but must be architecturally easy to add.

---

## 2. Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Single codebase, API routes, great i18n support |
| Styling | Tailwind CSS v4 | Dark terminal theme, utility-first |
| i18n | next-intl | Path-based routing, SEO-friendly, well-maintained |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one service; free tier sufficient |
| Email | Resend | Simple API, 100 emails/day free tier |
| Deploy | Vercel | Zero-config Next.js deployment |

No FastAPI or Python backend for v1. A FastAPI service can be added later for AI-specific features without refactoring the frontend.

---

## 3. URL Structure

Default locale: `es`. Supported: `['es', 'en']`.

```
/              → redirects to /es
/es            → Hero
/es/about      → About / CV
/es/contact    → Contact form
/en            → Hero (English)
/en/about      → About / CV (English)
/en/contact    → Contact form (English)
```

---

## 4. Pages

### 4.1 Hero (`/[locale]`)

Full-screen centered layout on dark background (`#0f0f0f`).

**Content (top to bottom):**
- Nav: `SM` logo (neon green monospace), page links, `ES | EN` locale switcher
- Comment line: `// AI Software Engineer` (muted monospace)
- Name: `Sergio Monsalve` (large, bold, white)
- Tagline: bilingual short bio (from `messages/[locale].json`)
- CTAs: primary `Contactar` (neon green filled) + secondary `Ver CV` (outlined)
- Skill tags: `Python · AI / LLMs · AWS · FastAPI · Django · LangChain · Dagster · ETL` (monospace badge style, neon green on dark)

### 4.2 About (`/[locale]/about`)

Two-part page:

**Part 1 — Bio (conversational):**
- Full tagline paragraph (bilingual, from content file)
- Skills grid: 2-column, `▸` bullets, neon green accent
- Personal note: Songosorhongo link + location
- Download CV button (links to public PDF in Supabase Storage)

**Part 2 — Timeline (structured):**
- Experience entries with date range, company, role, tech tags
- Left border timeline using neon green for current role, muted for past
- Education section below experience

### 4.3 Contact (`/[locale]/contact`)

**Form fields:**
1. Project type toggle: `Freelance | Full-time | Colaboración` (active = neon green filled)
   - Label → API value: `Freelance` → `freelance`, `Full-time` → `fulltime`, `Colaboración` → `collaboration`
2. Name (text input)
3. Email (email input)
4. Message (textarea)

**Actions:**
- `Enviar →` button (primary, neon green)
- `💬 WhatsApp directo` button (secondary, links to `https://wa.me/573508025988`)

**Form behavior:**
- Client-side validation before submit
- On submit: POST to `/api/contact`
- Success state: inline confirmation message, form replaced
- Error state: inline error, form remains editable

---

## 5. API

### `POST /api/contact`

**Request body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "projectType": "freelance | fulltime | collaboration",
  "message": "string (required, min 10 chars)"
}
```

**Flow:**
1. Validate all fields server-side
2. Insert row into `contact_submissions`
3. Send email notification to `serandmoncas@gmail.com` via Resend
4. Return `{ success: true }` or `{ error: string }`

---

## 6. Database Schema (v1)

```sql
-- Single table for v1
create table contact_submissions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  project_type text not null check (project_type in ('freelance', 'fulltime', 'collaboration')),
  message      text not null,
  created_at   timestamptz not null default now(),
  read         boolean not null default false
);

-- Only the service role key can insert; no public read
alter table contact_submissions enable row level security;
```

Supabase Auth is initialized but no public-facing login exists in v1.

---

## 7. Design System

| Token | Value |
|---|---|
| Background | `#0f0f0f` |
| Surface | `#1a1a1a` (cards, inputs) |
| Border | `#222` default · `#1e3a2f` active/focus |
| Accent | `#00ff88` (neon green) |
| Text primary | `#ffffff` |
| Text secondary | `#888888` |
| Text muted | `#555555` |
| Font body | Inter (system fallback) |
| Font mono | JetBrains Mono (comments, tags, labels) |

---

## 8. Navigation & Footer

**Nav (all pages):**
- Left: `SM` in neon green monospace
- Center: `About · Contact` only in v1 (Blog and Recetas links are hidden until those features are built)
- Right: locale switcher `ES | EN`

**Footer:**
- GitHub: `https://github.com/smonsalve`
- Instagram: `https://www.instagram.com/samonsalvec/`
- WhatsApp: `+57 350 802 5988`
- Songosorhongo: `http://songosorhongo.com`

---

## 9. v2 Extension Points

The following features are out of scope for v1 but the architecture leaves clean hooks for each:

| Feature | What to add |
|---|---|
| Blog | `[locale]/blog/` routes + `posts` Supabase table + Tiptap editor in admin |
| Auth | `[locale]/login/` route using Supabase Auth (already initialized) |
| Recipes | `[locale]/recipes/` routes + `recipes` Supabase table |
| Comments | `comments` Supabase table + RLS policies referencing auth users |
| Admin panel | `[locale]/admin/` protected by Supabase Auth role check |
| FastAPI service | Independent service at `api.sergiomonsalve.com` for AI features |

---

## 10. Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, used in /api/contact

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_SITE_URL=https://sergiomonsalve.com
CONTACT_EMAIL=serandmoncas@gmail.com
```
