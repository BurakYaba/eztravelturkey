import Script from 'next/script';
import { consentDefaultScript } from '@/lib/analytics/consent';

/**
 * Google Tag Manager with Consent Mode v2 (docs/project-plan.md P8.5). Renders nothing until `NEXT_PUBLIC_GTM_ID` is set, so
 * a preview or a local copy never sends measurements. The consent defaults must run before the container, hence
 * `beforeInteractive`. The container itself loads once the page has loaded and the browser is idle (`lazyOnload`): its two scripts
 * (gtm.js and gtag.js) are about 300 KB, and PageSpeed counted them against the largest paint when they loaded at hydration
 * (measured 2026-11-12). Events pushed to `dataLayer` before it arrives are queued by Tag Manager, so nothing is lost except a visit
 * that ends before the page has finished loading.
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
      <Script
        id="gtm"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
        }}
      />
    </>
  );
}
