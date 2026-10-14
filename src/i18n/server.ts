import { lang } from 'next/root-params';
import { defaultLocale, hasLocale, type Locale } from './config';
import { getDictionary, type Dictionary } from './dictionaries';

/** The language of the current page, for server components. Client components use `useLocale()`. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return hasLocale(value) ? value : defaultLocale;
}

/** The UI text of the current page's language, for server components. */
export async function getDictionaryForPage(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}
