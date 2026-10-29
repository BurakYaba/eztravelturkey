'use client';

import { useEffect } from 'react';

/**
 * The pages draw their Chinese text with Noto Sans TC and Noto Serif TC, whose stylesheets together weigh about 1 MB. Put in the
 * layout they would be part of the first, render-blocking CSS of every page. Loaded from here, in the browser, they cost the
 * first paint nothing; the text first shows in the system's own Chinese font and switches when the web font has arrived
 * (`display: swap`).
 */
export function CjkFonts({ lang }: { lang: 'zh' }) {
  useEffect(() => {
    let cancelled = false;
    import('./zh').then(({ fontClasses }) => {
      if (!cancelled) {
        document.documentElement.classList.add(...fontClasses);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);
  return null;
}
