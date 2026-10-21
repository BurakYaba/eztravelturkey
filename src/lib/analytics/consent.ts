/**
 * Consent Mode v2 and the cookie notice (docs/project-plan.md P8.5, decision of 2026-10-20): the notice is shown only to visitors
 * in the countries below; everywhere else measurement starts straight away and no notice appears. The site runs no advertising,
 * so the three advertising signals stay denied for everyone and the choice is only about analytics.
 */

/** European Union (27), the rest of the European Economic Area, the United Kingdom, Switzerland and Türkiye (ISO 3166-1 alpha-2). */
export const consentRegions = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'IS',
  'LI',
  'NO',
  'GB',
  'CH',
  'TR',
] as const;

/** Where the visitor's choice is kept in the browser. */
export const consentStorageKey = 'mt_consent';

export type ConsentChoice = 'granted' | 'denied';

export const isConsentRegion = (country: string | null | undefined): boolean =>
  Boolean(country) && (consentRegions as readonly string[]).includes(String(country).toUpperCase());

/**
 * The inline script that runs before Google Tag Manager loads: the default consent for each kind of visitor and, for someone
 * who already chose, that choice. Kept as plain text so it runs without waiting for the page's own code.
 */
export const consentDefaultScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500,region:${JSON.stringify(consentRegions)}});
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
try{var c=localStorage.getItem('${consentStorageKey}');if(c==='granted'||c==='denied'){gtag('consent','update',{analytics_storage:c})}}catch(e){}`;
