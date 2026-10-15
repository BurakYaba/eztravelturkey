import { Link } from '@/i18n/link';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';
import type { PageRecord, PageSummary, TourCardData } from '@/lib/data/types';
import { Accordion } from '../shared/Accordion';
import type { Crumb } from '../shared/Breadcrumbs';
import { MultiCountryCta } from '../shared/MultiCountryCta';
import { PageBanner } from '../shared/PageBanner';
import { Picture } from '../shared/Picture';
import { QuoteBand } from '../shared/QuoteBand';
import { SectionHeading } from '../shared/SectionHeading';
import { TourCard } from '../tours/TourCard';
import { PageSections } from './PageSections';

type Props = {
  page: PageRecord;
  tours: TourCardData[];
  /** Duration or package pages of a country, shown as links above the tours. */
  categories?: PageSummary[];
  crumbs: Crumb[];
  /** Cross-sell to the multi-country tours (single-country pages only). */
  crossSell?: boolean;
};

/**
 * Interim page for a country, a combination or a category: the old page's text, the tours under it and its FAQs.
 * The final design comes in docs/project-plan.md P3.
 */
export async function DestinationPage({ page, tours, categories = [], crumbs, crossSell = false }: Props) {
  const lang = await getLocale();
  const { card } = getDictionary(lang);
  return (
    <>
      <PageBanner title={page.title} description={page.metaDescription} picture={page.image} crumbs={crumbs} />

      {categories.length > 0 && (
        <section className="section-y pb-0">
          <div className="container-x">
            <SectionHeading title="Choose by length or style" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <li key={c.path}>
                  <Link
                    href={c.href}
                    className="group border-cream-200 shadow-card hover:shadow-lift flex h-full gap-4 overflow-hidden rounded-lg border bg-white p-3 transition hover:-translate-y-0.5">
                    <span className="bg-cream-100 relative block aspect-square w-24 shrink-0 overflow-hidden rounded-md">
                      {c.image && <Picture image={c.image} sizes="96px" />}
                    </span>
                    <span className="text-navy-900 self-center font-semibold">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {tours.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <SectionHeading title={`Tours (${tours.length})`} />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour, i) => (
                <li key={tour.href}>
                  <TourCard tour={tour} lang={lang} text={card} className="h-full" priority={i < 3} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {page.sections.length > 0 && (
        <section className="section-y bg-cream-100/50">
          <div className="container-x max-w-3xl">
            <PageSections sections={page.sections} />
          </div>
        </section>
      )}

      {page.faqs.length > 0 && (
        <section className="section-y">
          <div className="container-x max-w-3xl">
            <SectionHeading title="Frequently asked questions" />
            <Accordion items={page.faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
          </div>
        </section>
      )}

      {crossSell && <MultiCountryCta />}
      <QuoteBand />
    </>
  );
}
