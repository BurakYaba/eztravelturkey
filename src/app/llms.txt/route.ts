import { getDictionary } from '@/i18n/dictionaries';
import { localePath } from '@/i18n/paths';
import { allTours, blogCategories, comboCards } from '@/lib/data';
import { getSiteSettings } from '@/lib/data/settings';
import { absoluteUrl } from '@/lib/seo';
import type { CountryId } from '@/data/types';

export const revalidate = 86400;

const countryOrder: CountryId[] = ['turkey', 'greece', 'egypt', 'jordan', 'morocco'];

/**
 * `/llms.txt`: a plain Markdown summary of the site for AI assistants (docs/project-plan.md P8.3, decision 2026-10-21: made and
 * kept up to date). Built from the CMS on every revalidation, so a new tour appears here without anyone editing a file. English
 * only: the other languages are reached from the language menu. Google says this file does not change how it ranks pages; it
 * costs nothing to keep and some assistants read it.
 */
export async function GET() {
  const lang = 'en';
  const { countries, meta } = getDictionary(lang);
  const s = await getSiteSettings(lang);
  const [tours, combos, categories] = await Promise.all([allTours(lang), comboCards(lang), blogCategories(lang)]);
  const link = (title: string, href: string, note?: string) =>
    `- [${title}](${absoluteUrl(localePath(lang, href))})${note ? `: ${note}` : ''}`;
  const price = (eur: number | null, usd: number | null) =>
    [eur === null ? '' : `from €${eur}`, usd === null ? '' : `from $${usd}`].filter(Boolean).join(' / ');

  const lines: string[] = [
    '# Magnificent Travel',
    '',
    `> ${meta.defaultDescription} Licensed by TÜRSAB (License No. ${s.licenseNo}), based in Istanbul, operating since ${s.founded}.`,
    '',
    'Prices on the site are starting prices per person; the final price depends on dates, hotels and group size. Every tour page has an enquiry form. Also available in Simplified Chinese (/cn/) and Japanese (/jp/).',
    '',
    '## Company',
    '',
    link('About us', '/about', 'who we are, licence, team'),
    link('Contact', '/contact', [s.phone, s.email].filter(Boolean).join(', ')),
    link('Plan my trip', '/plan-my-trip', 'request a tailor-made quote'),
    link('FAQ', '/faq'),
    '',
    '## Multi-country tours',
    '',
    ...combos.map((c) => link(c.title, c.href, c.price || undefined)),
    '',
  ];

  for (const id of countryOrder) {
    const list = tours
      .filter((t) => t.countries.length === 1 && t.countries[0] === id)
      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));
    if (list.length === 0) {
      continue;
    }
    lines.push(
      `## ${countries[id].name} tours`,
      '',
      link(`All ${countries[id].name} tours`, `/destinations/${id}-tours`),
    );
    lines.push(
      ...list.map((t) => link(t.title, t.href, [t.duration, price(t.priceEUR, t.priceUSD)].filter(Boolean).join(', '))),
      '',
    );
  }

  const multi = tours.filter((t) => t.countries.length > 1).sort((a, b) => (a.days ?? 0) - (b.days ?? 0));
  if (multi.length > 0) {
    lines.push(
      '## Tours that combine countries',
      '',
      ...multi.map((t) =>
        link(t.title, t.href, [t.duration, price(t.priceEUR, t.priceUSD)].filter(Boolean).join(', ')),
      ),
      '',
    );
  }

  if (categories.length > 0) {
    lines.push('## Travel guides (blog)', '', ...categories.map((c) => link(c.title, c.href)), '');
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
