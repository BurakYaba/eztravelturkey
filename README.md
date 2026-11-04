# Eztravel Turkey website (eztravelturkey.com)

Website of Eztravel Turkey (土耳其易遊網; Macera Tur Turizm Seyahat Acentası Ltd., TÜRSAB licence no. 3217): private, small-group and
multi-country tours across Turkey, Greece, Egypt and Jordan, in **Traditional Chinese only** (`/zh/`). It keeps the addresses of the old
eztravelturkey.com. The code started as a copy of the magnificenttravel.com site (a separate project) and was reduced to one language.

Built with Next.js 16 (App Router, ISR), React 19, TypeScript, Tailwind CSS 4, Sanity (content) and Vercel (hosting).

## How it fits together

```
 editors ──► Sanity Studio ──► Sanity dataset "production" ◄── site reads it (GROQ, through Sanity's CDN)
 (browser)   eztravelturkey             │
             .sanity.studio             └── webhook on every publish ──► POST /api/revalidate/ ──► pages rebuilt
                                                                           (Vercel)
 visitors ──► Vercel (Next.js, static pages + a few API routes) ──► forms ──► SMTP mailbox (Hostinger) ──► team
```

- **Content is not in the code.** Tours, destination pages, blog posts, static pages, the home page's heading and introduction, contact
  details, shared tour texts and the team are Sanity documents (project `91izz3mt`). The Studio (`studio/`) is a separate package,
  deployed with `sanity deploy`. The words of the interface (menu, buttons, form labels, home page sections) are in
  `src/i18n/dictionaries/zh.json`.
- **Publishing**: Sanity calls `/api/revalidate/` (header `x-revalidate-secret`), which expires the `content` cache tag. A change shows
  in a few seconds. `query()` in `src/lib/data/sanity.ts` reads a small "content version" without the CDN for that reason.
- **Drafts**: documents with an id that starts with `drafts.` are Studio drafts; the site reads only published documents. The
  Studio's Presentation tool shows drafts on the site in Draft Mode (`/api/draft/`, `SANITY_PREVIEW_TOKEN`).
- **Forms** (`/api/inquiry/`): Turnstile check, then the mail goes through the SMTP mailbox first, Brevo second, Resend third
  (`src/lib/mail.ts`).
- **One language**: `locales = ['zh']` in `src/i18n/config.ts`; the routes are still `/[lang]/...`, so every address starts with `/zh/`.
  `src/proxy.ts` sends `/` to `/zh/`, answers 404 for `/en/` and `/jp/`, and handles every old address (below).

## The old addresses

| Old address | What happens | Where |
|---|---|---|
| `/zh/...` pages that still exist (73) | served as before | the routes |
| `/zh/...` tour tabs, misspelled twins, `/zh/search/` (321) | 301 to the page that holds the content | `src/lib/old-zh.ts`, `src/data/redirects-zh.json` |
| `/cn/...` (Simplified Chinese, 399) | 301 to magnificenttravel.com | `src/lib/old-cn.ts`, `src/data/redirects-cn.json` |
| the WordPress blog `eztravelturkey.com/blog/...` (188 posts; 90 kept) | 301 to `/zh/blog/<country>/<post>/` in one step for a kept post, to the blog hub for a removed one; also on the bare domain | `src/lib/old-blog.ts`, `src/data/redirects-blog.json` |
| `/sitemap.xml/` | 308 to `/sitemap.xml` | Next.js |

The tables are built from files in `data/` (not in git) by `scripts/redirects/build-zh-lookup.mjs`, `build-cn-lookup.mjs` and
`scripts/sanity/import-wp-blog.mjs`.

## Run it

```bash
npm install
cp .env.example .env.local     # the site reads Sanity's public data without any setting; see the table below
npm run dev                    # http://localhost:3000 (webpack: Turbopack's Google-font handling failed here)
npm run build                  # production build (also type-checks); uses webpack for the same reason
npm run lint
cd studio && npm install && npm run dev      # the Studio, http://localhost:3333
```

If a local page answers 500 with a JSON error, delete `.next/dev/cache/fetch-cache`: a half-written cache file does that.

