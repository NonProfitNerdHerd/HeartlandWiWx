# HeartlandWiWx

Heartland Chasers storm-chasing site built with [Astro](https://astro.build) and a lightweight GitHub-backed CMS.

Edit site content in the browser. Changes are saved as Markdown files in the repo and deployed automatically through Vercel.

## Content structure

```text
src/content/pages/   # Site pages (home, about, contact, etc.)
src/content/blog/    # Blog / chase report posts
content/settings/
  └── site.json      # Global site settings
```

Dynamic routes:

- `/` renders the page where `slug` is `home`
- `/:slug` renders published pages from `src/content/pages`
- `/chase-reports` lists published blog posts
- `/chase-reports/:slug` renders an individual blog post

Navigation is built automatically from `src/content/pages` using `showInMenu`, `menuOrder`, and `menuLabel`.

## Admin CMS

Sign in at `/admin/login`, then use the tabs:

| Tab | Route | Purpose |
| :-- | :---- | :------ |
| **Pages** | `/admin/pages` | Home, About, Contact, and other site pages |
| **Blog Posts** | `/admin/blog` | Chase reports and blog posts |
| **Gallery** | `/admin/gallery` | Gallery page content |

| Route | Purpose |
| :---- | :------ |
| `/admin/login` | Sign in |
| `/admin/pages/new` | Create a page |
| `/admin/pages/[slug]` | Edit a page (including `home`) |
| `/admin/blog/new` | Create a blog post |
| `/admin/blog/[slug]` | Edit a blog post |
| `/admin/blog/landing` | Edit the `/chase-reports` intro page |

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

```bash
npm run dev
```

- Site: http://localhost:4321
- Admin: http://localhost:4321/admin/login

### Local vs production storage

- **Without `GITHUB_TOKEN`:** admin saves directly to `src/content/` on disk
- **With GitHub env vars:** admin reads/writes through the GitHub API (required on Vercel)

## Deploy to Vercel

1. Import the GitHub repository at [vercel.com/new](https://vercel.com/new)
2. Add the environment variables below
3. Use **Build Command:** `npm run build` and **Output Directory:** `dist`
4. Deploy

### Required environment variables

| Variable | Purpose |
| :------- | :------ |
| `GITHUB_TOKEN` | Personal Access Token with **Contents: Read and write** on this repo |
| `GITHUB_OWNER` | GitHub org or username — copy exactly from `github.com/OWNER/REPO` |
| `GITHUB_REPO` | Repository name — copy exactly from the URL (case matters) |
| `GITHUB_BRANCH` | Branch to commit to (usually `main`) |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |

### GitHub token setup

1. GitHub profile → **Settings** → **Developer settings** → **Personal access tokens**
2. Create a fine-grained token with **Contents: Read and write** on `HeartlandWiWx`
3. Add it to Vercel as `GITHUB_TOKEN`

The token is only used in server-side API routes and is never exposed to the browser.

### Troubleshooting GitHub 404 errors

If saves fail with `GitHub write failed (404)`:

1. Confirm `GITHUB_OWNER` and `GITHUB_REPO` match your repo URL exactly
2. Confirm `GITHUB_BRANCH` is `main` (or whichever branch Vercel deploys)
3. Confirm the token has **Contents: Read and write** permission
4. Confirm the token belongs to an account with push access to the repo
5. Redeploy Vercel after changing environment variables

## Security notes

- Admin routes and APIs require login
- Slugs are validated (`lowercase-with-hyphens` only)
- File writes are restricted to `src/content/pages/` and `src/content/blog/`
- Only content with `published: true` is shown on the public site
