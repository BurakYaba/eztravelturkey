import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { ButtonAnchor, ButtonLink } from '@/components/shared/Button';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { QuoteForm } from '@/components/shared/QuoteForm';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { TourCard } from '@/components/tours/TourCard';
import {
  CancellationSection,
  InclusionsSection,
  ItinerarySection,
  PaymentSection,
  RequirementsSection,
  RouteMapSection,
  StopsGrid,
  TourFaqs,
  TourReviews,
  TripGlance,
  WhyChoose,
} from '@/components/tours/TourSections';
import { TourPanel } from '@/components/tours/TourPanel';
import { TourTabs, TourTabsProvider } from '@/components/tours/TourTabs';
import { countryName } from '@/data/destinations';
import { site, whatsappLink } from '@/data/site';
import { getTour, tours } from '@/data/tours';
import { breadcrumbJsonLd, buildMetadata, touristTripJsonLd, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';
import { getRouteMapSrc, toCardData } from '@/lib/tours';
import { eur } from '@/lib/utils';

type Params = { slug: string };

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) {
    return {};
  }
  return buildMetadata({
    title: `${tour.title}: ${tour.subtitle}`,
    description: `${tour.summary} ${tour.nights} nights, ${tour.days} days from ${eur(tour.fromPriceEUR)} per person. Licensed local operator since ${site.founded}.`,
    path: `/tours/${tour.slug}`,
    image: tour.image,
  });
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'route-map', label: 'Route Map' },
  { id: 'inclusions', label: 'Inclusions' },
  { id: 'requirements', label: 'Trip Requirements' },
  { id: 'payment', label: 'Payment Summary' },
  { id: 'cancellation', label: 'Trip Cancellation Terms' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'reviews', label: 'Reviews' },
];

export default async function TourPage({ params }: { params: Promise<Params> }) {
  const lang = await getLocale();
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) {
    notFound();
  }

  const path = `/tours/${tour.slug}`;
  const first = tour.countries[0];
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tours', path: '/tours' },
    { name: countryName(first), path: `/destinations/${first}` },
    { name: tour.title, path },
  ];
  const related = tour.related
    .map((s) => getTour(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 3);
  const message = `Hello Magnificent Travel, I am interested in the ${tour.title} (${tour.subtitle}).`;

  return (
    <>
      <PageBanner
        title={tour.title}
        crumbs={crumbs}
        image={tour.image}
        description={
          <>
            <span className="font-display text-navy-900 mb-3 block text-2xl font-semibold">{tour.subtitle}</span>
            {tour.summary}
          </>
        }
        actions={
          <>
            <ButtonLink href="#plan" size="lg" arrow>
              Plan My Trip
            </ButtonLink>
            <ButtonAnchor
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg">
              <WhatsappLogo size={22} weight="fill" aria-hidden />
              Chat on WhatsApp
            </ButtonAnchor>
          </>
        }
      />
      <TrustBar />
      <TourTabsProvider tabs={tabs}>
        <TourTabs tabs={tabs} />

        <div className="container-x grid gap-10 pb-16 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div id="tour-panels" className="min-w-0 lg:min-h-[34rem]">
            <TourPanel id="overview" label="Overview" defaultOpen className="max-lg:mt-0">
              <p className="eyebrow max-lg:hidden">Overview</p>
              <h2 className="h-section mt-2">A remarkable journey: {tour.route.join(', ')}</h2>
              <p className="text-ink/90 mt-4 max-w-2xl text-lg">{tour.overview}</p>
              <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="text-ink flex gap-2.5">
                    <span aria-hidden className="bg-gold-600 mt-2.5 size-1.5 shrink-0 rounded-full" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <TripGlance tour={tour} />
              </div>
              <StopsGrid tour={tour} />
              <WhyChoose tour={tour} />
            </TourPanel>
            <TourPanel id="itinerary" label="Itinerary" defaultOpen>
              <ItinerarySection tour={tour} />
            </TourPanel>
            <TourPanel id="route-map" label="Route Map">
              <RouteMapSection tour={tour} mapSrc={getRouteMapSrc(tour.slug)} />
            </TourPanel>
            <TourPanel id="inclusions" label="Inclusions">
              <InclusionsSection tour={tour} />
            </TourPanel>
            <TourPanel id="requirements" label="Trip Requirements">
              <RequirementsSection tour={tour} />
            </TourPanel>
            <TourPanel id="payment" label="Payment Summary">
              <PaymentSection />
            </TourPanel>
            <TourPanel id="cancellation" label="Trip Cancellation Terms">
              <CancellationSection tour={tour} />
            </TourPanel>
            <TourPanel id="faqs" label="FAQs">
              <TourFaqs tour={tour} />
            </TourPanel>
            <TourPanel id="reviews" label="Reviews">
              <TourReviews />
            </TourPanel>
          </div>

          <aside id="plan" className="scroll-mt-40 pt-12 lg:self-start">
            <div className="lg:sticky lg:top-40 lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:pr-1">
              <div className="bg-navy-900 rounded-lg p-5 text-white">
                <p className="text-gold-100 text-sm">Starting from</p>
                <p className="font-display text-4xl font-semibold text-white">
                  {eur(tour.fromPriceEUR)}{' '}
                  <span className="font-sans text-base font-normal text-white/80">per person</span>
                </p>
                <p className="mt-1 text-sm text-white/80">Taxes included. Final price depends on dates and hotels.</p>
              </div>
              <h2 className="mt-5 text-2xl">Plan your trip</h2>
              <p className="text-muted mt-1">Get a personalized quote for this tour.</p>
              <QuoteForm variant="sidebar" tour={{ slug: tour.slug, title: tour.title }} className="mt-4" />
            </div>
          </aside>
        </div>
      </TourTabsProvider>

      {related.length > 0 && (
        <section className="section-y border-cream-200 bg-cream-100/60 border-t">
          <div className="container-x">
            <SectionHeading title="Related tours you might like" link={{ href: '/tours', label: 'View all tours' }} />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <li key={t.slug}>
                  <TourCard tour={toCardData(t)} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <QuoteBand
        title={`Ready to experience ${tour.countries.map(countryName).join(' and ')}?`}
        text="Share your travel dreams and let our experts create a personalized itinerary just for you."
        image={tour.gallery[0] ?? tour.image}
      />

      <JsonLd
        data={[
          webPageJsonLd(lang, `${tour.title}: ${tour.subtitle}`, path, 'WebPage', tour.summary),
          touristTripJsonLd({ lang,
            name: `${tour.title}: ${tour.subtitle}`,
            description: tour.overview,
            path,
            image: tour.image,
            priceEUR: tour.fromPriceEUR,
            stops: tour.route,
          }),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
