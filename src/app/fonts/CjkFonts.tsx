'use client';

import { useEffect } from 'react';

/** How long after the page has loaded the heading font is requested. See below. */
const DELAY_MS = 2500;

/**
 * The headings are drawn with Noto Serif TC; the body text uses the visitor's own Chinese font (PingFang TC, Microsoft JhengHei, Noto Sans
 * CJK TC), which needs no download. The serif font weighs about 1.3 MB on a page (a CJK font comes in slices), so it is not part of the
 * first paint or of the first seconds: it is requested a little after the page has loaded and the browser is idle. The headings first
 * show in the system's serif or sans Chinese font and switch when the web font has arrived (`display: swap`).
 *
 * Why not at once: PageSpeed Insights models a slow phone, and counts every request that starts before the hero picture has been
 * painted as part of the wait for it. With the fonts requested at hydration (about 1.5 s) the modelled LCP was about 20 s in some
 * runs and 3.6 s in others, only depending on which came first, measured 2026-11-07; the fonts were 2.4 MB then.
 *
 * In `next dev` the web font is not loaded: dev downloads every slice at once, with a 3 second limit per request, which times out in
 * bursts and makes the first page take about 30 seconds. The system's Chinese font shows instead. The condition is a build-time
 * constant, so the compiler leaves `./zh` out of the dev build; production is unchanged.
 */
export function CjkFonts({ lang }: { lang: 'zh' }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Importing the module is enough: it brings the stylesheet that declares the 'Noto Serif TC' face, which the heading font stack in
    // globals.css already names. A class on <html> would restyle the whole page; this only re-lays out the headings.
    const apply = () => {
      if (!cancelled) {
        void import('./zh');
      }
    };
    const schedule = () => {
      timer = setTimeout(() => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(apply, { timeout: 4000 });
        } else {
          apply();
        }
      }, DELAY_MS);
    };
    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }
    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [lang]);
  return null;
}
