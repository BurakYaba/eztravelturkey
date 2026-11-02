import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, hasLocale, htmlLang, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { logicalPath } from '@/i18n/public-paths';
import { site } from '@/data/site';
import { isGone } from '@/lib/gone';
import { oldBlogRedirect } from '@/lib/old-blog';
import { simplifiedChineseRedirect, simplifiedChineseSite } from '@/lib/old-cn';
import { oldZhRedirect } from '@/lib/old-zh';

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** A small standalone 410 page: no layout, no scripts, not indexable. */
function gone(lang: Locale) {
  const { gone: t, notFound } = getDictionary(lang);
  const html = `<!doctype html><html lang="${htmlLang[lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(t.title)}</title><style>body{font-family:system-ui,sans-serif;max-width:36rem;margin:12vh auto;padding:0 1.25rem;color:#1b2b3c;line-height:1.6}h1{color:#0f2d4a}a{color:#0f2d4a}</style></head><body><h1>${escapeHtml(t.title)}</h1><p>${escapeHtml(t.text)}</p><p><a href="/${lang}/tours/">${escapeHtml(notFound.tours)}</a> &middot; <a href="/${lang}/">${escapeHtml(notFound.home)}</a></p></body></html>`;
  return new NextResponse(html, {
    status: 410,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' },
  });
}

/**
 * The site has one language, Traditional Chinese, under the `/zh/` prefix of the old eztravelturkey.com (its addresses are kept).
 * Every path without the prefix is sent there with a permanent redirect (`/` becomes `/zh/`; the old WordPress blog's
 * `/blog/<post>/` becomes `/zh/blog/<post>/`), and addresses that are gone for good answer 410.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get('host') ?? '').toLowerCase().replace(/:\d+$/, '');

  // The old WordPress blog lived at eztravelturkey.com/blog/ (on the bare domain): one redirect straight to the new address.
  const blogTarget = oldBlogRedirect(pathname);
  if (blogTarget) {
    return NextResponse.redirect(new URL(blogTarget, site.url), 301);
  }

  // One address for the site: the bare domain goes to the www one; the production alias of Vercel does too, but only once
  // the real domain is live (`REDIRECT_VERCEL_ALIAS=1`), so the previews and the Studio keep working until then.
  if (
    host === new URL(site.url).host.replace(/^www\./, '') ||
    (host === 'eztravelturkey.vercel.app' && process.env.REDIRECT_VERCEL_ALIAS === '1')
  ) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, site.url), 301);
  }

  const first = pathname.split('/')[1] ?? '';
  // The old Simplified Chinese pages (/cn/...) moved to magnificenttravel.com. An address the old site never had is a 404.
  if (first === 'cn') {
    const target = simplifiedChineseRedirect(pathname);
    return target
      ? NextResponse.redirect(new URL(target, simplifiedChineseSite), 301)
      : NextResponse.rewrite(new URL(`/${defaultLocale}/__not-found__/`, request.url));
  }
  if (isGone(pathname)) {
    return gone(defaultLocale);
  }
  if (hasLocale(first)) {
    // Old /zh/ addresses that are no pages any more (the tabs of a tour page and the like) go to the page that holds the content.
    // The redirect stays on the host of the request, so a preview keeps working.
    const oldTarget = oldZhRedirect(pathname);
    if (oldTarget) {
      const url = request.nextUrl.clone();
      url.pathname = oldTarget;
      return NextResponse.redirect(url, 301);
    }
    // The pages keep their old addresses (/zh/about-us/); the routes know them by the code's names, so the request is served by
    // that route while the visitor's address stays as it is.
    let body = pathname.slice(first.length + 1) || '/';
    try {
      body = decodeURIComponent(body);
    } catch {
      // an address that is not valid UTF-8 simply is not an alias
    }
    const logical = logicalPath(first, body);
    if (logical !== body) {
      const url = request.nextUrl.clone();
      url.pathname = `/${first}${logical}`;
      return NextResponse.rewrite(url);
    }
    return;
  }
  // The languages the old eztravelturkey.com mirrored (/en/, /jp/) are not part of this site: a real 404.
  if (first === 'en' || first === 'jp') {
    return NextResponse.rewrite(new URL(`/${defaultLocale}/__not-found__/`, request.url));
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '/' : pathname}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Skip the API, Next internals and any path with a file extension (robots.txt, sitemap.xml, icons, images).
  matcher: ['/((?!api|_next|.*[.].*).*)'],
};
