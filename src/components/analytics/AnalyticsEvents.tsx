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
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [lang]);

  return null;
}
