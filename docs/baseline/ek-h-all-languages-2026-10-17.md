# Ek H kabul listesi, üç dilde (P5, 2026-10-17)

P4.6'daki ilk geçişin (`ek-h-first-pass-2026-10-17.md`) devamı: aynı otomatik denetimler (`scripts/qa/crawl.mjs`, `scripts/qa/ek-h.mjs`) artık **367 sayfada** (en 200, zh 77, jp 90) üç dili birlikte tarıyor. Sonuç: **PASS 20, FAIL 5, later 6**. `hreflang` (H4.1) artık ölçülüyor ve geçiyor: 127 sayfada karşılıklı bağlantı, kendi adresini içeren liste, İngilizce varsa `x-default`.

Çince ve Japonca için kurallar aynı, tek fark başlık ve açıklama uzunluğu: 60 ve 120-160 karakter sınırı Latin harfleri içindir (CJK'de ≈ yarısı kadar karakter aynı genişliği doldurur). CJK başlıklar için 40, açıklamalar için en az 8 karakter kullanıldı.

## Açık kalanlar (zh ve jp ile ilgili)

| Madde | Sonuç | Neden | Görev |
|---|---|---|---|
| H3.1a başlıklar ≤ 60 (CJK 40) | FAIL | jp: 79 sayfanın başlığı eski sitenin başlığı ve çok uzun (≈ 60-90 karakter, SERP'te kesilir); zh: 3 | P8 (SEO yazımı): anadil editör kısaltır. İlke 12: sıralama verisi yok (GSC'de zh/jp yok), bu yüzden başlıklar bilerek değiştirilmedi |
| H3.1b açıklamalar benzersiz | FAIL | 7 zh sayfası aynı genel açıklamayı kullanıyor (eski sitenin varsayılan metni) | P8: anadil editör |
| H2.1 sayfada yeterli metin | FAIL | `/zh/privacy-policy/`: eski sitede sayfanın tamamı "Privacy Policy" kelimeleri (taslak/boş sayfa) | **Müşteri**: gerçek gizlilik metni yazılmalı; o zamana kadar zh altbilgisi İngilizce politikaya bağlanabilir |

Diğer FAIL satırları (H6.1 hız, H7.1 güvenlik başlıkları) P4'teki gibi P9'a bağlı; H1.1, H1.4b, H5.2, H7.3, H11.1, H12.1 "later".

| Item | | Result | Note |
|---|---|---|---|
| H1.1 | One preferred host; http, *.vercel.app and old domains redirect in one step | later | the real domain is not connected yet (P7.10, P10) |
| H1.2 | Canonical absolute, to itself, with trailing slash | PASS | 0 differ |
| H1.3a | Sitemap lists only 200, indexable, canonical addresses | PASS | 367 pages, 0 problems |
| H1.3b | Sitemap index file, real lastmod | PASS | /sitemap.xml answers 200; lastmod is left out on purpose (no real dates) |
| H1.4 | robots.txt: sitemaps listed, /api/ blocked, CSS/JS/images not blocked | PASS | User-Agent: * / Allow: / / Disallow: /api/ /  / Sitemap: https://www.magnificenttravel.com/sitemap.xml /  |
| H1.4b | AI crawler decision written and tested | later | P8.3 |
| H1.5 | noindex only on site search, thank-you pages, previews | PASS | sitemap pages with noindex: 0; the search page is noindex and not in the sitemap |
| H1.6 | Status policy 200/301/404/410, no soft 404 | PASS | unknown address 404, removed address 410 |
| H1.8a | No orphan page: every indexable page has an internal link | PASS | 0 without one  |
| H1.8b | Every page within 3 clicks of the home page | PASS | deepest 2; 0 deeper than 3  |
| H2.1 | Content and links in the first HTML | FAIL | 1 pages with almost no text: /zh/privacy-policy/ |
| H2.2a | Exactly one h1 per page | PASS | 0 pages |
| H2.2b | main, nav, header, footer landmarks | PASS |  |
| H2.3 | lang correct; UTF-8; compression | PASS | content-type text/html; charset=utf-8; content-encoding gzip |
| H3.1a | Titles unique, up to 60 characters (40 for Chinese and Japanese) | FAIL | 0 repeated; too long: en 1, zh 3, jp 79 (English: the moved blog title that is 61 on the live site; Chinese and Japanese: the old titles, kept) |
| H3.1b | Descriptions unique, 120-160 characters (Chinese and Japanese: at least 8) | FAIL | 0 outside the range; 7 repeated /zh/blog/, /zh/contact/, /zh/destinations/turkey-tours/02-to-05-days-tours/cappadocia-pamukkale-ephesus-tour-by-plane/ |
| H3.2 | Open Graph and Twitter cards, share picture | PASS | 0 without a share picture |
| H4.1 | hreflang reciprocal, x-default, only where a real counterpart exists | PASS | 136 pages with hreflang; 0 problems  |
| H5.1 | JSON-LD parses and each page type carries its types | PASS | 0 invalid; 0 missing  |
| H5.2 | Validated in Google Rich Results Test; one @id graph; values match the visible page | later | P8 (S3.5): the shapes are in, the validator run and the @id graph are not |
| H6.1 | LCP under 2.5 s, INP under 200 ms, CLS under 0.1 (mobile) | FAIL | CLS 0 everywhere; lab LCP 3.9-5.7 s (docs/baseline/lighthouse-p3-2026-10-17.md); P9.1 and P9.13 |
| H7.1 | HSTS, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors | FAIL | missing: strict-transport-security, content-security-policy, frame-ancestors / x-frame-options (P9.2) |
| H7.2 | External links carry rel="noopener" | PASS | 0 pages |
| H7.3 | Form bot protection, rate limit, cookie consent | later | bot protection is in (Turnstile); rate limit and cookie consent: P9.4, P9.10 |
| H8.1 | Images have alt text (decorative ones empty) | PASS | 0 pages with an image without an alt attribute |
| H8.2 | No broken pictures | PASS | 1271 pictures checked |
| H9.1 | Viewport; no horizontal scroll; tap targets; sticky items do not cover content | PASS | checked on 10 templates in an emulated phone (P3.15); real devices still to do |
| H10.1 | No broken or redirected internal link | PASS | 367 internal addresses checked |
| H10.2 | Breadcrumb on every page, same as BreadcrumbList | PASS | 0 without BreadcrumbList  |
| H11.1 | llms.txt; AI bots can read the site; short answer, author, date, source on pages | later | llms.txt answers 404; P8.3 |
| H12.1 | Search Console (Domain), Bing, GA4 and GTM events, uptime, weekly 404 check | later | P8.5, P8.6, P10 |
