/**
 * The three languages of the site. The URL prefix is the old sites' prefix (docs/project-plan.md D1): English `/en/`,
 * Traditional Chinese `/zh/`, Japanese `/jp/`. `htmlLang` is the BCP 47 tag used for the `lang` attribute, hreflang
 * and structured data.
 */
export const locales = ['en', 'zh', 'jp'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const htmlLang: Record<Locale, string> = { en: 'en', zh: 'zh-Hant', jp: 'ja' };

/** Name of each language written in that language, for the language switcher. */
export const localeNames: Record<Locale, string> = { en: 'English', zh: '繁體中文', jp: '日本語' };

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
