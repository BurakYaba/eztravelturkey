# Magnificent Travel Rebuild Plan

> **Outdated, see [project-plan.md](project-plan.md).** This is the plan for the first, English-only static build. The new plan (three languages, Sanity CMS, scraped content, original URL structure) supersedes it wherever they disagree. Note: its Morocco assumption ("no tours") is wrong, the live site has fixed Morocco tours.

Status: written before any implementation. Companion document: [site-analysis.md](site-analysis.md).

## 1. Goal

Build the Magnificent Travel website in this repository (licensed Turkish tour operator, since 1997): a quote-request funnel for private, small-group and multi-country tours across Turkey, Greece, Egypt, Jordan and Morocco. Design source of truth is `references/` (navy, bronze-gold, warm off-white, serif display). Content source of truth is the live site (see site-analysis.md).

Design read: travel operator site for international English-speaking travelers planning multi-country trips, trust-first heritage-premium language, leaning toward editorial layout with Tailwind v4, a serif display face, and restrained GSAP motion.
Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 4, VISUAL_DENSITY 4.

### Deliberate deviations from the design skill defaults (each justified)
- Serif display type and a navy plus bronze plus cream palette: the owner's reference mockups specify them, and the brand is a 1997 heritage operator. Playfair Display (not Fraunces / Instrument Serif).
- Light theme only: every supplied mockup is light and brand-defined; dark mode is dropped, not half-supported. `next-themes` removed.
- Phosphor icons only; no hand-drawn SVG icons. Logo is a typographic wordmark.
- No em-dashes anywhere in visible copy.

## 2. Decisions needed from the owner (defaults chosen so work is not blocked)

| # | Question | Default used |
|---|---|---|
| 1 | Contact email (obfuscated on live site) | placeholder constant in one file, flagged in README |
| 2 | Quote forms: how do enquiries get delivered | Form posts to an API route; with `RESEND_API_KEY` + `INQUIRY_TO_EMAIL` set it emails, otherwise the success screen hands off to WhatsApp with the message prefilled. Nothing is silently dropped. |
| 3 | Morocco and Israel (no tour data crawled) | Morocco gets a destination page with "tailor-made on request" and no invented tours. Israel dropped, matching the references. |
| 4 | Two tours (4-Day Turkey, 11-Day Cyclades) were not read in detail | Built with outline itineraries and `draft: true`; listed in README for review before launch |
| 5 | Travel Hub articles | 8 original articles drafted, flagged as draft copy for review |
| 6 | Legacy URLs (`/en/...`) | `next.config.ts` redirects `/en/:path*` to the new path; per-tour mapping listed in section 9 |

## 3. Clean start

Only the toolchain (Next.js, React, Tailwind, TypeScript, ESLint, Prettier) was kept. All pages, components, data, assets and scripts are written for this site.
Keep: toolchain only (Next 16, React 19, Tailwind 4, TypeScript, ESLint, Prettier config), `references/` and `docs/`.
Dependencies removed: next-themes, leaflet, react-leaflet, @types/leaflet, swiper, react-fast-marquee, classnames, @radix-ui/react-slot, prettier-plugin-css-order (if unused after config check).
Dependencies kept: gsap, @gsap/react, lenis, gray-matter, react-markdown, rehype-slug, clsx, tailwind-merge.
Dependencies added: @phosphor-icons/react.
Exit check: a repository-wide search for unrelated product names, demo content and unused assets returns nothing outside `docs/` and `references/`.

## 4. Architecture

Next.js App Router, React Server Components by default, client leaves only for interaction (mobile menu, tabs, accordion, filters, forms, motion). Content as typed TypeScript data in `src/data/` (tours, destinations, combos, faqs, reviews, policies) and Markdown with front-matter for Travel Hub articles in `content/travel-hub/`. No database, no CMS. Static generation for all content pages (`generateStaticParams`).

