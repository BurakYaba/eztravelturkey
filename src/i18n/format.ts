import type { Locale } from './config';

const numberLocale: Record<Locale, string> = { en: 'en-US', zh: 'zh-TW', jp: 'ja-JP' };

/** 1450 and "EUR" become "€1,450", "US$1,450" or "￥..." according to the language, with no decimals. */
export function formatPrice(lang: Locale, amount: number, currency: 'EUR' | 'USD'): string {
  return new Intl.NumberFormat(numberLocale[lang], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** ISO date (2026-10-12) in the language's usual order, for example "October 12, 2026" or "2026年10月12日". */
export function formatDate(lang: Locale, iso: string): string {
  return new Intl.DateTimeFormat(numberLocale[lang], { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso));
}
