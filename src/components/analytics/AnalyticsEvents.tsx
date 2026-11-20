'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/analytics/track';

const toursSections = ['multi-country-tours', 'private-tours', 'small-group-tours'];

/** Which part of the site a path belongs to, for Google Analytics' content grouping. */
function contentGroup(path: string, toursRoot: string): string {
  const section = decodeURIComponent(path.split('/')[2] ?? '');
  if (section === '') {
    return 'home';
  }
  if (section === 'blog' || section === 'authors') {
    return 'blog';
  }
  return section === toursRoot || toursSections.includes(section) ? 'tours' : 'other';
}

/** A link from a blog post (not the blog index) to a tour or destination page. `toursRoot` is the destinations section of the language. */
function isBlogToTour(from: string, to: string, toursRoot: string): boolean {
  const fromParts = decodeURIComponent(from).split('/').filter(Boolean);
  const toParts = decodeURIComponent(to).split('/').filter(Boolean);
  return (
    fromParts[1] === 'blog' &&
    fromParts.length > 2 &&
    (toParts[1] === toursRoot || toursSections.includes(toParts[1] ?? ''))
  );
}

/**
 * Where on the page the link sits. A block that wants to be told apart carries `data-track-placement` (the blog post's text:
 * `body`, the tour cards under it: `related_tours`); otherwise it is the header (`nav`), the footer, or `other`.
 */
function placementOf(link: Element): string {
  const marked = link.closest('[data-track-placement]')?.getAttribute('data-track-placement');
  if (marked) {
    return marked;
  }
  if (link.closest('header')) {
    return 'nav';
  }
  return link.closest('footer') ? 'footer' : 'other';
}

/**
 * Sends the page and click events to Google Tag Manager (src/lib/analytics/track.ts). One listener on the page catches every
 * WhatsApp, telephone and email link, so a link added later is counted without any extra code.
 */
export function AnalyticsEvents({ lang, toursRoot }: { lang: string; toursRoot: string }) {
  const pathname = usePathname();

  useEffect(() => {
    track('page_context', { lang, content_group: contentGroup(pathname, toursRoot), page_path: pathname });
  }, [pathname, lang, toursRoot]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a');
      const href = link?.getAttribute('href') ?? '';
      if (href.startsWith('tel:')) {
        track('phone_click', { lang, page_path: window.location.pathname });
      } else if (href.startsWith('mailto:')) {
        track('email_click', { lang, page_path: window.location.pathname });
      } else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//.test(href)) {
        track('whatsapp_click', { lang, page_path: window.location.pathname });
      } else if (href.includes('/plan-my-trip')) {
        track('cta_click', { lang, cta: 'plan_my_trip', page_path: window.location.pathname });
      } else if (link && isBlogToTour(window.location.pathname, link.pathname, toursRoot)) {
        // A reader of a blog post went on to a tour or destination page: from which post, to which page, from which part of the page.
        track('blog_tour_click', {
          lang,
          from_path: decodeURIComponent(window.location.pathname),
          to_path: link.pathname,
          placement: placementOf(link),
        });
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [lang, toursRoot]);

  return null;
}