```
src/
  app/
    layout.tsx, globals.css, not-found.tsx, sitemap.ts, robots.ts
    page.tsx                         Home
    destinations/page.tsx            Hub
    destinations/[country]/page.tsx  Turkey, Greece, Egypt, Jordan, Morocco
    multi-country-tours/page.tsx
    multi-country-tours/[slug]/page.tsx
    tours/page.tsx                   All tours + filter bar
    tours/[slug]/page.tsx            Tour detail
    private-tours/page.tsx           Tour Styles
    small-group-tours/page.tsx
    plan-my-trip/page.tsx            Quote request
    travel-hub/page.tsx, travel-hub/[slug]/page.tsx
    about/page.tsx, contact/page.tsx, faq/page.tsx
    privacy-policy/page.tsx, terms-conditions/page.tsx
    api/inquiry/route.ts
  components/
    layout/   Header, MobileMenu, Footer, WhatsAppButton, Logo
    home/     Hero, SearchBar, TrustBar, WhyTravel, DestinationGrid, FeaturedTours, WaysToTravel, HubPreview, ReviewsBand, QuoteBand
    tours/    TourCard, TourGrid, FilterBar, TourHero, TripGlance, Itinerary, Inclusions, TripRequirements, QuoteSidebar, RelatedTours
    shared/   Section, Breadcrumbs, Button, Faq (accordion), Newsletter, JsonLd, Reveal, PageBanner
  data/       site.ts, destinations.ts, combos.ts, tours.ts, faqs.ts, reviews.ts, policies.ts, images.ts
  lib/        seo.ts (metadata + JSON-LD builders), content.ts (markdown loader), format.ts
content/travel-hub/*.md
scripts/fetch-images.mjs
```

### Data model (sketch)
```ts
type Tour = {
  slug: string; title: string; subtitle: string;
  country: CountryId | 'multi'; countries: CountryId[];
  style: ('private' | 'small-group')[];
  nights: number; days: number; fromPriceEUR: number;
  route: string[]; difficulty: 'easy' | 'moderate';
  season: string; guideLanguages: string[]; flights: string;
  hotelClass: string; summary: string; highlights: string[];
  itinerary: { day: string; title: string; text: string; meals: string; overnight: string }[];
  included: string[]; excluded: string[]; faqs: Faq[];
  image: ImageId; gallery: ImageId[]; related: string[]; draft?: boolean;
};
```

## 5. Routes and page contents (from the references)

| Route | Layout (reference image) | Key content |
|---|---|---|
| `/` | `web- Tasarım.png` | Hero over `hero bg.png` with search bar (Destination, Travel Style, Duration), trust row, "Travel Deeper with People Who Know", six destination tiles, three featured journeys, Ways to Travel, Travel Hub preview, verified reviews, quote CTA band |
| `/tours` | `Tours Landing pages.png` | Banner, breadcrumb, filter bar (destination, style, duration, reset, count), country tabs, card grid, trust strip, multi-country cross-sell |
| `/tours/[slug]` | `Seçenek-1.png` | Split hero, trust strip, sticky tab bar (Overview, Itinerary, Inclusions, Trip Requirements, FAQs, Reviews), Trip at a Glance, route stops, Why Choose This Journey, day accordion, inclusions/exclusions, FAQ, TripAdvisor band, related tours, sticky Plan Your Trip box |
| `/destinations`, `/destinations/[country]` | Tours Landing layout | Country hero, intro, tours for that country grouped by length, best time, FAQ |
| `/multi-country-tours`, `/[slug]` | Tours Landing layout | Combo hero, "at a glance" table, how the trip fits together, flights versus ferries, tours, FAQ |
| `/private-tours`, `/small-group-tours` | Tours Landing layout | Explains the format, filtered tour grid |
| `/travel-hub`, `/travel-hub/[slug]` | `Travel Hub.png` | Search, topic pills, featured article, grid with related tours, newsletter; article page with answer first, author, updated date, related tours |
| `/plan-my-trip` | Tour sidebar form, full page | Travelers, dates, destinations, style, contact, message |
| `/about`, `/contact`, `/faq` | Site content | Licence No. 3217, years, stats, team-neutral copy, address, hours, FAQ in five groups |
| Legal | Live site policies | Terms (payment, cancellation tables), privacy |

Header (one line at desktop, height 72 px): logo, Destinations (mega dropdown of 5 countries), Tour Styles (Private, Small Group), Multi-Country Tours, About, Travel Guides, Contact, then the "Plan My Trip" button. Mobile: full-height sheet menu.
Persistent floating WhatsApp button replaces the live chat widget.

## 6. Design system

| Token | Value |
|---|---|
| Navy (ink, headings, dark bands) | `#0F2D4A`, deep `#0A2038` |
| Bronze-gold (single accent, all CTAs) | `#B07D2E`, hover `#966722` |
| Surface | `#FBF8F3` page, `#F4EDE1` tinted band, `#FFFFFF` cards |
| Text | `#1B2B3C` body, `#5C6B7A` muted (checked for AA on all surfaces) |
| Radius | 8 px cards and inputs, 8 px buttons (one scale, no pills except filter chips) |
| Display font | Playfair Display via `next/font` |
| Body font | Hanken Grotesk via `next/font` |
| Icons | Phosphor, regular weight, one `strokeWidth` |

