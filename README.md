# Magnificent Travel website

Website for Magnificent Travel (Macera Tur Turizm Seyahat Acentası Ltd., TURSAB License No. 3217): private, small group and multi-country tours across Turkey, Greece, Egypt, Jordan and Morocco.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. Every content page is statically generated.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (also type-checks)
npm run start    # serve the production build
npm run lint
```

Optional settings live in `.env.example`. The site runs without any of them.

## Where things are

| Path | What it holds |
|---|---|
| `src/data/tours.ts` | Every tour: route, price, itinerary, inclusions, FAQs. Add an object here and the page, listing, sitemap and search filters pick it up. |
| `src/data/combos.ts` | Multi-country packages. |
| `src/data/destinations.ts` | The five country pages. |
| `src/data/faqs.ts`, `reviews.ts`, `policies.ts` | FAQ answers, Tripadvisor excerpts, terms and cancellation tables. |
| `src/data/site.ts` | Phone, WhatsApp, address, social links, navigation. |
| `content/travel-hub/*.md` | Travel Hub articles (Markdown with front matter). |
| `src/components/` | `layout`, `home`, `tours`, `shared`. |
| `src/lib/seo.ts` | Page metadata and JSON-LD builders. |
| `scripts/fetch-images.mjs` | Downloads destination photos from Pexels. |
| `docs/` | Site analysis of the previous website and the build plan. |
| `references/` | Design mockups this build follows. |

Design tokens (colors, type, radius) are at the top of `src/app/globals.css`.

## Photos

Destination photos were downloaded once from Pexels with `npm run images` (needs `PEXELS_API_KEY` in `.env.local`) and are stored in `public/images/photos/`. Photographers are listed in `src/data/image-credits.json` and on the About page. Re-run with `npm run images -- --force` to replace them. The home page header image is `public/images/hero-istanbul.png`, supplied with the design references.

## Destination page design

Each country page has its own look (colors in `src/data/destination-themes.ts`): Turkey uses Iznik tile and an Ottoman skyline with pointed-arch tiles, Greece a Greek key frieze, a Doric temple skyline and pediment tiles, Egypt a lotus frieze, pyramids and stepped tiles, Jordan Nabataean steps, the carved Treasury facade and merlon tiles, Morocco zellige stars, kasbah walls and horseshoe-arch tiles.

The ornaments in `public/ornaments/` are drawn from geometry by `scripts/build-ornaments.mjs` (`npm run ornaments` rebuilds them), so they are original work with no third-party license. They are black SVGs that the site recolors with CSS masks. To change a motif, edit the generator and rebuild.

## Logo

`public/mtlogo.png` is the source artwork. `public/images/logo.png` is the same image with its transparent margins trimmed so it reads at header size; the footer shows it as a white version.

## Forms

The trip request, contact and newsletter forms post to `src/app/api/inquiry/route.ts`. If `RESEND_API_KEY`, `INQUIRY_TO_EMAIL` and `INQUIRY_FROM_EMAIL` are set, each submission is emailed to you. If not, nothing is stored on the server and the confirmation screen offers a WhatsApp message with the visitor's details filled in, so no request is silently lost. Configure email before launch.

## Redirects

Old `/en/...` addresses from the previous website redirect permanently to the new pages (`next.config.ts`).

## Before launch: items for the owner

- **Email address.** The previous site hides it. Set `NEXT_PUBLIC_CONTACT_EMAIL`, and configure the form email settings above.
- **Draft tours.** The 4-Day Turkey Express and 11-Day Cyclades Cruise itineraries were written from the route outline, not from the previous site (`draft: true` in `src/data/tours.ts`). Check days, inclusions and prices.
- **Travel Hub articles** (`content/travel-hub/`), **FAQ answers** (`src/data/faqs.ts`), the **combo package descriptions** (`src/data/combos.ts`), **destination pages** and the **privacy policy** are new copy written for this build. Please read them for accuracy.
- **Prices** are the "from" prices published on the previous website. Confirm they are current.
- **Morocco** has no fixed tours or prices on the previous site, so it is presented as planned to order. Israel is not included.
- **Legal text.** The privacy policy is a plain-language starting point and should be reviewed by someone qualified. Terms and cancellation tables follow the previous site.
- **Logo.** The header uses a typographic wordmark. Add your artwork in `src/components/layout/Logo.tsx` and replace `src/app/icon.svg`.
- **Domain.** Set `NEXT_PUBLIC_SITE_URL` to the final address.
- **Reviews.** Review excerpts are those shown on the previous home page. Keep them in sync with Tripadvisor.
