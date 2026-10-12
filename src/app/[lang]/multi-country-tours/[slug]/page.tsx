import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Airplane, CalendarBlank, Clock, MapPin } from '@phosphor-icons/react/dist/ssr';
import { Accordion } from '@/components/shared/Accordion';
import { ButtonLink } from '@/components/shared/Button';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { Photo } from '@/components/shared/Photo';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { TourCard } from '@/components/tours/TourCard';
import { combos, getCombo } from '@/data/combos';
import { tours } from '@/data/tours';
import { breadcrumbJsonLd, buildMetadata, touristTripJsonLd, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';
import { toCardData } from '@/lib/tours';
import { eur } from '@/lib/utils';

type Params = { slug: string };

export function generateStaticParams() {
  return combos.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCombo(slug);
  if (!c) {
    return {};
  }
  return buildMetadata({
    title: `${c.name} Tours: ${c.daysMin} to ${c.daysMax} Day Packages`,
    description: `${c.summary} ${c.daysMin} to ${c.daysMax} days from ${eur(c.fromPriceEUR)} per person.`,
    path: `/multi-country-tours/${c.slug}`,
    image: c.image,
  });
}

export default async function ComboPage({ params }: { params: Promise<Params> }) {
  const lang = await getLocale();
  const { slug } = await params;
  const c = getCombo(slug);
  if (!c) {
    notFound();
  }

  const path = `/multi-country-tours/${c.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Multi-Country Tours', path: '/multi-country-tours' },
    { name: `${c.name} Tours`, path },
  ];
  const countryTours = tours.filter((t) => t.countries.some((id) => c.countries.includes(id))).slice(0, 3);
  const glance = [
    { icon: Clock, label: 'Length', value: `${c.daysMin} to ${c.daysMax} days` },
    { icon: MapPin, label: 'Countries', value: `${c.countries.length}` },
    { icon: CalendarBlank, label: 'Best time', value: c.bestTime },
    { icon: Airplane, label: 'From', value: `${eur(c.fromPriceEUR)} per person` },
  ];

  return (
    <>
      <PageBanner
        title={`${c.name} Tours`}
        description={`${c.summary} ${c.daysMin} to ${c.daysMax} day packages.`}
        image={c.image}
        crumbs={crumbs}
        actions={
          <ButtonLink href="/plan-my-trip" size="lg" arrow>
            Plan My Trip
          </ButtonLink>
        }
      />
      <TrustBar />

      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="text-ink/90 space-y-4 text-lg">
            <h2 className="h-section mb-5">{c.name} at a glance</h2>
            {c.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <h3 className="pt-4 text-2xl">Typical route</h3>
            <ul className="flex flex-wrap gap-2 pt-1">
              {c.route.map((stop) => (
                <li
                  key={stop}
                  className="border-navy-900/20 text-navy-900 rounded-full border bg-white px-4 py-1.5 text-base font-medium">
                  {stop}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="shadow-card relative aspect-[4/3] overflow-hidden rounded-lg">
              <Photo id={c.image2} sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            <dl className="bg-cream-100 grid gap-4 rounded-lg p-5">
              {glance.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon size={24} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <dt className="text-gold-700 text-sm font-semibold">{label}</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section-y bg-cream-100/60">
        <div className="container-x grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl">Why this pairing works</h2>
            <p className="text-ink/90 mt-3">{c.pairing}</p>
          </div>
          <div>
            <h2 className="text-2xl">How the journey fits together</h2>
            <p className="text-ink/90 mt-3">{c.logistics}</p>
          </div>
        </div>
      </section>

      {countryTours.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <SectionHeading
              title="Start with a ready-made itinerary"
              description="Our single-country tours can be extended into this combination. Ask us to link them."
              link={{ href: '/tours', label: 'View all tours' }}
            />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {countryTours.map((t) => (
                <li key={t.slug}>
                  <TourCard tour={toCardData(t)} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section-y bg-cream-100/60">
        <div className="container-x max-w-3xl">
          <SectionHeading title={`${c.name} questions`} link={{ href: '/faq', label: 'All FAQs' }} />
          <Accordion items={c.faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
        </div>
      </section>

      <QuoteBand
        title={`Ready for ${c.name}?`}
        text="Tell us your dates and what you want to see. We will send a personalized itinerary and quote."
        image={c.image2}
      />

      <JsonLd
        data={[
          webPageJsonLd(lang, `${c.name} Tours`, path, 'WebPage', c.summary),
          touristTripJsonLd({ lang,
            name: `${c.name} Tours: ${c.daysMin} to ${c.daysMax} Day Packages`,
            description: c.intro.join(' '),
            path,
            image: c.image,
            priceEUR: c.fromPriceEUR,
            stops: c.route,
          }),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
