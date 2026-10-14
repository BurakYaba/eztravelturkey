import { hasLocale, type Locale } from './config';
import { stripLocale } from './paths';

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

/**
 * Where the language switcher sends a visitor: the same page in the other language when that page exists there, and
 * that language's destinations hub when it does not (docs/project-plan.md D11). Tours, categories and posts differ
 * between the languages, so they only get a counterpart once the zh and jp content is matched (P5).
 */
export function switchLocaleHref(to: Locale, pathname: string): string {
  const path = stripLocale(pathname);
  const target = sharedPaths.has(path) ? path : '/destinations';
  return `/${to}${target === '/' ? '' : target}/`;
}

export const localeFromPathname = (pathname: string): Locale | null => {
  const first = pathname.split('/')[1] ?? '';
  return hasLocale(first) ? first : null;
};
