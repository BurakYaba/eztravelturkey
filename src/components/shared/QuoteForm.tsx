import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';
import { QuoteFormClient } from './QuoteFormClient';

type Props = {
  variant?: 'sidebar' | 'page' | 'contact';
  /** Set on a tour page: the title is shown in the form and sent with the request. */
  tour?: { slug: string; title: string };
  defaultDestinations?: string[];
  className?: string;
};

/** The enquiry form. This wrapper hands the client form only the texts it needs, in the page language. */
export async function QuoteForm(props: Props) {
  const lang = await getLocale();
  const { form, countries } = getDictionary(lang);
  const destinations = Object.entries(countries).map(([id, c]) => ({ id, name: c.name }));
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;
  return <QuoteFormClient {...props} text={form} destinations={destinations} turnstileSiteKey={turnstileSiteKey} />;
}
