# HeartlandWiWx

Welcome to the website of the Heartland Interceptors!

Built with [Astro](https://astro.build).

## Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   └── pages/
└── package.json
```

## Commands

| Command                   | Action                                      |
| :------------------------ | :------------------------------------------ |
| `npm install`             | Installs dependencies                       |
| `npm run dev`             | Starts local dev server at `localhost:4321` |
| `npm run build`           | Build your production site to `./dist/`       |
| `npm run preview`         | Preview your build locally                  |
| `npm run astro ...`       | Run CLI commands like `astro add`           |
| `npm run astro -- --help` | Get help using the Astro CLI                |

## Deploy to Vercel

This is a static Astro site and works on Vercel with no extra adapter.

### Git integration (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import the `NonProfitNerdHerd/HeartlandWiWx` GitHub repository.
2. Vercel should auto-detect Astro with:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Click **Deploy**. Production deploys run from `main`; other branches get preview URLs.

The root `vercel.json` keeps those settings explicit in the repo.

### CLI deployment

```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```
