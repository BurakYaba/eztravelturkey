import { hasLocale, locales } from '@/i18n/config';
import { searchEntries } from '@/lib/data';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** The list the on-site search filters in the browser: one small JSON file per language, built with the site. */
export async function GET(_request: Request, context: RouteContext<'/[lang]/search-index.json'>) {
  const { lang } = await context.params;
  if (!hasLocale(lang)) {
    return new Response('Not found', { status: 404 });
  }
  return Response.json(searchEntries(lang));
}
