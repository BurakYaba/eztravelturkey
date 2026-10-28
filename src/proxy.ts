import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales, hasLocale, htmlLang } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { localizeHref } from '@/i18n/paths';
import { logicalPath, multiCountryHref } from '@/i18n/public-paths';
import { site } from '@/data/site';
import { isGone } from '@/lib/gone';
import { japaneseRedirect, oldJapaneseHosts } from '@/lib/old-hosts';

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** A small standalone 410 page in the visitor's language: no layout, no scripts, not indexable. */
function gone(lang: (typeof locales)[number]) {
  const { gone: t, notFound } = getDictionary(lang);
  const html = `<!doctype html><html lang="${htmlLang[lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(t.title)}</title><style>body{font-family:system-ui,sans-serif;max-width:36rem;margin:12vh auto;padding:0 1.25rem;color:#1b2b3c;line-height:1.6}h1{color:#0f2d4a}a{color:#0f2d4a}</style></head><body><h1>${escapeHtml(t.title)}</h1><p>${escapeHtml(t.text)}</p><p><a href="/${lang}/tours/">${escapeHtml(notFound.tours)}</a> &middot; <a href="/${lang}/">${escapeHtml(notFound.home)}</a></p></body></html>`;
  return new NextResponse(html, {
    status: 410,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' },
  });
}

/**
 * Sends every path without a language prefix to the English site with a permanent redirect (`/` becomes `/en/`, like
 * the old site did), and answers 410 for addresses that are gone for good. No automatic language detection: it would
 * send crawlers and visitors away from the page they asked for (docs/project-plan.md P2.3, Ek H.4).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get('host') ?? '').toLowerCase().replace(/:\d+$/, '');

  // The old Japanese site: every address it had goes to its place on this site (P7.5). An address it never had is a 404 in
  // Japanese, not a page of this site under the old domain.
  if (oldJapaneseHosts.has(host)) {
    const target = japaneseRedirect(pathname);
    return target
      ? NextResponse.redirect(new URL(target, site.url), 301)
      : NextResponse.rewrite(new URL('/jp/__not-found__/', request.url));
  }
  // One address for the site (P7.10): the bare domain goes to the www one; the production alias of Vercel does too, but only once
  // the real domain is live (`REDIRECT_VERCEL_ALIAS=1`), so the previews and the Studio keep working until then.
  if (
    host === new URL(site.url).host.replace(/^www\./, '') ||
    (host === 'magnificenttravel.vercel.app' && process.env.REDIRECT_VERCEL_ALIAS === '1')
  ) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, site.url), 301);
  }

  const first = pathname.split('/')[1] ?? '';
  const prefixed = hasLocale(first);
  if (isGone(pathname)) {
    return gone(prefixed ? first : defaultLocale);
  }
  if (prefixed) {
    // The Chinese and Japanese pages keep their old addresses (/jp/目的地/, /zh/about-us/); the routes know them by their English
    // names, so the request is served by the English route while the visitor's address stays as it is.
    let body = pathname.slice(first.length + 1) || '/';
    try {
      body = decodeURIComponent(body);
    } catch {
      // an address that is not valid UTF-8 simply is not an alias
    }
    const logical = logicalPath(first, body);
    // The old Chinese and Japanese sites had no multi-country listing; their "combination tours" page is that page. A temporary redirect,
    // so the English structure can come back when those languages have combination pages of their own (multiCountryHref).
    if (first !== defaultLocale && logical.replace(/\/+$/, '') === '/multi-country-tours') {
      const target = request.nextUrl.clone();
      target.pathname = localizeHref(first, multiCountryHref(first));
      return NextResponse.redirect(target, 302);
    }
    if (logical !== body) {
      const url = request.nextUrl.clone();
      url.pathname = `/${first}${logical}`;
      return NextResponse.rewrite(url);
    }
    return;
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '/' : pathname}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Skip the API, Next internals and any path with a file extension (robots.txt, sitemap.xml, icons, images).
  matcher: ['/((?!api|_next|.*[.].*).*)'],
};
