/**
 * The three languages of the site. The URL prefix is the old sites' prefix (docs/project-plan.md D1): English `/en/`,
 * Simplified Chinese `/cn/`, Japanese `/jp/`. Traditional Chinese has its own site (eztravelturkey.com, see `externalLocales`). `htmlLang` is the BCP 47 tag used for the `lang` attribute, hreflang
 * and structured data.
 */
export const locales = ['en', 'cn', 'jp'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const htmlLang: Record<Locale, string> = { en: 'en', cn: 'zh-Hans', jp: 'ja' };

/** Name of each language written in that language, for the language switcher. */
export const localeNames: Record<Locale, string> = { en: 'English', cn: '简体中文', jp: '日本語' };

/**
 * Languages that live on another site. The language menu links to them; they are not routes of this site. Traditional
 * Chinese moved to eztravelturkey.com on 2026-10-19 (the client's decision), where it keeps its old `/zh/` addresses.
 */
export const externalLocales = [{ name: '繁體中文', lang: 'zh-Hant', href: 'https://www.eztravelturkey.com/zh/' }] as const;

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