Rules carried over from the design skill: hero fits the first viewport with `min-h-[100dvh]` where full-bleed; max 4 text elements in the hero; one CTA label per intent ("Request a Personalized Quote" everywhere for quote intent, "Plan My Trip" only for the header button which is the same intent so it is the one label used in nav; hero uses "Explore Tours" and "Plan a Custom Trip"); eyebrow labels capped at one per three sections; no zigzag runs longer than two; trust logos shown as TripAdvisor and TURSAB marks with no captions; no scroll cues; reduced-motion honoured.
Buttons: bronze fill with navy-dark text is not allowed (contrast); bronze fill uses white text and is verified at 4.5:1 or larger weight; the bronze is darkened to `#9A6A22` for filled buttons if the check fails.

Motion (each justified): hero text and image entrance (hierarchy), card reveal on scroll via one shared `Reveal` using GSAP ScrollTrigger batch (sequence), tab and accordion transitions (state change), Lenis smooth scroll (kept, disabled under reduced motion). No marquees. No parallax gimmicks beyond a slow hero image scale.

## 7. Images (Pexels pipeline)

`scripts/fetch-images.mjs` reads `PEXELS_API_KEY` from `.env.local`, runs a manifest of named queries (for example `istanbul-skyline`, `cappadocia-balloons`, `santorini-blue-domes`, `giza-pyramids`, `petra-treasury`, `wadi-rum`, `marrakech-souk`, `ephesus-library`, `pamukkale-terraces`, `mykonos-windmills`, `nile-cruise`, `hagia-sophia-interior`, `turkish-tea`, `delos`, `dead-sea`), selects the best landscape result by size and relevance, downloads the `large2x` rendition to `public/images/photos/<id>.jpg`, and writes `src/data/image-credits.json` (photographer, URL, Pexels page). Images are committed locally; the key is never shipped to the browser and never used at runtime.
Pexels licence permits free commercial use without attribution; credits are still shown on an unobtrusive "Photo credits" line in the footer-linked page section of About.
Hero uses `references/hero bg.png` (owner-supplied). Where a query returns nothing suitable, the manifest entry is reported by the script and the slot falls back to a navy gradient with no fake imagery.
`next/image` with `sizes` set per slot, `priority` on the hero only.

## 8. SEO and structured data (from `SAYFA YAPISI.png`)

Per-page metadata (title, description, canonical, Open Graph, Twitter) from `lib/seo.ts`. Server-rendered JSON-LD:
- Home: `WebSite`, `TravelAgency` (Organization identity, address, phone, `sameAs`, licence in `description`), `WebPage`.
- Country, combo, styles, tours listing: `CollectionPage`, `ItemList`, `BreadcrumbList`.
- Tour: `TouristTrip` with `Offer` (price from, EUR) and itinerary `ItemList`, `WebPage`, `BreadcrumbList`.
- Travel Hub: `Blog`/`CollectionPage`. Article: `BlogPosting` plus `BreadcrumbList`.
- About: `AboutPage`; Contact: `ContactPage`.
- No `FAQPage` markup (restricted to government and health sites since Aug 2023). FAQs stay visible content only.
- No `AggregateRating` self-markup on the site's own pages (self-serving review markup is not eligible); the 5.0 TripAdvisor figure is shown as text with a link to the listing.
`sitemap.ts` and `robots.ts` generated from the data. One `h1` per page. Semantic landmarks. Alt text written per image.

## 9. Legacy URL handling

`/en/:path*` redirects to `/:path*`. Explicit mapping: `/en/destinations/turkey-tours` to `/destinations/turkey`; `/en/destinations/greece-tours` to `/destinations/greece` (same for egypt, jordan, morocco); `/en/destinations/<combo>-tours` to `/multi-country-tours/<combo>`; `/en/blog` to `/travel-hub`; `/en/faq`, `/en/about`, `/en/contact` unchanged; `/en/gdpr/privacy-policy` to `/privacy-policy`; `/en/gdpr/terms-conditions` to `/terms-conditions`; the four crawled tour URLs to `/tours/<slug>`. Israel pages redirect to `/destinations`. Permanent (308) redirects.

## 10. Phases

