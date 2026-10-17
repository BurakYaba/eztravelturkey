'use client';

import { useEffect } from 'react';

/**
 * Chinese and Japanese pages draw their text with Noto fonts, whose stylesheets together weigh about 1 MB. Put in the
 * layout they would be part of the first, render-blocking CSS of every page, English ones included (measured: the LCP
 * of the English home page waited about 1.6 s for them). Loaded from here, in the browser and only for these two
 * languages, they cost the other pages nothing; zh and jp text first shows in the system's own CJK font and switches
 * when the web font has arrived (`display: swap`, as it did before).
 */
export function CjkFonts({ lang }: { lang: 'zh' | 'jp' }) {
  useEffect(() => {
    let cancelled = false;
    const load = lang === 'zh' ? import('./zh') : import('./jp');
    load.then(({ fontClasses }) => {
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
