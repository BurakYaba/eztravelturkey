'use client';

import Script from 'next/script';
import { site } from '@/data/site';
import type { Locale } from '@/i18n/config';

declare global {
  interface Window {
    /** Set by Tripadvisor's embed script: draws every badge that registered itself. */
    taValidate?: () => void;
  }
}

/** Tripadvisor's own widget languages. */
const widgetLang: Record<Locale, string> = { en: 'en_US', zh: 'zh_TW', jp: 'ja' };

/**
 * Tripadvisor's official ratings badge, the same widget (location 5617607) the live site shows in its footer. It is
 * the only place reviews appear: the old tour pages carried no reviews of their own (D22).
 *
 * The page loads fast because the script waits until everything else is done. Tripadvisor's embed code draws the badge
 * from `window.onload`, which has already fired by then, so it is asked to draw explicitly once it has loaded. If the
 * script is blocked, the plain link inside the box stays.
 */
export function TripadvisorBadge({ lang, label }: { lang: Locale; label: string }) {
  return (
    <>
      <div id="TA_cdsratingsonlynarrow461" className="TA_cdsratingsonlynarrow">
        <ul className="TA_links">
          <li>
            <a
              href={site.tripadvisorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/75 transition hover:text-white">
              {label}
            </a>
          </li>
        </ul>
      </div>
      <Script
        id="tripadvisor-widget"
        src={`https://www.tripadvisor.com/WidgetEmbed-cdsratingsonlynarrow?border=true&locationId=5617607&display_version=2&uniq=461&lang=${widgetLang[lang]}`}
        strategy="lazyOnload"
        onLoad={() => window.taValidate?.()}
      />
    </>
  );
}
