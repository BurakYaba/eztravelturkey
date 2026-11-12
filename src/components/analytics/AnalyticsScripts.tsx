import Script from 'next/script';
import { consentDefaultScript } from '@/lib/analytics/consent';
import { GtmLoader } from './GtmLoader';

/**
 * Google Tag Manager with Consent Mode v2 (docs/project-plan.md P8.5). Renders nothing until `NEXT_PUBLIC_GTM_ID` is set, so
 * a preview or a local copy never sends measurements. The consent defaults must run before the container, hence
 * `beforeInteractive`. The container itself is loaded by `GtmLoader`, after the largest paint has settled.
 */
export function AnalyticsScripts() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) {
    return null;
  }
  return (
    <>
      <Script
        id="consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: consentDefaultScript }}
      />
      <GtmLoader id={gtmId} />
    </>
  );
}
