import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales, hasLocale, htmlLang } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { isGone } from '@/lib/gone';

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
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1] ?? '';
  const prefixed = hasLocale(first);
  if (isGone(pathname)) {
    return gone(prefixed ? first : defaultLocale);
  }
  if (prefixed) {
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
