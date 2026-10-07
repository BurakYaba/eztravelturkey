# magnificenttravel.com Site Analysis

> **Outdated, see [project-plan.md](project-plan.md).** This document describes the first, English-only build. The plan supersedes it wherever they disagree. Known corrections: the live site **does have fixed Morocco tours** (about 11 tour pages under `/en/destinations/morocco-tours/`), the live URL tree is richer than the sitemap below (duration and package categories, combo tours under each combo, blog under `/en/blog/<country>/`, author pages), and the previous "Morocco has no tours" statements are wrong. Israel is dropped.

Source: https://www.magnificenttravel.com/en/ (crawled 2026-10-03).
Scope: home, about, destinations hub, one country page (Turkey), one combo page (Turkey and Greece), four tour detail pages (Turkey, Greece, Egypt, Jordan), contact, blog, FAQ, videos.
Not crawled in detail: Morocco and Israel country pages, remaining combo pages, search, individual blog posts, Mesafeli Satis Sozlesmesi. Where this document says "not verified", the page was not read.

## 1. Business facts (single source of truth for all copy)

| Item | Value |
|---|---|
| Brand | Magnificent Travel |
| Legal entity | Macera Tur Turizm Seyahat Acentasi Ltd. |
| Licence | TURSAB / Ministry of Culture and Tourism, License No. 3217 |
| Founded | 1997 (independent Turkish tour operator) |
| Rating | 5.0 on TripAdvisor (187 reviews per About page) |
| Travelers | 35,000+ customers, 2,500+ tours completed |
| Support | 24/7 local support during trips |
| WhatsApp | +90 (532) 493 51 98 (`https://wa.me/905324935198`) |
| Phone | +90 (212) 458 65 65 |
| Email | obfuscated on the site (Cloudflare), not captured. Must be supplied by the owner. |
| Address | Kucukayasofya Mah. Gelinlik Sok. No:1/3, Sultanahmet, Fatih, Istanbul 34122, Turkey |
| Social | Facebook `/Magnificenttravel`, LinkedIn `/company/magnificent-travel-tours/`, Instagram `@magnificenttourism` |
| Review source | TripAdvisor listing g293974-d5617607 (Magnificent Travel Private day tours, Istanbul) |
| Payments | Visa, Mastercard, bank transfer |

Tour formats: Private, Small Group, Customized. Guides are licensed and English-speaking (Spanish available on some tours). Inclusions are typically hotels with breakfast, transfers, licensed guides, sightseeing transport, entrance fees, and domestic flights or ferries where the route needs them.

## 2. Sitemap (as live today)

```
/en/                                  Home
/en/about/                            About
/en/destinations/                     Destinations hub (single-country + combo cards)
  /en/destinations/turkey-tours/
      /03-to-05-days-tours/<tour>/
      /06-to-09-days-tours/<tour>/
      (10-14 and 15+ day groups exist, not verified)
  /en/destinations/greece-tours/
      /greece-travel-packages/<tour>/
      /greece-cruise-packages/<tour>/
  /en/destinations/egypt-tours/<tour>/
  /en/destinations/jordan-tours/<tour>/
  /en/destinations/morocco-tours/         (not verified)
  /en/destinations/israel-tours/          (not verified)
  Combo tours (listed under destinations):
  /en/destinations/turkey-greece-tours/
  /en/destinations/turkey-greece-and-egypt-tours/
  /en/destinations/turkey-and-egypt-tours/
  /en/destinations/turkey-and-jordan-tours/
  /en/destinations/greece-and-egypt-tours/
  /en/destinations/egypt-jordan-and-israel-tours/
  /en/destinations/greece-and-jordan-tours/
/en/faq/                              FAQ (5 groups, 40+ questions)
/en/blog/                             Blog index (destination categories)
  /en/blog/<country>/
/en/contact/                          Contact
/en/videos                            Videos (5 YouTube links)
/en/search/                           Search (not verified)
/en/gdpr/privacy-policy
/en/gdpr/terms-conditions
/en/gdpr/mesafeli-satis-sozlesmesi    Turkish distance-sales agreement
```

Header: top bar (email + Facebook/LinkedIn/Instagram), logo, menu Home, About, Destinations (6 countries), COMBO TOURS (7 combos), FAQ, Blog, Contact.
Persistent: chat widget bottom-right ("How may i help you?", "Chat with a consultant", WhatsApp number), newsletter block above the footer.

## 3. Page templates

### 3.1 Home
1. Hero: H1 "Turkey, Greece, Egypt & Jordan Tours and Multi-Country Packages", single CTA "Discover" (to About).
2. Destination highlight cards (Turkey, Greece, Egypt, Jordan) with a TripAdvisor 5.0 badge and a tagline each:
   - Turkey: "The Adventure of a Lifetime Begins Here!"
   - Greece: "Where Ancient Wonders Meet Modern Marvels!"
   - Egypt: "Your Gateway to the World's Greatest Wonders!"
