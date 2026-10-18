import type { Dictionary } from '@/i18n/dictionaries';
import type { BrowserText } from './ToursBrowser';

/** The words of the tour filters for a language, with the names of the given countries, ready to hand to the client component. */
export const browserText = ({ ui, countries }: Dictionary, ids: string[]): BrowserText => ({
  ...ui.browser,
  countries: ids.map((id) => ({ id, name: countries[id as keyof typeof countries]?.name ?? id })),
});
