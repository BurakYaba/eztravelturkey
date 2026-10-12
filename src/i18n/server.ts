import { lang } from 'next/root-params';
import { defaultLocale, hasLocale, type Locale } from './config';

/** The language of the current page, for server components. Client components use `useLocale()`. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return hasLocale(value) ? value : defaultLocale;
}
