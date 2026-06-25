# HeartlandWiWx

Heartland Chasers storm-chasing site built with [Astro](https://astro.build) and a lightweight GitHub-backed page CMS.

Edit normal website pages in the browser at `/admin/pages`. Changes are saved as Markdown files in the repo and deployed automatically through Vercel.

## Content structure

```text
src/content/pages/     # Site pages managed by the admin CMS (Markdown)
content/chase-reports/ # Chase report posts (Markdown, file-based for now)
content/settings/
  └── site.json        # Global site settings
```

Dynamic routes:

- `/` renders the page where `slug` is `home`
- `/:slug` renders published pages from `src/content/pages`
- `/chase-reports` lists published chase reports
- `/chase-reports/:slug` renders an individual chase report

Navigation is built automatically from `src/content/pages` using `showInMenu`, `menuOrder`, and `menuLabel`.

## Admin CMS

| Route | Purpose |
| :---- | :------ |
| `/admin/login` | Sign in |
| `/admin/pages` | Page list |
| `/admin/pages/new` | Create a page |
| `/admin/pages/[slug]` | Edit a page |

Each page is stored as Markdown with frontmatter:

```yaml
---
title: "About Us"
slug: "about"
seoTitle: "About Heartland Chasers"
description: "Learn about Heartland Chasers."
published: true
updatedAt: "2026-06-23"
showInMenu: true
menuOrder: 2
menuLabel: About
---
```

When you save in admin:

1. The server writes the Markdown file through the GitHub API
2. GitHub receives a commit on your configured branch
3. Vercel redeploys the site from that commit
4. Public pages render the updated content

## Commands

| Command | Action |
| :------ | :----- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server |
| `npm run build` | Builds the site for production |
| `npm run preview` | Preview the production build |

## Local development

```bash
npm install
cp .env.example .env
```

Set at minimum:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-local-password
```

Then start the dev server:

```bash
npm run dev
```

Open:

- Site: http://localhost:4321
- Admin: http://localhost:4321/admin/pages

### Local vs production storage

- **Without `GITHUB_TOKEN`:** admin saves directly to `src/content/pages/` on disk (good for local editing)
- **With GitHub env vars:** admin reads/writes through the GitHub API (required on Vercel)

## Deploy to Vercel

1. Import the GitHub repository at [vercel.com/new](https://vercel.com/new)
2. Add the environment variables below
3. Use:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy

### Required environment variables

| Variable | Purpose |
| :------- | :------ |
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope for reading/writing page files |
| `GITHUB_OWNER` | GitHub org or username (example: `NonProfitNerdHerd`) |
| `GITHUB_REPO` | Repository name (example: `HeartlandWiWx`) |
| `GITHUB_BRANCH` | Branch to commit page updates to (usually `main`) |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |

### GitHub token setup

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create a fine-grained or classic token with write access to this repository
3. Add it to Vercel as `GITHUB_TOKEN`

The token is only used in server-side API routes and is never exposed to the browser.

## Creating new pages

1. Open `/admin/pages`
2. Click **New Page**
3. Fill in title, slug, SEO fields, and Markdown body
4. Click **Save Page**

The page becomes available on the public site after Vercel finishes redeploying.

Use `slug: home` for the homepage.

## Security notes

- Admin routes and page APIs require login
- Slugs are validated (`lowercase-with-hyphens` only)
- File writes are restricted to `src/content/pages/*.md`
- Only pages with `published: true` are shown on the public site

## What is intentionally not included yet

This is the minimum working CMS. Future improvements can include rich text editing, image uploads, drafts workflow, revisions, and chase report admin.
