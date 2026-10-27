# Magnificent Travel website

Website of Magnificent Travel (Macera Tur Turizm Seyahat Acentası Ltd., TÜRSAB licence no. 3217): private, small-group and
multi-country tours across Turkey, Greece, Egypt, Jordan and Morocco, in English (`/en/`), Simplified Chinese (`/cn/`) and Japanese
(`/jp/`). Live at <https://www.magnificenttravel.com>. The traditional-Chinese site (eztravelturkey.com) is a separate project.

Built with Next.js 16 (App Router, ISR), React 19, TypeScript, Tailwind CSS 4, Sanity (content) and Vercel (hosting).

## How it fits together

```
 editors ──► Sanity Studio ──► Sanity dataset "production" ◄── site reads it (GROQ, through Sanity's CDN)
 (browser)   magnificenttravel          │
             .sanity.studio             └── webhook on every publish ──► POST /api/revalidate/ ──► pages rebuilt
                                                                           (Vercel)
 visitors ──► Vercel (Next.js, static pages + a few API routes) ──► forms ──► SMTP mailbox (Hostinger) ──► team
 DNS: Vercel DNS (ns1/ns2.vercel-dns.com), registrar Turkticaret.net.   E-mail: Hostinger Business Email.
```

- **Content is not in the code.** Tours, destination pages, blog posts, static pages, the home page, contact details, shared tour
  texts and the team are Sanity documents. The Studio (`studio/`) is a separate package, deployed with `sanity deploy`.
- **Publishing**: Sanity calls `/api/revalidate/` (header `x-revalidate-secret`), which expires the `content` cache tag. Pages
  are read again on the next visit. `query()` in `src/lib/data/sanity.ts` also reads a small "content version" without the CDN, because
  Sanity's CDN can serve an old answer for minutes after a publish (see the comment there). A change shows in 2 to 4 seconds.
- **Redirects typed in the Studio** (blog field "old addresses") are part of the build: the webhook asks Vercel for a new deployment
  (`VERCEL_DEPLOY_HOOK_URL`) when the list changed.
- **Preview**: the Studio's Presentation tool opens the site in Draft Mode (`/api/draft/`, `SANITY_PREVIEW_TOKEN`).
- **Forms** (`/api/inquiry/`): Turnstile check, then the mail goes through the SMTP mailbox first, Brevo second, Resend third
  (`src/lib/mail.ts`). The e-mail itself is built in `src/lib/inquiry-email.ts` (HTML and plain text).
- **Languages**: `src/i18n/` (dictionaries, paths). Chinese and Japanese pages keep their old addresses (Japanese paths are
  Japanese words); `src/proxy.ts` maps them and handles the old domains and 410 pages.

## Run it

```bash
npm install
cp .env.example .env.local     # the site reads Sanity's public data without any setting; see the table below
npm run dev                    # http://localhost:3000
npm run build                  # production build (also type-checks)
npm run lint
cd studio && npm install && npm run dev      # the Studio, http://localhost:3333
```

## Settings (environment variables, `.env.example`)

| Variable | What for | Where it is set |
|---|---|---|
| `SANITY_PROJECT_ID`, `SANITY_DATASET` | Sanity project `aj0pbi0w`, dataset `production` (defaults in code) | optional |
| `SANITY_REVALIDATE_SECRET` | shared secret of the publish webhook | Vercel + Sanity webhook |
| `SANITY_PREVIEW_TOKEN` | Viewer token: draft preview | Vercel |
| `SANITY_WRITE_TOKEN` | Editor token for scripts (import, field audit, backups) | local `.env.local` only |
| `VERCEL_DEPLOY_HOOK_URL` | rebuild when the Studio's redirect list changes | Vercel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | the form mailbox (Hostinger: `smtp.hostinger.com`, 465) | Vercel |
| `INQUIRY_FROM_EMAIL`, `INQUIRY_TO_EMAIL` | sender (the SMTP mailbox) and up to five recipients, comma separated | Vercel |
| `BREVO_API_KEY`, `RESEND_API_KEY` | optional backup mail providers | Vercel |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | bot check on the forms | Vercel |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container (GA4 is configured inside it) | Vercel |
| `INDEXNOW_KEY` | IndexNow key file at `/<key>.txt` | Vercel |
| `REDIRECT_VERCEL_ALIAS` | `1`: the `*.vercel.app` address redirects to the real domain | Vercel |
| `NEXT_PUBLIC_SITE_URL` | public address (default `https://www.magnificenttravel.com`) | optional |

