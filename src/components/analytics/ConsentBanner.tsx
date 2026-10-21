'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Link } from '@/i18n/link';
import { consentStorageKey, isConsentRegion, type ConsentChoice } from '@/lib/analytics/consent';

export type ConsentText = { title: string; body: string; accept: string; reject: string; privacy: string };

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

function remember(choice: ConsentChoice) {
  try {
    localStorage.setItem(consentStorageKey, choice);
  } catch {
    // Private browsing: the choice then only lasts for this visit.
  }
  (window as GtagWindow).gtag?.('consent', 'update', { analytics_storage: choice });
}

/**
 * The cookie notice. Only visitors in the countries listed in `src/lib/analytics/consent.ts` see it, and only until they choose;
 * everywhere else it never appears and measurement is already on. The country comes from `/api/region`.
 */
export function ConsentBanner({ text, privacyHref }: { text: ConsentText; privacyHref: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      if (localStorage.getItem(consentStorageKey)) {
        return;
      }
    } catch {
      // Storage is blocked: ask anyway when the visitor is in a region that needs it.
    }
    fetch('/api/region/', { cache: 'no-store' })
      .then((res) => (res.ok ? (res.json() as Promise<{ country?: string }>) : null))
      .then((data) => {
        if (!cancelled && data && isConsentRegion(data.country)) {
          setVisible(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) {
    return null;
  }
  const choose = (choice: ConsentChoice) => {
    remember(choice);
    setVisible(false);
  };
  return (
    <section
      role="dialog"
      aria-labelledby="consent-title"
      className="border-navy-900/15 shadow-lift fixed right-4 bottom-4 left-4 z-50 max-w-md rounded-lg border bg-white p-5 md:right-auto md:bottom-6 md:left-6">
      <h2 id="consent-title" className="text-navy-900 mb-2 text-base font-semibold">
        {text.title}
      </h2>
      <p className="text-navy-900/80 mb-4 text-sm leading-relaxed">
        {text.body}{' '}
        <Link href={privacyHref} className="underline">
          {text.privacy}
        </Link>
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="md" onClick={() => choose('granted')}>
          {text.accept}
        </Button>
        <Button size="md" variant="secondary" onClick={() => choose('denied')}>
          {text.reject}
        </Button>
      </div>
    </section>
  );
}
