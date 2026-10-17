# Ek H kabul listesi, ilk geçiş (2026-10-17)

P4.6. Ek H'nin teknik maddeleri, önizleme sitesinin (`magnificenttravel.vercel.app` ile aynı yapı, yerel üretim derlemesi) 200 sayfalık sitemap'i üzerinde otomatik denendi: `node scripts/qa/crawl.mjs` ve `node scripts/qa/ek-h.mjs`. Sonuç: **PASS 22, FAIL 2, later 7**. "later": madde şu an ölçülemez, çünkü bağımlı olduğu iş (gerçek alan adı, zh/jp içeriği, doğrulayıcı) henüz yok; hangi faza yazıldığı notta.

Geçmeyen ve ertelenen maddeler plana şu fazlara görev olarak yazıldı:

| Madde | Sonuç | Görev |
|---|---|---|
| H6.1 LCP < 2,5 sn (mobil) | FAIL | P9.1, P9.13: lab LCP 3,9 - 5,7 sn (`lighthouse-p3-2026-10-17.md`); CLS her sayfada 0 |
| H7.1 HSTS, CSP, frame-ancestors | FAIL | P9.2: nosniff, Referrer-Policy ve Permissions-Policy eklendi; CSP için dışarıdan yüklenen tüm betiklerin (Turnstile, Tripadvisor, analitik) listesi gerekiyor; HSTS alan adı Vercel'e bağlanınca |
| H1.1 tek tercih edilen host, tek adımda yönlendirme | later | P7.10, P10 (gerçek alan adı bağlanınca) |
| H1.4b AI tarayıcı kararı | later | P8.3 |
| H4.1 hreflang | later | P5 (yalnızca İngilizcede kendi içeriği var) |
| H5.2 Rich Results Test, tek @id grafiği | later | P8 (S3.5) |
| H7.3 hız sınırı, çerez onayı | later | P9.4, P9.10 |
| H11.1 llms.txt | later | P8.3 |
| H12.1 Search Console, Bing, GA4/GTM, uptime | later | P8.5, P8.6, P10 |

Bu geçişte kodda düzeltilenler: sitemap indeksi (`/sitemap.xml`), `robots.txt`'nin indekse işaret etmesi, güvenlik başlıkları, yetim sayfalar (altbilgiden mesafeli satış bağlantısı, ekip bloğundan yazar sayfası), About/FAQ/İletişim/Destinations hub başlıklarının ve metinlerinin eski sayfalardaki gibi olması.

| Item | | Result | Note |
|---|---|---|---|
| H1.1 | One preferred host; http, *.vercel.app and old domains redirect in one step | later | the real domain is not connected yet (P7.10, P10) |
| H1.2 | Canonical absolute, to itself, with trailing slash | PASS | 0 differ |
| H1.3a | Sitemap lists only 200, indexable, canonical addresses | PASS | 200 pages, 0 problems |
| H1.3b | Sitemap index file, real lastmod | PASS | /sitemap.xml answers 200; lastmod is left out on purpose (no real dates) |
| H1.4 | robots.txt: sitemaps listed, /api/ blocked, CSS/JS/images not blocked | PASS | User-Agent: * / Allow: / / Disallow: /api/ /  / Sitemap: https://www.magnificenttravel.com/sitemap.xml /  |
| H1.4b | AI crawler decision written and tested | later | P8.3 |
| H1.5 | noindex only on site search, thank-you pages, previews | PASS | sitemap pages with noindex: 0; the search page is noindex and not in the sitemap |
| H1.6 | Status policy 200/301/404/410, no soft 404 | PASS | unknown address 404, removed address 410 |
| H1.8a | No orphan page: every indexable page has an internal link | PASS | 0 without one  |
| H1.8b | Every page within 3 clicks of the home page | PASS | deepest 3; 0 deeper than 3  |
| H2.1 | Content and links in the first HTML | PASS | 0 pages under 50 words:  |
| H2.2a | Exactly one h1 per page | PASS | 0 pages |
| H2.2b | main, nav, header, footer landmarks | PASS |  |
| H2.3 | lang correct; UTF-8; compression | PASS | content-type text/html; charset=utf-8; content-encoding gzip |
| H3.1a | Titles unique, up to 60 characters | PASS | 0 repeated; 1 over 60 (the moved blog title that is 61 on the live site) |
| H3.1b | Descriptions unique, 120-160 characters | PASS | 0 outside the range |
| H3.2 | Open Graph and Twitter cards, share picture | PASS | 0 without a share picture |
| H4.1 | hreflang reciprocal, x-default, only where a real counterpart exists | later | only English has content of its own; starts with P5 |
| H5.1 | JSON-LD parses and each page type carries its types | PASS | 0 invalid; 0 missing  |
| H5.2 | Validated in Google Rich Results Test; one @id graph; values match the visible page | later | P8 (S3.5): the shapes are in, the validator run and the @id graph are not |
| H6.1 | LCP under 2.5 s, INP under 200 ms, CLS under 0.1 (mobile) | FAIL | CLS 0 everywhere; lab LCP 3.9-5.7 s (docs/baseline/lighthouse-p3-2026-10-17.md); P9.1 and P9.13 |
| H7.1 | HSTS, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors | FAIL | missing: strict-transport-security, content-security-policy, frame-ancestors / x-frame-options (P9.2) |
| H7.2 | External links carry rel="noopener" | PASS | 0 pages |
| H7.3 | Form bot protection, rate limit, cookie consent | later | bot protection is in (Turnstile); rate limit and cookie consent: P9.4, P9.10 |
| H8.1 | Images have alt text (decorative ones empty) | PASS | 0 pages with an image without an alt attribute |
| H8.2 | No broken pictures | PASS | 868 pictures checked |
| H9.1 | Viewport; no horizontal scroll; tap targets; sticky items do not cover content | PASS | checked on 10 templates in an emulated phone (P3.15); real devices still to do |
| H10.1 | No broken or redirected internal link | PASS | 222 internal addresses checked |
| H10.2 | Breadcrumb on every page, same as BreadcrumbList | PASS | 0 without BreadcrumbList  |
| H11.1 | llms.txt; AI bots can read the site; short answer, author, date, source on pages | later | llms.txt answers 404; P8.3 |
| H12.1 | Search Console (Domain), Bing, GA4 and GTM events, uptime, weekly 404 check | later | P8.5, P8.6, P10 |