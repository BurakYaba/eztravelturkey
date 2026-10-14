import { Airplane, Bed, Boat, UserFocus } from '@phosphor-icons/react/dist/ssr';
import { Accordion } from '@/components/shared/Accordion';
import { ComboCard } from '@/components/shared/ComboCard';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { comboCards } from '@/lib/data';
import { homeFaqs } from '@/data/faqs';
import { breadcrumbJsonLd, localizedMetadata, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

const description =
  'Multi-country tours across Turkey, Greece, Egypt and Jordan, with flights, ferries, hotels, transfers and guides coordinated by one licensed local team.';

export const generateMetadata = localizedMetadata({
  title: 'Multi-Country Tours',
  description,
  path: '/multi-country-tours',
  image: 'santorini-domes',
});

const coordinates = [
  {
    icon: Airplane,
    title: 'Flights',
    text: 'International connections between countries and domestic flights within them.',
  },
  { icon: Boat, title: 'Ferries', text: 'High-speed island ferries and port transfers in Greece.' },
  { icon: Bed, title: 'Hotels', text: 'Carefully selected hotels in every city and region.' },
  { icon: UserFocus, title: 'Guides and transfers', text: 'Licensed local guides and private transfers throughout.' },
];

export default async function MultiCountryPage() {
  const lang = await getLocale();
  const combos = await comboCards(lang);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Multi-Country Tours', path: '/multi-country-tours' },
  ];
  return (
    <>
      <PageBanner
        title="Multi-Country Tours"
        description="Seamlessly weave together diverse cultures and iconic landscapes in one journey."
        image="santorini-domes"
        crumbs={crumbs}
      />
      <TrustBar />
      <section className="section-y">
        <div className="container-x">
          <SectionHeading
            title="Multi-country tours across the eastern Mediterranean"
            description="Choose a combination and we will shape the route, the length and the pace around you."
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
      <section className="section-y bg-cream-100/60">
        <div className="container-x">
          <SectionHeading
            title="One team coordinates it all"
            description="Several countries in one trip means many moving parts. We handle them as a single itinerary."
          />
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {coordinates.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <Icon size={34} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                <div>
                  <h3 className="font-sans text-base font-semibold tracking-normal">{title}</h3>
                  <p className="text-muted mt-1 text-[0.95rem]">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section-y">
        <div className="container-x max-w-3xl">
          <SectionHeading title="Questions about multi-country trips" link={{ href: '/faq', label: 'All FAQs' }} />
          <Accordion
            items={[5, 7, 15, 13].map((i) => ({ id: `q-${i}`, title: homeFaqs[i].q, content: <p>{homeFaqs[i].a}</p> }))}
          />
        </div>
      </section>
      <QuoteBand
        title="Planning more than one country?"
        text="Tell us which places you cannot miss and we will shape a route around them."
        image="mykonos"
      />
      <JsonLd
        data={[
          collectionPageJsonLd(lang, 'Multi-Country Tours', '/multi-country-tours', description),
          itemListJsonLd(lang, 
            'Multi-country tours',
            combos.map((c) => ({ name: c.title, path: c.href })),
          ),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
