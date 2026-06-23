# HeartlandWiWx

Heartland Chasers storm-chasing site built with [Astro](https://astro.build) and [TinaCMS](https://tina.io/) for Git-backed content editing.

## Content structure

```text
content/
├── pages/              # Site pages (Markdown)
├── chase-reports/      # Chase report posts (Markdown)
└── settings/
    └── site.json       # Global site settings
```

Dynamic routes:

- `/` renders the page where `slug` is `home`
- `/:slug` renders any page from `content/pages`
- `/chase-reports` lists published chase reports
- `/chase-reports/:slug` renders an individual chase report

Navigation is built automatically from `content/pages` using `showInMenu`, `menuOrder`, and `menuLabel`.

## Commands

| Command | Action |
| :------ | :----- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts Astro + Tina admin locally |
| `npm run build` | Builds Tina admin + Astro site for production |
| `npm run build:local` | Local build without Tina Cloud credentials |
| `npm run preview` | Preview the production build |

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Then open:

- Site: http://localhost:4321
- Admin: http://localhost:4321/admin/index.html

In local mode, Tina saves Markdown/JSON files directly in the repo without Tina Cloud.

## Tina Cloud + GitHub editing (production admin)

See **[docs/TINA_SETUP.md](docs/TINA_SETUP.md)** for the full step-by-step guide.

**Important:** Do not run `npx @tinacms/cli init`. The schema already exists in `tina/config.ts`.

Quick version:

1. Pull latest `main` from GitHub
2. Create a project at [app.tina.io](https://app.tina.io) and connect this repo
3. Create a `.env` file with `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, and `GITHUB_BRANCH=main`
4. Add the same values to Vercel environment variables
5. Redeploy

```bash
npm run dev
```

Admin: http://localhost:4321/admin/index.html

### Required Vercel environment variables

| Variable | Purpose |
| :------- | :------ |
| `NEXT_PUBLIC_TINA_CLIENT_ID` | Tina Cloud client ID from app.tina.io |
| `TINA_TOKEN` | Tina Cloud read token from app.tina.io |
| `GITHUB_BRANCH` | Git branch Tina should commit to (usually `main`) |

Vercel also provides `VERCEL_GIT_COMMIT_REF`, which Tina uses automatically when `GITHUB_BRANCH` is not set.

After Tina saves content to GitHub, Vercel redeploys automatically from the new commit.

## Deploy to Vercel

1. Import the GitHub repository at [vercel.com/new](https://vercel.com/new)
2. Set the environment variables above
3. Use:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy

The Tina admin UI is available at `/admin/index.html` on your deployed site.

## Creating new pages

1. Open `/admin/index.html`
2. Go to **Pages**
3. Create a new page with a unique `slug`
4. Set `showInMenu`, `menuOrder`, and `menuLabel` if it should appear in navigation
5. Save

The page becomes available at `/:slug` on the next deploy. Use `slug: home` for the homepage.
