'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      language: string;
      theme: 'light';
      size: 'flexible';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Cloudflare's own codes for the three site languages. */
const widgetLanguage: Record<Locale, string> = { en: 'en', zh: 'zh-tw', jp: 'ja' };

type Props = {
  siteKey: string;
  lang: Locale;
  /** Called with a fresh token when the check passes, and with an empty string when the token expires. */
  onToken: (token: string) => void;
  /** Called when the check cannot run (script blocked, network). */
  onFail: () => void;
  /** Change this number to ask for a new check, for example after a rejected submission. */
  resetKey: number;
};

/**
 * Cloudflare Turnstile, the spam check on the enquiry forms. In its managed mode most visitors see nothing at all;
 * the box only appears when Cloudflare wants more proof. The token it returns is verified on the server.
 */
export function Turnstile({ siteKey, lang, onToken, onFail, resetKey }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  // The script may already be on the page from another form.
  useEffect(() => {
    if (window.turnstile) {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || !box.current || !window.turnstile) {
      return;
    }
    widget.current = window.turnstile.render(box.current, {
      sitekey: siteKey,
      language: widgetLanguage[lang],
      theme: 'light',
      size: 'flexible',
      callback: onToken,
      'expired-callback': () => onToken(''),
      'error-callback': onFail,
    });
    return () => {
      if (widget.current && window.turnstile) {
        window.turnstile.remove(widget.current);
      }
      widget.current = null;
    };
  }, [ready, siteKey, lang, onToken, onFail]);

  useEffect(() => {
    if (resetKey > 0 && widget.current && window.turnstile) {
      window.turnstile.reset(widget.current);
    }
  }, [resetKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={onFail}
      />
      <div ref={box} />
    </>
  );
}
