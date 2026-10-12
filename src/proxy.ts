import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/i18n/config';

/**
 * Sends every path without a language prefix to the English site with a permanent redirect (`/` becomes `/en/`, like
 * the old site did). No automatic language detection: it would send crawlers and visitors away from the page they asked
 * for (docs/project-plan.md P2.3, Ek H.4).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocale) {
    return;
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '/' : pathname}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Skip the API, Next internals and any path with a file extension (robots.txt, sitemap.xml, icons, images).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
