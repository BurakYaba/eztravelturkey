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
import { comboCards } from '@/lib/data';
import { homeFaqs } from '@/data/faqs';
import { site } from '@/data/site';
import { breadcrumbJsonLd, localizedMetadata, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

const description =
  'Tours in Turkey, Greece, Egypt, Jordan and Morocco, plus multi-country combinations, from a licensed local operator since 1997.';

export const generateMetadata = localizedMetadata({
  title: 'Destinations',
  description,
  path: '/destinations',
  image: 'istanbul-skyline',
});

const faqIndexes = [0, 1, 5, 7, 12, 13];

export default async function DestinationsPage() {
  const lang = await getLocale();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Destinations', path: '/destinations' },
  ];
  return (
    <>
      <PageBanner
        title="Our Destinations"
        description="Extraordinary cultures, timeless history and unforgettable experiences across the eastern Mediterranean and beyond."
        image="istanbul-skyline"
        crumbs={crumbs}
      />
      <TrustBar />
      <section className="section-y">
        <div className="container-x">
          <SectionHeading
            title="Choose where to go"
            description="Each country page lists our tours, the best time to visit and what to expect."
          />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {destinations.map((d) => (
              <li key={d.id} className="reveal">
                <ShapedTile
                  href={`/destinations/${d.id}-tours`}
                  title={d.name}
                  note={d.tagline}
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
                title="Multi-Country"
                note="Many countries, one journey"
                image="santorini-domes"
                sizes="(min-width: 768px) 33vw, 50vw"
                className="aspect-[4/5]"
              />
            </li>
          </ul>
        </div>
      </section>
      <section className="section-y bg-cream-100/60">
        <div className="container-x">
          <SectionHeading
            title="Multi-country combinations"
            description="Two or more countries in one trip, with hotels, guides, transfers and flights arranged as a single itinerary."
            link={{ href: '/multi-country-tours', label: 'About multi-country tours' }}
          />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(await comboCards(lang)).map((c) => (
              <li key={c.href} className="reveal">
                <ComboCard combo={c} className="h-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section-y">
        <div className="container-x max-w-3xl">
          <h2 className="h-section">Regional travel specialists since {site.founded}</h2>
          <p className="text-ink/90 mt-4 text-lg">
            {site.name} is a licensed Turkish tour operator (License No. {site.licenseNo}). We organize journeys across
            Turkey, Greece, Egypt, Jordan and Morocco, and we combine them into multi-country itineraries managed by one
            team. Our local guides, drivers and hotel partners know each destination well, so your plan fits together.
          </p>
        </div>
      </section>
      <section className="section-y">
        <div className="container-x max-w-3xl">
          <SectionHeading title="Planning your destinations" link={{ href: '/faq', label: 'All FAQs' }} />
          <Accordion
            items={faqIndexes.map((i) => ({ id: `q-${i}`, title: homeFaqs[i].q, content: <p>{homeFaqs[i].a}</p> }))}
          />
        </div>
      </section>
      <QuoteBand />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, 'Destinations', '/destinations', description),
          itemListJsonLd(lang, 
            'Destinations',
            destinations.map((d) => ({ name: `${d.name} tours`, path: `/destinations/${d.id}-tours` })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
