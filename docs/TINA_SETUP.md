# TinaCMS Setup Guide

Use this guide for Heartland Chasers. **Do not run** `npx @tinacms/cli init` — the schema is already configured in `tina/config.ts`.

## What you need

1. This repo cloned locally
2. A Tina Cloud account at [app.tina.io](https://app.tina.io)
3. Your Tina Cloud **Client ID** and **Read Token**

## Step 1: Get the latest code

```bash
git pull origin main
npm install
```

You should see folders:

- `tina/`
- `content/pages/`
- `content/chase-reports/`
- `content/settings/site.json`

If `tina/` is missing, you do not have the latest code yet.

## Step 2: Create Tina Cloud project

1. Go to [app.tina.io](https://app.tina.io)
2. Create a project
3. Connect GitHub repo: `NonProfitNerdHerd/HeartlandWiWx`
4. Use branch: `main`

## Step 3: Add credentials locally

Create a file named `.env` in the project root:

```env
NEXT_PUBLIC_TINA_CLIENT_ID=your_client_id_from_tina_overview
TINA_TOKEN=your_readonly_token_from_tina_tokens
GITHUB_BRANCH=main
```

**Do not run** `npx @tinacms/cli init`.

If you already ran `init` locally and it failed, remove any junk it added before pulling latest code:

- `content/posts/hello-world.md`
- `src/pages/tinacms-demo/`
- `@tinacms/astro` or `@astrojs/node` in `package.json`
- unwanted changes to `astro.config.mjs`

Then run `git pull origin main` again.

## Step 4: Run locally

```bash
npm run dev
```

Open:

- Site: http://localhost:4321
- Admin: http://localhost:4321/admin/index.html

In the admin sidebar you should see:

- **Pages**
- **Chase Reports**
- **Site Settings**

## Step 5: Add credentials to Vercel

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
| :------- | :---- |
| `NEXT_PUBLIC_TINA_CLIENT_ID` | From Tina Cloud Overview |
| `TINA_TOKEN` | From Tina Cloud Tokens |
| `GITHUB_BRANCH` | `main` |

Redeploy the site.

After redeploy, open:

`https://your-site.vercel.app/admin/index.html`

Log in with Tina Cloud, then create/edit pages and chase reports.

## Creating content

### New page

1. Admin → **Pages** → Create
2. Set `slug`, `title`, menu fields, and body
3. Save

The page appears at `/:slug` after deploy. Use `slug: home` for the homepage.

### New chase report

1. Admin → **Chase Reports** → Create
2. Set `slug`, `date`, `status: published`, and body
3. Save

The report appears at `/chase-reports/:slug`.

## Troubleshooting

### Admin says "run init"

- You are on old code without `tina/`, or
- Vercel env vars are missing

Fix: pull latest `main`, set env vars, redeploy.

### `init backend` tries to install `@tinacms/astro`

That means Tina thought this was a fresh project. Skip it. Create `.env` manually instead.

### Build fails on Vercel

Ensure `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` are set, or rely on the build fallback (local admin mode) until they are added.
