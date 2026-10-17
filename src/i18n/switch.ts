import { hasLocale, type Locale } from './config';
import { localizeHref, stripLocale } from './paths';
import { logicalPath } from './public-paths';

/** Pages every language has under the same address (the shared site chrome). */
const sharedPaths = new Set([
  '/',
  '/destinations',
  '/tours',
  '/multi-country-tours',
  '/private-tours',
  '/small-group-tours',
  '/plan-my-trip',
  '/blog',
  '/about',
  '/contact',
  '/faq',
  '/search',
]);

/** Pages that have a counterpart in every language when the CMS does not say otherwise (the shared site chrome). */
export type Alternates = Record<string, Partial<Record<Locale, string>>>;

/**
 * Where the language switcher sends a visitor: the same page in the other language when it has one (the pages carry a shared
 * `translationGroup`, tours are matched in P5.4), and that language's destinations hub when it does not
 * (docs/project-plan.md D11).
 */
export function switchLocaleHref(to: Locale, from: Locale, pathname: string, alternates: Alternates = {}): string {
  const path = safeDecode(stripLocale(pathname));
  const alt = alternates[`${from}:${path}`]?.[to];
  if (alt) {
    return `/${to}${alt === '/' ? '' : alt}/`;
  }
  const logical = logicalPath(from, path);
  return localizeHref(to, sharedPaths.has(logical) ? logical : '/destinations');
}

function safeDecode(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export const localeFromPathname = (pathname: string): Locale | null => {
  const first = pathname.split('/')[1] ?? '';
  return hasLocale(first) ? first : null;
};
