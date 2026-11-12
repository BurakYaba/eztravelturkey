'use client';

import { useEffect } from 'react';
import { afterLargestPaint } from '@/lib/after-paint';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Loads the Google Tag Manager container (the standard snippet, written out) once the largest paint has settled, 1 s after the last
 * candidate and at the latest 6 s after the page has loaded. gtm.js and the gtag.js it brings are about 300 KB; PageSpeed counted them
 * against the largest paint when they loaded at hydration (measured 2026-11-12). Events pushed to `dataLayer` before the container
 * arrives are queued by Tag Manager and processed when it starts, so only a visit that ends before then is not measured.
 */
export function GtmLoader({ id }: { id: string }) {
  useEffect(
    () =>
      afterLargestPaint(
        () => {
          window.dataLayer = window.dataLayer ?? [];
          window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
          document.head.appendChild(script);
        },
        1000,
        6000,
      ),
    [id],
  );
  return null;
}
