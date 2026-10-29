/**
 * The one language of the site: Traditional Chinese, under the `/zh/` prefix the old eztravelturkey.com used (its addresses are
 * kept). `htmlLang` is the BCP 47 tag used for the `lang` attribute, hreflang and structured data. The code still carries the
 * language as a parameter (routes are `/[lang]/...`), so a second language could be added later by extending this list.
 */
export const locales = ['zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export const htmlLang: Record<Locale, string> = { zh: 'zh-Hant' };

/** Name of each language written in that language. */
export const localeNames: Record<Locale, string> = { zh: '繁體中文' };

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
