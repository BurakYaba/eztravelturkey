# Lighthouse, mobile, end of P3 (2026-10-17)

Method: Lighthouse 12.8, mobile profile (simulated slow 4G, 4x CPU slowdown), headless Chromium, against a production build served on `localhost:3100` with the real Sanity data. Lab numbers on a local server, not field data: they show direction, not the figure Google will see (that comes from Vercel and CrUX, P9.1).

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|---|---|---|
| Home | 77 | 100 | 96 | 100 | 5.7 s | 0 | 110 ms | 1.1 s |
| Country (Egypt) | 74 | 100 | 96 | 100 | 5.2 s | 0 | 240 ms | 1.1 s |
| Tour (3-day Turkey) | 81 | 100 | 96 | 100 | 4.7 s | 0 | 80 ms | 1.2 s |
| Blog post (Map of Egypt) | 87 | 100 | 96 | 100 | 3.9 s | 0 | 70 ms | 1.0 s |

**Target (principle 4): LCP under 2.5 s, CLS under 0.1, INP under 200 ms. CLS is met everywhere; LCP is not met in this lab setting.** It goes to P9 (P9.1, P9.9).

## What moved during P3

| Change | Effect (home, same method) |
|---|---|
| Chinese and Japanese font stylesheets (about 1 MB) were in the render-blocking CSS of every English page; now loaded in the browser only on zh and jp pages (`src/app/fonts/`) | LCP 8.2 s to 5.8 s, FCP 3.3 s to 1.3 s |
| Cloudflare Turnstile (about 700 KB) starts when a visitor first touches a form, not on page load | TBT on tour pages about 660 ms to 80 ms |
| Hero text no longer waits for an entrance animation | small, part of the rows above |

## What is left for P9 (measured causes)

- LCP element is the hero or first card picture. Its download is quick (under 100 ms locally); the page then waits about 2 s before painting it (render delay under the 4x CPU slowdown). Candidates: smaller mobile hero (`hero-istanbul.png` is 66 KB at 750 px, a smaller WebP or AVIF crop for phones), fewer client components hydrated on the first screen, check on the real Vercel preview.
- Lighthouse reports about 290 KiB of image savings on the home page (formats and sizes).
- About 30 KiB of unused JavaScript and 14 KiB of legacy JavaScript in the shared chunks.
- Turnstile and the Tripadvisor widget load after interaction or after the page has loaded; their effect on INP is to be measured in the field.

Raw reports (JSON) are in `data/lighthouse/` on the working machine (not in git).
