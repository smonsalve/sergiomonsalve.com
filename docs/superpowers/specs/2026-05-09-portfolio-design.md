# Portfolio Section — Design Spec

_Date: 2026-05-09_

## Overview

Add a `/portfolio` section to sergiomonsalve.com where Sergio can showcase selected projects as detailed case studies. Each project is an MDX file with structured frontmatter, rendered as a magazine-style card on the list page and as a full prose case study on the detail page.

---

## Content Structure

```
content/portfolio/
  es/{slug}.mdx
  en/{slug}.mdx
```

### Frontmatter schema

```yaml
---
title: string           # project name
description: string     # 1-2 line summary (used in card)
date: YYYY-MM-DD        # project date
role: string            # e.g. "Full Stack Developer"
stack: string[]         # e.g. ["TypeScript", "Python", "FastAPI"]
github: string          # GitHub URL (empty string if none)
demo: string            # live URL (empty string if none)
status: active|archived
featured: boolean       # reserved for future homepage highlight
image: string           # path e.g. /portfolio/slogs.png
---
```

Body: full MDX prose case study (unlimited length, same MDX components available as blog).

### Images

Static screenshots go in `public/portfolio/`. Referenced as `/portfolio/{slug}.png` in frontmatter.

### First project

`content/portfolio/es/slogs.mdx` and `content/portfolio/en/slogs.mdx` — Siata Logistics full-stack case study. Repo: https://github.com/serandmoncas/slogs

---

## Data Layer

**`src/lib/portfolio.ts`** — mirrors `src/lib/posts.ts` exactly.

```ts
export type ProjectMeta = {
  slug: string
  title: string
  description: string
  date: string
  role: string
  stack: string[]
  github: string
  demo: string
  status: 'active' | 'archived'
  featured: boolean
  image: string
}

export type Project = ProjectMeta & { content: string }

export function getAllProjects(locale: string): ProjectMeta[]
export function getProject(slug: string, locale: string): Project | null
export function getProjectSlugs(locale: string): string[]
```

Projects sorted by `date` descending. Files read from `content/portfolio/{locale}/`.

---

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/[locale]/portfolio` | `src/app/[locale]/portfolio/page.tsx` | List page — 2-column grid of ProjectCards |
| `/[locale]/portfolio/[slug]` | `src/app/[locale]/portfolio/[slug]/page.tsx` | Detail page — header + image + MDX + sidebar |
| OG image per project | `src/app/[locale]/portfolio/[slug]/opengraph-image.tsx` | Same `ImageResponse` pattern as blog |

Both pages use `generateStaticParams` and `generateMetadata` following the blog pattern.

---

## Components

### `src/components/ProjectCard.tsx`

Magazine-style card (Option C from visual brainstorm):

- Full-width screenshot image at top (Next.js `<Image>`, aspect ratio 16:9 or similar)
- Status badge (active/archived) overlaid on image top-right
- Below image: title, description (1-2 lines), stack tags, "Ver caso →" CTA link
- Card links to `/portfolio/[slug]`
- Stack tags use same pill style as blog tags (`text-accent bg-surface border border-border-active`)

### Detail page layout

```
[full-width header image]
title          role · date · status badge
────────────────────────────────────────
[MDX prose content]    │  sidebar:
                       │  // stack
                       │  TypeScript
                       │  Python · FastAPI
                       │
                       │  // links
                       │  GitHub ↗
                       │  Demo ↗
```

On mobile: sidebar collapses below the MDX content.

Prose styles reuse existing `.mdx-prose` class from `globals.css`.

### OG image per project

Same `ImageResponse` pattern as `src/app/opengraph-image.tsx` (the global OG image):
- 1200×630, dark background
- Project title (large, white)
- Role + date (muted mono)
- `sergiomonsalve.com` bottom-right (neon green)

---

## Navigation

New nav order: `About | Blog | Portfolio | Recipes | Contact`

`Nav.tsx` gets a new link with `t('portfolio')`.

---

## i18n

New `portfolio` key in `src/messages/es.json` and `src/messages/en.json`:

```json
"portfolio": {
  "nav": "Portfolio",
  "pageTitle": "// proyectos",
  "role": "// rol",
  "stack": "// stack",
  "links": "// links",
  "github": "GitHub",
  "demo": "Demo",
  "viewCase": "Ver caso →",
  "status": {
    "active": "activo",
    "archived": "archivado"
  }
}
```

English equivalent with translated strings.

---

## Testing

- Unit test for `getAllProjects` and `getProject` in `src/lib/__tests__/portfolio.test.ts` — mirrors existing `posts.test.ts` if it exists
- `ProjectCard` renders title, description, stack tags, and CTA link
- Detail page renders MDX content and sidebar metadata
- Nav contains portfolio link

---

## Out of scope

- Homepage "featured projects" highlight (deferred — implement once 3+ projects exist)
- Pagination (not needed until 10+ projects)
- Tag/stack filter on list page (not needed initially)
