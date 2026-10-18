import { hasLocale, locales, type Locale } from './config';
import { publicPath } from './public-paths';

/** `/tours` and `/tours/` become `/en/tours/` (trailing slash, as on the old sites). Query and hash are kept. In Chinese and Japanese the address of a page that kept its old name is translated: `/about` is `/jp/会社概要/`. */
export function localizeHref(lang: Locale, href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) {
    return href;
  }
  const match = /^([^?#]*)(.*)$/.exec(href);
  const path = match?.[1] ?? href;
  const rest = match?.[2] ?? '';
  const first = path.split('/')[1] ?? '';
  const base = hasLocale(first) ? path : `/${lang}${path === '/' ? '' : publicPath(lang, path)}`;
  return `${base.endsWith('/') ? base : `${base}/`}${rest}`;
}

/** Path of a page for a language, as used in canonical URLs and the sitemap: `/en/tours/`. */
export const localePath = (lang: Locale, path = '/') => localizeHref(lang, path);

/** Removes the language prefix and the trailing slash: `/en/tours/` becomes `/tours`, `/en/` becomes `/`. */
export function stripLocale(pathname: string): string {
  const [, first = '', ...rest] = pathname.split('/');
  const body = hasLocale(first) ? `/${rest.join('/')}` : pathname;
  const trimmed = body.length > 1 ? body.replace(/\/+$/, '') : body;
  return trimmed === '' ? '/' : trimmed;
}

export const localePrefixes = locales.map((locale) => `/${locale}`);