After changing a variable on Vercel, redeploy: values are read at build and start.

## Where things are

| Path | What it holds |
|---|---|
| `src/app/[lang]/` | pages (home, tours, destinations, blog, contact, ...); `src/app/api/` health, inquiry, revalidate, draft, csp-report, indexnow-key, region (cookie-banner region) |
| `src/lib/data/` | everything that reads Sanity (`sanity.ts` client and cache, `index.ts` queries) |
| `src/lib/seo.ts`, `page-meta.ts` | metadata and JSON-LD |
| `src/lib/mail.ts`, `inquiry-email.ts` | form delivery and the e-mail layout |
| `src/lib/security-headers.ts` | CSP, HSTS and the rest; `frame-ancestors` lists who may frame the site (the Studio preview) |
| `src/data/site.ts` | fallback contact details (the live values come from the Studio's "Site ayarları") |
| `src/proxy.ts`, `next.config.ts` | redirects, old domains, 410 pages, headers |
| `studio/` | the Sanity Studio: `schemaTypes/` (document types and validation), `structure.ts` (menus), `components/` |
| `scripts/` | checks and tools (below); `scripts/scrape` and `scripts/redirects` are the one-off migration from the old sites |
| `.github/workflows/` | `ci.yml` (lint, build), `sanity-backup.yml` (daily and weekly backups), `sanity-assets.yml` (unused pictures), `uptime.yml` (hourly check) |
| GitHub settings | secrets `SANITY_BACKUP_TOKEN` (Viewer) and `SANITY_CLEANUP_TOKEN` (Editor); repository variable `UPTIME_URL` (the address the hourly check asks) |

## Checks and tools

| Command | What it does |
|---|---|
| `npm run check:site -- <address>` | crawls the sitemap: status, one H1, canonical, hreflang, JSON-LD |
| `npm run check:launch -- <address> --real --old` | launch checklist against a live address |
| `npm run check:redirects` | old addresses answer a redirect to a page that exists |
| `npm run check:sanity` | every Sanity document against the Studio's schema (unknown fields, broken references) |
| `cd studio && npx sanity documents validate --level error` | the Studio's own validation of every document |
| `npm run test:mail` (`-- --route`) | form e-mail against stand-in SMTP, Brevo and Resend servers |
| `node scripts/sanity/sync-to-staging.mjs`, `field-audit.mjs` | copy production into `staging`; prove every Studio field shows on the site |
| `node scripts/sanity/backup.mjs` | export of all documents (also run daily by GitHub Actions) |
| `node scripts/indexnow-submit.mjs <address>` | tells IndexNow search engines about every sitemap address |

## Deploying

- **Site**: merge to `main`; Vercel builds and deploys production. A pull request gets its own preview.
- **Studio**: `cd studio && npx sanity deploy` (needs `sanity login` or a token with the `deployStudio` grant). Schema changes
  need it; content changes do not.
- **Roll back**: Vercel > Deployments > an earlier deployment > Instant Rollback. Content: Studio > document > History (3 days on the
  free plan) or the backups (`docs/backup-restore.md` of the project documents, or the workflow artifacts).

## Rules the code relies on

- A published page keeps its address (the Studio locks the field; changing it breaks links and search results). A blog post replacing an
  old one lists the old address in its "old addresses" field.
- Removing a page: tick "hide from search engines" instead of deleting; a deleted address answers 404 with no automatic redirect.
- The Studio validates required fields; warnings (missing alt text, no author, long meta texts) do not block publishing.
- Pages laid out in code (About, Contact, FAQ, the destinations hub, the home page) show only part of their Studio texts: the Studio says
  which, under the page title.
- The sender of the form mail must be the SMTP mailbox itself; spam filters judge the EHLO name, so `mail.ts` introduces the server with the
  sender's domain.

## Third-party material

Pictures bought from Depositphotos and Vecteezy are licensed to the client; the list is in `docs/image-licenses.md` of the project
documents (not in this repository). Fonts are Google Fonts (open licence). Destination photos in `public/images/photos/` came from
Pexels (free licence). The tours' pictures are in Sanity, not in this repository.
