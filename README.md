# HeartlandWiWx

GitHub-backed website builder for Heartland Chasers — Astro static site with a WordPress-style admin.

## Architecture

Four independent systems:

| System | Storage | Admin |
|--------|---------|-------|
| **Content** | `src/content/pages/*.page.json` | `/admin/pages` |
| **Blog** | `src/content/blog/*.md` | `/admin/blog` |
| **Appearance** | `content/theme/theme.json` | `/admin/appearance` |
| **Navigation** | `content/navigation/*.json` | `/admin/navigation` |
| **Site Text** | `content/site-text/labels.json` | `/admin/site-text` |
| **Global Blocks** | `content/global-blocks/blocks.json` | `/admin/global-blocks` |
| **Media** | `content/media/library.json` | `/admin/media` |

Pages store structured JSON blocks plus metadata (title, slug, SEO, template, author, dates, featured image).

## Admin

Sign in at `/admin/login`.

**Content:** Pages, Blog Posts, Gallery, Media  
**Site:** Appearance, Navigation, Site Text, Global Blocks

### Page editor

- Full-width layout with **75% block editor** + **25% sticky metadata panel**
- TipTap rich text for content blocks
- 40+ block types in the picker (paragraph, hero, columns, CTA, global blocks, etc.)
- Device preview: phone / tablet / desktop
- Save draft or save & publish
- Saves to GitHub → Vercel redeploys

## Commands

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | PAT with Contents read/write |
| `GITHUB_OWNER` | e.g. `NonProfitNerdHerd` |
| `GITHUB_REPO` | e.g. `HeartlandWiWx` (repo name only) |
| `GITHUB_BRANCH` | `main` |
| `ADMIN_USERNAME` | Admin login |
| `ADMIN_PASSWORD` | Admin password |

## Public routes

- `/` — home page
- `/:slug` — pages (block-rendered)
- `/chase-reports` — blog index
- `/chase-reports/:slug` — blog post

Theme colors/fonts apply via CSS variables from `content/theme/theme.json`.  
Navigation loads from `content/navigation/header.json`.

## Migration

Existing `.md` pages auto-migrate to blocks on first load. Saving in the new editor writes `{slug}.page.json`.