3. About block: "Why Travel With Magnificent Travel?" with tabs Mission / Vision / Focus On Customer, "35,000+ Customers" stat, CTAs Read More and Videos.
4. "Journey to the Our Destinations": six country cards.
5. Multi-country packages (6 cards: image, nights/days, city list, "from" price in EUR taxes included, "Book a Trip").
6. "Popular Turkey, Greece, Egypt & Jordan Tour Packages" (6 tour cards, same fields).
7. "Why Travelers Choose Magnificent Travel": six feature cards.
8. "Recent Traveler Reviews": three TripAdvisor review cards.
9. FAQ accordion (17 questions).
10. Newsletter ("Join The Newsletter / To receive our best monthly deals").
11. Footer.

### 3.2 Destinations hub
Two grouped card sets: Single-Country Tours (6) and Multi-Country Combo Tours (7), each with image, title, short description, link. Below: credentials block "Regional Travel Specialists Since 1997", per-region guidance text, a 9-question FAQ, footer.

### 3.3 Country page (Turkey as the model)
Short company credibility intro, tour grouping by length (3-5, 6-9, 10-14, 15+ days), key destinations list, tour formats, typical inclusions, best travel periods (April-June and September-October), UNESCO fact (21 sites), FAQ. Tour cards: image, duration, destinations, price.

### 3.4 Combo page (Turkey and Greece as the model)
H1 "Turkey and Greece Tours: 8-18-Day Packages", breadcrumb, grid of 10 tour cards (680x450 thumbnail, nights/days, city list, "from" price, "Book a Trip"), then long-form SEO blocks: "at a glance" comparison table, why the pair works, how the journey fits together, duration guidance (8-10, 11-14, 15-18 days), flights versus ferries, best periods, how to choose, 20+ FAQ.

### 3.5 Tour detail
Order observed on the 8-Day Turkey tour:
1. Image gallery (950x700).
2. Title and facts card: duration, guide language, group type, flights, starting price, cancellation, difficulty, season.
3. Route map image (800x600).
4. Highlights bullet list.
5. Day-by-day itinerary: "DAY n: title", paragraph, Meals line, Overnight line.
6. Included / Excluded lists.
7. Booking form: nationality, hotel class (3-5 stars), currency (EUR/USD), contact fields.
8. FAQ accordion.
9. Related tours (3).
10. Terms and conditions modal.

### 3.6 FAQ
Five groups: General (11), Payments (2), Travel Tips (8), Turkey FAQ (6), Clarification text. Expandable sections. Covers customization, booking timeline, family and solo travel, hotel upgrades, electrical standards, photography rules, currencies, safety, ATMs, driving permits, mobile phones, museum hours.

### 3.7 Blog
Organized by destination category (Turkey, Greece, Egypt, Jordan, Morocco, Israel) plus "Planning Your Trip". Index shows category cards with a 680x450 photo. No pagination or sidebar detail verified.

### 3.8 Contact
"Have a Question?" form with a GDPR checkbox, the contact methods and address, business registration block, abbreviated Terms and Conditions, social links, newsletter.

### 3.9 Videos
Five YouTube cards: "10 Best Tourist Places to Visit in" Morocco, Turkey, Jordan, Greece, Egypt.

## 4. Verified content (tour data)

All prices are "from" prices per person in EUR, taxes included.

### Multi-country packages
| Package | Duration | Route | From |
|---|---|---|---|
| Turkey and Greece | 8-18 days | Istanbul, Cappadocia, Pamukkale, Ephesus, Rhodes, Crete, Santorini, Mykonos, Athens, Delphi | 1,990 |
| Turkey and Egypt | 8-15 days | Istanbul, Cappadocia, Pamukkale, Ephesus, Cairo, Aswan, Nile cruise, Luxor, Abu Simbel | 1,950 |
| Turkey and Jordan | 8-14 days | Istanbul, Cappadocia, Pamukkale, Ephesus, Amman, Petra, Wadi Rum, Aqaba, Dead Sea | 1,995 |
| Greece and Egypt | 8-15 days | Athens, Mykonos, Santorini, Delphi, Cairo, Aswan, Nile cruise, Luxor, Alexandria | 1,995 |
| Turkey, Greece, Egypt and Jordan | 7-26 days | Istanbul, Cappadocia, Pamukkale, Ephesus, Santorini, Mykonos, Athens, Cairo, Aswan, Luxor, Amman, Petra, Wadi Rum | 2,295 |
| Greece and Jordan | 8-14 days | Athens, Mykonos, Santorini, Amman, Petra, Jerash, Aqaba, Wadi Rum | 2,225 |
| Egypt, Jordan and Israel | not verified | not verified | not verified |
| Turkey, Greece and Egypt | listed in nav | not verified | not verified |

