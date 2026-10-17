import { Link } from '@/i18n/link';
import { destinations } from '@/data/destinations';
import { format, getDictionary } from '@/i18n/dictionaries';
import { formatPrice } from '@/i18n/format';
import { getLocale } from '@/i18n/server';
import { blogsAbout, countriesIn } from '@/lib/data';
import type { ImageRef, PageRecord, PageSummary, TourCardData } from '@/lib/data/types';
import { Accordion } from '../shared/Accordion';
import type { Crumb } from '../shared/Breadcrumbs';
import { MultiCountryCta } from '../shared/MultiCountryCta';
import { PageBanner } from '../shared/PageBanner';
import { Picture } from '../shared/Picture';
import { QuoteBand } from '../shared/QuoteBand';
import { SectionHeading } from '../shared/SectionHeading';
import { TourCard } from '../tours/TourCard';
import { BlogCard } from './BlogCard';
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

/** One choice in the "choose by length or style" grid: a picture, a title and how many tours it holds. */
function ChooserCard({ href, title, count, image }: { href: string; title: string; count: string; image: ImageRef | null }) {
  return (
    <Link
      href={href}
      className="group border-cream-200 shadow-card hover:shadow-lift flex h-full gap-4 overflow-hidden rounded-lg border bg-white p-3 transition hover:-translate-y-0.5">
      <span className="bg-cream-100 relative block aspect-square w-24 shrink-0 overflow-hidden rounded-md">
        {image && <Picture image={image} alt="" sizes="96px" />}
      </span>
      <span className="self-center">
        <span className="text-navy-900 block font-semibold">{title}</span>
        <span className="text-muted block text-sm">{count}</span>
      </span>
    </Link>
  );
}

/**
 * A country, a combination or a category page: the old page's text, what sits under it (category cards or tours), a
 * few facts worked out from the tours, guides about the same countries and the page's FAQs.
 */
export async function DestinationPage({ page, tours, categories = [], crumbs, crossSell = false }: Props) {
  const lang = await getLocale();
  const { card, destination: t } = getDictionary(lang);
  // A country that has length or style pages sends its tours to those pages (as the live site does): listing all of
  // them here as well would repeat every category page and compete with it in search. A country without such pages
  // (Egypt, Jordan, Morocco) and every combination or category page list their tours.
  const listTours = categories.length === 0;
  const countIn = (href: string) => tours.filter((tour) => tour.href.startsWith(href)).length;

  const folder = page.path.split('/')[1] ?? '';
  const ids = countriesIn(folder);
  const countryId = page.kind === 'country' ? ids[0] : undefined;
  const country = countryId ? destinations.find((d) => d.id === countryId) : undefined;
  const cheapest = tours.reduce<number | null>(
    (low, tour) => (tour.priceEUR !== null && (low === null || tour.priceEUR < low) ? tour.priceEUR : low),
    null,
  );
  // Only what the data really says: the number of tours, the lowest starting price, the season and money of the country.
  const facts = [
    { label: t.tourCount, value: String(tours.length) },
    ...(cheapest === null ? [] : [{ label: t.fromPrice, value: formatPrice(lang, cheapest, 'EUR') }]),
    ...(country ? [{ label: t.bestTime, value: country.bestTime }, { label: t.currency, value: country.currency }] : []),
  ];
  const guides = await blogsAbout(lang, folder, 3);

  // A country without category pages shows the same chooser as one with them, but its length groups are sections of
  // this page: the old site has no pages for them and their addresses stay as they were.
  const countryName = ids.length === 1 ? getDictionary(lang).countries[ids[0] as 'turkey']?.name : undefined;
  const groups =
    listTours && page.kind === 'country'
      ? (['3-5', '6-9', '10+', 'other'] as const)
          .map((key) => ({
            key,
            id: `group-${key === '10+' ? '10-plus' : key}`,
            title: format(t.bucket[key], { country: countryName ?? '' }).trim(),
            tours: tours.filter((tour) => (tour.bucket ?? 'other') === key),
          }))
          .filter((g) => g.tours.length > 0)
      : [];
  return (
    <>
      <PageBanner title={page.title} description={page.metaDescription} picture={page.image} crumbs={crumbs} />

      {tours.length > 0 && (
        <section aria-label={t.keyFacts} className="border-cream-200 bg-cream-100/70 border-b">
          <div className="container-x">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 py-5 lg:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-muted text-sm">{fact.label}</dt>
                  <dd className="text-navy-900 font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {(categories.length > 0 || groups.length > 0) && (
        <section className="section-y pb-0">
          <div className="container-x">
            <SectionHeading title={t.chooseTitle} />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <li key={c.path}>
                  <ChooserCard
                    href={c.href}
                    title={c.title}
                    count={format(t.toursCount, { count: countIn(c.href) })}
                    image={c.image}
                  />
                </li>
              ))}
              {groups.map((g) => (
                <li key={g.key}>
                  <ChooserCard
                    href={`#${g.id}`}
                    title={g.title}
                    count={format(t.toursCount, { count: g.tours.length })}
                    image={g.tours.find((tour) => tour.image)?.image ?? null}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {groups.map((g, gi) => (
        <section key={g.key} id={g.id} className="section-y scroll-mt-20 pb-0">
          <div className="container-x">
            <SectionHeading title={g.title} />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {g.tours.map((tour, i) => (
                <li key={tour.href}>
                  <TourCard tour={tour} lang={lang} text={card} className="h-full" priority={gi === 0 && i < 3} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {listTours && page.kind !== 'country' && tours.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <SectionHeading title={format(t.toursHeading, { count: tours.length })} />
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

      {guides.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <SectionHeading
              title={countryName ? format(t.guides, { country: countryName }) : t.moreGuides}
              link={{ href: '/blog', label: t.moreGuides }}
            />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((post) => (
                <li key={post.path}>
                  <BlogCard post={post} className="h-full" />
                </li>
              ))}
            </ul>
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
