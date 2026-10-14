// URL classification for the inventory. The English tree is fully known (docs/project-plan.md Ek A.2). The zh and jp
// trees differ per language (Ek A.3), so they are classified by shape only here and by the real parsers in P5.

export const EN_COUNTRIES = new Set([
  'turkey-tours',
  'greece-tours',
  'egypt-tours',
  'jordan-tours',
  'morocco-tours',
  'israel-tours',
]);

export const EN_CATEGORIES = new Set([
  '03-to-05-days-tours',
  '06-to-09-days-tours',
  '10-to-14-days-tours',
  '15-days-and-longer',
  'istanbul-travel-packages',
  'adventure-activities',
  'greece-travel-packages',
  'greece-cruise-packages',
  'day-tours-in-greece',
  'greece-escorted-tours',
]);

// Tabs that the zh and jp sites expose as separate URLs under every tour.
const SUBPAGES = new Set(['tour-itinerary', 'inclusion-rate', 'review', 'reviews', 'itinerary']);

export function segments(url) {
  const { pathname } = new URL(url);
  return pathname.split('/').filter(Boolean).map(decodeURIComponent);
}

export function classifyEnglish(url) {
  const parts = segments(url);
  if (parts.length <= 1) {
    return { kind: 'home', depth: 0, israel: false };
  }
  const [, section, ...rest] = parts;
  const israel = parts.some((p) => p.includes('israel'));
  if (section === 'blog') {
    if (rest.length === 0) return { kind: 'blog-hub', depth: 1, israel };
    if (rest.length === 1) return { kind: 'blog-category', depth: 2, israel };
    return { kind: 'blog-post', depth: 3, israel };
  }
  if (section === 'destinations') {
    if (rest.length === 0) return { kind: 'destinations-hub', depth: 1, israel };
    const first = rest[0];
    if (rest.length === 1) {
      return { kind: EN_COUNTRIES.has(first) ? 'country' : 'combo', depth: 2, israel };
    }
    if (rest.length === 2 && EN_CATEGORIES.has(rest[1])) {
      return { kind: 'category', depth: 3, israel };
    }
    return { kind: 'tour', depth: parts.length, israel };
  }
  if (section === 'authors') return { kind: 'author', depth: 2, israel };
  return { kind: 'static', depth: parts.length, israel };
}

export function classifyGeneric(url, locales) {
  const parts = segments(url);
  const locale = locales.includes(parts[0]) ? parts[0] : '';
  const last = parts[parts.length - 1] ?? '';
  const subpage = SUBPAGES.has(last);
  const body = locale ? parts.slice(1) : parts;
  return {
    kind: parts.length === 0 || (locale && body.length === 0) ? 'home' : subpage ? 'tour-subpage' : 'page',
    locale,
    depth: body.length,
    subpage,
    israel: parts.some((p) => p.toLowerCase().includes('israel')),
  };
}

export function classify(site, url) {
  if (site.id === 'en') {
    return { locale: 'en', subpage: false, ...classifyEnglish(url) };
  }
  return classifyGeneric(url, site.locales);
}
