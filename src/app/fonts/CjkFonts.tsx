'use client';

import { useEffect } from 'react';

/**
 * The pages draw their Chinese text with Noto Sans TC and Noto Serif TC, whose stylesheets together weigh about 1 MB. Put in the
 * layout they would be part of the first, render-blocking CSS of every page. Loaded from here, in the browser, they cost the
 * first paint nothing; the text first shows in the system's own Chinese font and switches when the web font has arrived
 * (`display: swap`).
 *
 * In `next dev` the web fonts are not loaded: dev downloads every slice of both fonts at once, with a 3 second limit per request,
 * which times out in bursts and makes the first page take about 30 seconds. The system's Chinese font shows instead. The condition
 * is a build-time constant, so the compiler leaves `./zh` out of the dev build; production is unchanged.
 */
export function CjkFonts({ lang }: { lang: 'zh' }) {
  useEffect(() => {
    let cancelled = false;
    if (process.env.NODE_ENV !== 'development') {
      import('./zh').then(({ fontClasses }) => {
        if (!cancelled) {
          document.documentElement.classList.add(...fontClasses);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [lang]);
  return null;
}