### Featured single tours
| Tour | Nights/Days | Route | From | Format |
|---|---|---|---|---|
| 8-Day Turkey Express: Istanbul to Ephesus | 7/8 | Istanbul, Cappadocia, Pamukkale, Ephesus | 1,575 | Small group or private |
| 4-Day Turkey Express: Three Iconic Regions | 3/4 | Cappadocia, Pamukkale, Ephesus | 1,045 | Small group or private |
| 8-Day Best of Greece: Athens, Mykonos and Santorini | 7/8 | Athens, Mykonos, Santorini | 1,795 | Small group or private |
| 8-Day Best of Egypt: Cairo, Nile and Abu Simbel | 7/8 | Cairo, Aswan, Luxor, Abu Simbel | 1,795 | Private |
| 11-Day Cyclades Cruise and Island Journey | 10/11 | Athens, Mykonos, Naxos, Paros, Santorini | 2,495 | not verified |
| 7-Day Classic Jordan: Petra, Wadi Rum and Dead Sea | 6/7 | Amman, Petra, Dead Sea, Jerash, Wadi Rum | 1,275 | Private |

Full itineraries, inclusions, exclusions and FAQs were captured for the Turkey 8-day, Greece 8-day, Egypt 8-day and Jordan 7-day tours and are the basis for the data files. The 4-day Turkey and 11-day Cyclades tours were not read in detail; their day-by-day content must be written from the route and stated as drafted copy for owner review.

### Home page reviews (TripAdvisor)
Gui B. (07-06-2026), Lorelle W (01-06-2026), Gurdeep S (17-05-2026). Excerpts only; full text is on TripAdvisor.

### Policies
- Payment: 50% deposit at confirmation, 50% balance 15 days before arrival.
- Individual cancellation: 31+ days, EUR 100 fee; 30-21 days, 35%; 20-14 days, 60%; 13 days or fewer or no-show, 100%.
- Group (8+ travelers): 75+ days, EUR 100; 74-60, 25%; 59-40, 50%; 39-25, 75%; 24 or fewer, 100%.
- Greece and Turkey cruise: 60-31 days, 25%; 30-16, 50%; 15 or fewer, 100%.
- Domestic flights and ferries are non-refundable once issued.
- Passport valid 6+ months. Travel insurance strongly recommended, not sold.
- Not included: tips, taxes, airport and city taxes, beverages, optional activities, visa fees, personal expenses.

## 5. Reference designs supplied by the owner (`references/`)

| File | What it defines |
|---|---|
| `SAYFA YAPISI.png` | Page-type table with required content and schema.org types: Home (WebSite + TravelAgency/Organization + WebPage), Country/combo (CollectionPage + ItemList + BreadcrumbList), Single tour (TouristTrip + Offer + WebPage + BreadcrumbList), Travel Hub (Blog/CollectionPage), Blog post (Article/BlogPosting + BreadcrumbList), About/Contact (AboutPage/ContactPage + correct organisation identity). |
| `web- Tasarım.png` | Chosen home layout: header with Plan My Trip button, hero over Istanbul photo, search bar (Destination, Travel Style, Duration), trust row, "Travel Deeper with People Who Know", destinations (6), featured journeys (3), From the Travel Hub (3), verified guest reviews. |
| `Yeni tasarım.png` | Ornate variant (tile borders, ornamental newsletter band). Treated as an optional flourish, not the baseline. |
| `Website Genel tasarım.png` | First direction: nav Destinations, Tour Styles, Multi-Country Tours, About, Travel Guides, Contact; trust strip; destination tiles; "Ways to Travel"; featured tours; closing quote CTA with WhatsApp. |
| `Seçenek-1.png`, `Single Tour page.png` | Tour detail: breadcrumb, split hero, trust strip, tab bar (Overview, Itinerary, Inclusions, Trip Requirements, FAQs, Reviews), sticky "Plan Your Trip" box, trip at a glance, day accordion, inclusions/exclusions, FAQ, TripAdvisor review band, related tours, closing CTA. |
| `Tours Landing pages.png` | Tours listing: banner, breadcrumb, filter bar (Destination, Travel Style, Duration, Reset, count), country tabs, three-column card grid, trust strip, multi-country cross-sell. |
| `Travel Hub.png` | Blog hub: search, topic pills (Turkey, Greece, Egypt, Jordan, Morocco, Travel Planning, Cultural Experiences, Food and Cuisine), featured article, 6-card grid with related tours, newsletter. |
| `hero bg.png` | Istanbul skyline hero photo (2000 px wide), used as the home hero. |

Visual language from the references: navy (#0F2D4A range) and bronze-gold (#B07D2E range) on warm off-white, high-contrast serif display type, rounded 6-8 px corners, photography-led cards, thin hairline cards, light theme only.

## 6. Gaps between the live site and the references

1. The live site is a conversion funnel to a booking form with price; the references switch to a quote-request funnel ("Request a Personalized Quote", "Plan My Trip", WhatsApp). The new build follows the references: no online payment, price shown as "from".
2. Live navigation (Home, About, Destinations, Combo Tours, FAQ, Blog, Contact) differs from the reference navigation. The reference navigation wins.
3. The references add pages the live site lacks: Tour Styles (Private, Small Group), Travel Hub with topic filters, Trip Requirements panel, tabs on tour pages, a search-style filter bar.
4. The live Morocco and Israel country pages and several combos were not crawled. The new site must either launch them as thinner pages with clearly drafted copy or defer them. See the plan.
5. Contact email address is not recoverable from the crawl (obfuscated). Needs the owner.