In `npm run dev` the Chinese web fonts are not loaded (the system's Chinese font shows): dev would download every slice of both fonts at
once and its 3 second limit per request times out in bursts ("Request timed out after 3000ms"). Production and `npm run build` load them.
The first page of a cold `npm run dev` still takes about 30 seconds to compile; later pages are fast.

## Settings (environment variables, `.env.example`)

| Variable | What for | Where it is set |
|---|---|---|
| `SANITY_PROJECT_ID`, `SANITY_DATASET` | Sanity project `91izz3mt`, dataset `production` (defaults in code) | optional |
| `SANITY_REVALIDATE_SECRET` | shared secret of the publish webhook | Vercel + Sanity webhook |
| `SANITY_PREVIEW_TOKEN` | Viewer token: draft preview | Vercel |
| `SANITY_WRITE_TOKEN` | Editor token for the import and draft scripts | local `.env.local` only |
| `SANITY_AUTH_TOKEN` | Developer token to deploy the Studio | local `.env.local` only |
| `VERCEL_DEPLOY_HOOK_URL` | rebuild when a redirect list typed in the Studio changes (not set yet) | Vercel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | the form mailbox (Hostinger: `smtp.hostinger.com`, 465) | Vercel |
| `INQUIRY_FROM_EMAIL`, `INQUIRY_TO_EMAIL` | sender (the SMTP mailbox) and up to five recipients, comma separated | Vercel |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | bot check on the forms | Vercel |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container (GA4 `G-S02WRDG5MG` is configured inside it) | Vercel (Production only) |
| `INDEXNOW_KEY` | IndexNow key file at `/<key>.txt` | Vercel + local `.env.local` |
| `REDIRECT_VERCEL_ALIAS` | `1`: the `*.vercel.app` address redirects to the real domain (set at the launch) | Vercel |
| `NEXT_PUBLIC_SITE_URL` | public address (default `https://www.eztravelturkey.com`) | optional |

After changing a variable on Vercel, redeploy: `NEXT_PUBLIC_*` values are read at build, the others at start.

## Where things are

| Path | What it holds |
|---|---|
| `src/app/[lang]/` | pages (home, tours, destinations, blog, contact, ...); `src/app/api/` health, inquiry, revalidate, draft, csp-report, indexnow-key, region (cookie-banner region) |
| `src/lib/data/` | everything that reads Sanity (`sanity.ts` client and cache, `index.ts` queries) |
| `src/lib/seo.ts`, `page-meta.ts` | metadata and JSON-LD |
| `src/lib/security-headers.ts` | CSP, HSTS and the rest; `frame-ancestors` lists who may frame the site (the Studio preview) |
| `src/data/site.ts` | fallback contact details and the social accounts (the live values come from the Studio's "Site ayarları") |
| `src/proxy.ts`, `next.config.ts` | redirects, old domains, 410 pages, headers |
| `studio/` | the Sanity Studio: `schemaTypes/`, `structure.ts` (menus), `components/`; the preview address is `previewOrigin` in `sanity.config.ts` |
| `scripts/sanity/` | import, backup and draft tools (below) |
| `.github/workflows/` | `ci.yml` (lint, build). The backup, unused-pictures and uptime workflows are switched off until their secrets exist (see the comment at the top of each) |

## Checks and tools

| Command | What it does |
|---|---|
| `npm run check:launch -- <address> [--real] [--old] [--full]` | launch checklist against a live address |
| `npm run check:redirects -- <address>` | every old address (`/zh/`, `/cn/`, the WordPress blog) answers as the maps say |
| `npm run check:sanity` | every Sanity document against the Studio's schema |
| `node scripts/sanity/backup.mjs [file]` | export of all documents |
| `node scripts/sanity/import-zh.mjs`, `import-wp-blog.mjs` | the one-off import of the old site's documents and the WordPress posts (dry run unless `--write`) |
| `node scripts/sanity/create-drafts.mjs landing\|blog`, `copy-tour-drafts.mjs` | create Studio drafts without touching published documents |
| `node --env-file=.env.local scripts/indexnow-submit.mjs <address>` | tells IndexNow search engines about every sitemap address (launch day) |

## Deploying

- **Site**: push to `main`; Vercel builds and deploys production. A pull request gets its own preview.
- **Studio**: `cd studio && npx sanity deploy` (needs `SANITY_AUTH_TOKEN`). Schema changes need it; content changes do not.
- **Roll back**: Vercel > Deployments > an earlier deployment > Instant Rollback. Content: Studio > document > History or a backup file.
- **Launch day**: see the comments in `studio/sanity.config.ts` (`previewOrigin`) and `scripts/launch-check.mjs`.

## Rules the code relies on

- A published page keeps its address (the Studio locks the field). Removing a page: tick "hide from search engines" instead of deleting.
- The home page shows only the heading, the introduction paragraph, the search texts and the FAQ from the Studio; its sections come from the
  dictionary and from the tours.
- The sender of the form mail must be the SMTP mailbox itself.
- The site has no Israel content: the import scripts stop when a text names it, and `/israel` addresses answer 410.

## Third-party material

Pictures bought from Depositphotos are licensed to the client. Fonts are Google Fonts (open licence). The tours' pictures are in Sanity,
not in this repository.
