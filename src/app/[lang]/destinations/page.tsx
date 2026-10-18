import { Accordion } from '@/components/shared/Accordion';
import { ShapedTile } from '@/components/destinations/ShapedTile';
import { ComboCard } from '@/components/shared/ComboCard';
import { DestinationTile } from '@/components/shared/DestinationTile';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { destinations } from '@/data/destinations';
import { PageSections } from '@/components/pages/PageSections';
import { availableCountries, comboCards, getPage } from '@/lib/data';
import { docMetadata } from '@/lib/page-meta';
import { homeFaqs } from '@/data/faqs';
import { breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/seo';
import { format, getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

const description =
  'Tours in Turkey, Greece, Egypt, Jordan and Morocco, plus multi-country combinations, from a licensed local operator since 1997.';

export const generateMetadata = docMetadata({
  title: 'Destinations',
  description,
  path: '/destinations',
  image: 'istanbul-skyline',
  dictionary: (d) => d.ui.pages.hub,
});

export default async function DestinationsPage() {
  const lang = await getLocale();
  const { ui, nav, countries, footer } = getDictionary(lang);
  const t = ui.pages.hub;
  // The old hub page's own text: the guide sections at the end (the country and combination cards before them are drawn by the tiles above),
  // and its ten questions. The old Chinese and Japanese hubs were the home page with no text of their own.
  const doc = await getPage(lang, 'destinations');
  const sections = doc?.sections ?? [];
  let from = sections.length;
  while (from > 0 && sections[from - 1].heading && !/packages|vacations?|holidays/i.test(sections[from - 1].heading)) {
    from--;
  }
  const guide = sections.slice(from);
  const faqs = doc?.faqs.length
    ? doc.faqs
    : lang === 'en'
      ? [0, 1, 5, 7, 12, 13].map((i) => homeFaqs[i]).filter((f) => f !== undefined)
      : [];
  const combos = await comboCards(lang);
  const available = (await availableCountries(lang))
    .map((id) => destinations.find((d) => d.id === id))
    .filter((d) => d !== undefined);
  const crumbs = [
    { name: nav.home, path: '/' },
    { name: nav.destinations, path: '/destinations' },
  ];
  return (
    <>
      <PageBanner title={doc?.title ?? t.bannerTitle} description={t.banner} image="istanbul-skyline" crumbs={crumbs} />
      <TrustBar />
      <section className="section-y">
        <div className="container-x">
          <SectionHeading title={t.chooseTitle} description={t.chooseText} />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {available.map((d) => (
              <li key={d.id} className="reveal">
                <ShapedTile
                  href={`/destinations/${d.id}-tours`}
                  title={countries[d.id].name}
                  note={countries[d.id].tagline}
                  image={d.image}
                  country={d.id}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  shadow="rgb(15 45 74 / 0.28)"
                />
              </li>
            ))}
            <li className="reveal">
              <DestinationTile
                href="/multi-country-tours"
                title={ui.home.destinations.multi}
                note={ui.home.destinations.multiNote}
                image="santorini-domes"
                sizes="(min-width: 768px) 33vw, 50vw"
                className="aspect-[4/5]"
              />
            </li>
          </ul>
        </div>
      </section>
      {combos.length > 0 && (
        <section className="section-y bg-cream-100/60">
          <div className="container-x">
            <SectionHeading
              title={t.comboTitle}
              description={t.comboText}
              link={{ href: '/multi-country-tours', label: t.comboLink }}
            />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {combos.map((c) => (
                <li key={c.href} className="reveal">
                  <ComboCard combo={c} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {guide.length > 0 && (
        <section className="section-y">
          <div className="container-x max-w-3xl">
            <PageSections sections={guide} />
          </div>
        </section>
      )}
      {faqs.length > 0 && (
        <section className="section-y bg-cream-100/60">
          <div className="container-x max-w-3xl">
            <SectionHeading title={t.planningTitle} link={{ href: '/faq', label: t.allFaqs }} />
            <Accordion items={faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
          </div>
        </section>
      )}
      <QuoteBand />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, t.title, '/destinations', t.description),
          itemListJsonLd(
            lang,
            t.title,
            available.map((d) => ({
              name: format(footer.countryTours, { country: countries[d.id].name }),
              path: `/destinations/${d.id}-tours`,
            })),
          ),
          ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
