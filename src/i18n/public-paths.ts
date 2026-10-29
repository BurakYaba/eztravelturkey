import type { Locale } from './config';

/**
 * The site keeps the addresses of the old eztravelturkey.com pages (docs/project-plan.md D1, Ek B), and some differ from the names
 * the code uses: the About page is `/zh/about-us/`. The code writes every link and looks up every page with the "logical" address
 * (`/about`); these tables translate it to the public address and back.
 */

/** Name of the destinations folder in the public address and in the CMS paths. */
export const destinationsRoot: Record<Locale, string> = { zh: 'destinations' };

/** Pages written in code that have a different public address. Keys and values have no slashes at the ends. */
const pageNames: Record<Locale, Record<string, string>> = {
  zh: { about: 'about-us' },
};

/** Country folders that are not named `<country>-tours`, by the folder name in code. None on this site. */
const countryFolders: Record<Locale, Record<string, string>> = {
  zh: {},
};

/**
 * `/about` becomes `/about-us`. Addresses that are already public (a CMS path such as `/destinations/turkey-tours/`) and
 * everything else stay as they are.
 */
export function publicPath(lang: Locale, path: string): string {
  const parts = path.split('/');
  const first = parts[1] ?? '';
  const name = pageNames[lang][first];
  return name ? ['', name, ...parts.slice(2)].join('/') : path;
}

/** The CMS path of a page asked for by its logical path: `about` is stored as `about-us`. Paths with no alias are returned unchanged. */
export function cmsPath(lang: Locale, path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return publicPath(lang, `/${trimmed}`).replace(/^\/+/, '');
}

/** The folder of a country under the destinations hub: `turkey-tours`. */
export const countryFolder = (lang: Locale, id: string): string => countryFolders[lang][`${id}-tours`] ?? `${id}-tours`;

/**
 * The page that lists the multi-country trips. The old site had no multi-country listing, only the "combination tours" page that
 * holds the tours, so every link goes there and `/multi-country-tours` redirects to it (src/proxy.ts). Written as a logical
 * address, like every link of the code.
 */
const combinationFolder: Record<Locale, string> = { zh: 'combination-tours' };
export const multiCountryHref = (lang: Locale): string => `/destinations/${combinationFolder[lang]}`;

/** The code's address of a page, from its public address (`/about-us` is `/about`). Other addresses are returned unchanged. */
export function logicalPath(lang: Locale, path: string): string {
  const parts = path.split('/');
  const first = parts[1] ?? '';
  const code = Object.entries(pageNames[lang]).find(([, name]) => name === first)?.[0];
  return code ? ['', code, ...parts.slice(2)].join('/') : path;
}

/** Address of the terms and privacy pages (they sit at the root, as on the old site). */
export const legalHref = (lang: Locale, page: 'terms' | 'privacy'): string =>
  ({
    zh: { terms: '/terms-condition', privacy: '/privacy-policy' },
  })[lang][page];

/** Route parameters with Chinese letters may arrive percent-encoded; the CMS paths are plain text. */
export const decodeSegments = (segments: string[]): string[] =>
  segments.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
