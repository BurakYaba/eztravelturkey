import type { Locale } from './config';

/**
 * The Chinese and Japanese sites keep the addresses of their old pages (docs/project-plan.md D1, Ek B), which differ from the
 * English ones: the Japanese hub is `/jp/目的地/`, the Chinese About page `/zh/about-us/`. The code writes every link and looks
 * up every page with the English ("logical") address; these tables translate it to the public address and back.
 */

/** Name of the destinations folder in the public address and in the CMS paths. */
export const destinationsRoot: Record<Locale, string> = { en: 'destinations', zh: 'destinations', jp: '目的地' };

/** Pages written in code that have a different public address in some language. Keys and values have no slashes at the ends. */
const pageNames: Record<Locale, Record<string, string>> = {
  en: {},
  zh: { about: 'about-us' },
  jp: { about: '会社概要', contact: '問い合わせ先' },
};

/** Country folders of the Japanese site, by the English folder name. */
const countryFolders: Record<Locale, Record<string, string>> = {
  en: {},
  zh: {},
  jp: {
    'turkey-tours': 'トルコツアー',
    'greece-tours': 'ギリシャツアー',
    'egypt-tours': 'エジプトツアー',
    'jordan-tours': 'ヨルダンツアー',
    'morocco-tours': 'モロッコツアー',
  },
};

/** The same, the other way round: Japanese folder name to the country id. */
export const countryIdOfFolder = (folder: string): string | undefined => {
  const english = Object.entries(countryFolders.jp).find(([, jp]) => jp === folder)?.[0];
  return (english ?? folder).replace(/-tours$/, '') || undefined;
};

/**
 * `/destinations/turkey-tours/x` becomes `/目的地/トルコツアー/x` in Japanese, `/about` becomes `/about-us` in Chinese.
 * Addresses that are already public (a CMS path such as `/目的地/トルコツアー/`) and everything else stay as they are.
 */
export function publicPath(lang: Locale, path: string): string {
  const parts = path.split('/');
  const first = parts[1] ?? '';
  if (first === 'destinations' && lang !== 'en') {
    const rest = parts.slice(2);
    if (rest[0]) rest[0] = countryFolders[lang][rest[0]] ?? rest[0];
    return ['', destinationsRoot[lang], ...rest].join('/');
  }
  const name = pageNames[lang][first];
  return name ? ['', name, ...parts.slice(2)].join('/') : path;
}

/**
 * The CMS path of a page asked for by its logical path: `destinations/turkey-tours/x` is `目的地/トルコツアー/x` in the
 * Japanese content, `about` is `会社概要`. Paths with no alias are returned unchanged.
 */
export function cmsPath(lang: Locale, path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return publicPath(lang, `/${trimmed}`).replace(/^\/+/, '');
}

/** The folder of a country under the destinations hub: `turkey-tours`, and `トルコツアー` on the Japanese site. */
export const countryFolder = (lang: Locale, id: string): string => countryFolders[lang][`${id}-tours`] ?? `${id}-tours`;

/** The English address of a page written in code, from its public address (`/about-us` in Chinese is `/about`). Other addresses are returned unchanged. */
export function logicalPath(lang: Locale, path: string): string {
  const parts = path.split('/');
  const first = parts[1] ?? '';
  const english = Object.entries(pageNames[lang]).find(([, name]) => name === first)?.[0];
  if (english) return ['', english, ...parts.slice(2)].join('/');
  return first === destinationsRoot[lang] && lang !== 'en' ? ['', 'destinations', ...parts.slice(2)].join('/') : path;
}

/** Address of the terms and privacy pages, which have a different place on each old site. */
export const legalHref = (lang: Locale, page: 'terms' | 'privacy'): string =>
  ({
    en: { terms: '/gdpr/terms-conditions', privacy: '/gdpr/privacy-policy' },
    zh: { terms: '/terms-condition', privacy: '/privacy-policy' },
    jp: { terms: '/利用規約およびキャンセルポリシー', privacy: '/プライバシーポリシー' },
  })[lang][page];

/** Route parameters with Chinese or Japanese letters may arrive percent-encoded; the CMS paths are plain text. */
export const decodeSegments = (segments: string[]): string[] =>
  segments.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