| Phase | Work | Done when |
|---|---|---|
| 0 | Docs written (this file, site-analysis.md) | Both exist |
| 1 | Clean start, new `package.json`, config, fonts, tokens, layout shell | `npm run build` passes on a blank home; residue grep clean |
| 2 | Image pipeline run; `images.ts` and credits generated | All manifest images downloaded or reported |
| 3 | Data files and content (tours, destinations, combos, faqs, reviews, articles) | Types compile; every tour has route, price, itinerary |
| 4 | Shared components and header/footer | Visual match to reference header and footer |
| 5 | Home page | Matches `web- Tasarım.png` at 1440 and 390 px |
| 6 | Listing pages (tours, destinations, combos, styles) with filters | Filters work client-side, counts correct |
| 7 | Tour detail layout | Matches `Seçenek-1.png`; tabs scroll-spy, sticky box, accordion |
| 8 | Travel Hub, About, Contact, FAQ, Plan My Trip, legal, API route | Forms validate and hand off |
| 9 | SEO: metadata, JSON-LD, sitemap, robots, redirects | Schema validated by parsing, sitemap lists all routes |
| 10 | QA: lint, typecheck, build, Playwright screenshots desktop and mobile, link crawl, a11y contrast spot checks, em-dash scan, residue grep | All green; README written |

## 11. Verification checklist (run before reporting done)

1. `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass.
2. Every internal link resolves (crawl of the built site).
3. Screenshots of home, tours, one tour, travel hub, contact at 1440 and 390 px compared against the references.
4. Zero em-dashes (`—`) and en-dashes used as separators in `src/`, `content/`.
5. No unrelated product names, demo content or unused assets.
6. No console errors on any page; no layout shift on the hero (image dimensions reserved).
7. Reduced-motion run shows static content with nothing hidden.
8. Draft content list in README matches `draft: true` flags in data.

## 12. Risks

- Pexels results may not match "Cappadocia balloons" quality or may include recognisably wrong places; the script logs the chosen photo for each slot and I will review contact sheets before accepting.
- Several tours and all Morocco content are not on the crawled pages; the plan avoids inventing prices and flags drafted itineraries.
- Quote delivery depends on the owner supplying an email provider key; WhatsApp handoff is the zero-config fallback.
- The reference mockups are AI-generated art; exact pixel matching is not the target, structure and tone are.

## 13. Implementation status and deviations from this plan

Completed on 2026-10-03. Everything in phases 1 to 10 was built and verified; the checks are listed in section 11 and were run against a production build.

Changes made while building, with reasons:

| Plan said | What was built | Why |
|---|---|---|
| Lenis smooth scroll kept | Removed | It fights the sticky tab bar and scroll-spy, and content does not need it. |
| GSAP ScrollTrigger reveal for cards | CSS scroll-driven animation (`.reveal`) with GSAP only for the hero photo drift | CSS reveals leave content visible if JavaScript fails and cause no flash on first paint. GSAP is used where it is the right tool (scrubbed parallax), inside `matchMedia` for reduced motion. |
| 8 Travel Hub articles | 9 | The reference mockup has a Food and Cuisine topic pill, which needed an article. |
| Header search icon | Not built | The reference has one, but search lives on the Travel Hub and the home search bar. |
| `/videos` page | Not built | Not in the reference designs. The five YouTube links are not on the new site. |
| Dark mode removed | Same | Mockups are light only. |
| Quote CTA labels | "Plan My Trip" for every navigation to the quote form; "Send My Request" only on form submit buttons | One label per intent. |
| Tour tabs scroll-spy | IntersectionObserver band plus a short lock while a tab click scrolls | Plain observer left the wrong tab highlighted after clicks. |

Bugs found and fixed during verification: the mobile menu collapsed to zero height because `fixed` inside a `backdrop-filter` header is positioned against the header (menu moved outside the header); scroll-spy highlight; repeated photos on tour pages; cramped search bar and trust bar at 768 px; horizontal rail alignment.

Next.js 16 also generated `AGENTS.md` and `CLAUDE.md` in the project root on first run. They are agent instructions for the framework and are safe to keep or delete.

### Round 2 (2026-10-04)

- Header, hero sections, page banners and footer now start at the left edge of the page (`.container-wide`); body sections keep the centered container. The cream veil over hero photos was shortened so it no longer reads as a half-width mask.
- Logo: `public/mtlogo.png` (trimmed copy at `public/images/logo.png`). Header height is 80 px; every offset that depends on it was updated.
- Mobile menu is a right-hand drawer, 50% of the screen wide (never narrower than 17rem), with backdrop, Escape to close, focus return and reduced-motion support.
- Destination pages have a per-country design system (themes, ornaments, skyline, shaped tiles). Free-asset search returned nothing with a clear license, so all ornaments are generated from code.
