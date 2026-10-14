import { Handshake, ListChecks, PaperPlaneTilt, Phone, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { ButtonAnchor } from '@/components/shared/Button';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteForm } from '@/components/shared/QuoteForm';
import { TrustBar } from '@/components/shared/TrustBar';
import { site, whatsappLink } from '@/data/site';
import { breadcrumbJsonLd, localizedMetadata, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

const description =
  'Tell us where you would like to go and get a personalized itinerary and quote from our travel experts. No obligation.';

export const generateMetadata = localizedMetadata({
  title: 'Plan My Trip',
  description,
  path: '/plan-my-trip',
  image: 'travel-planning',
});

const next = [
  {
    icon: PaperPlaneTilt,
    title: 'You tell us your plans',
    text: 'Destinations, dates, number of travelers and anything that matters to you.',
  },
  {
    icon: ListChecks,
    title: 'We send a proposal',
    text: 'A route, hotels, what is included and a clear price, shaped around your answers.',
  },
  {
    icon: Handshake,
    title: 'We refine it together',
    text: 'Change anything you like. Confirm with a 50% deposit when you are ready.',
  },
];

export default async function PlanMyTripPage() {
  const lang = await getLocale();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Plan My Trip', path: '/plan-my-trip' },
  ];
  return (
    <>
      <PageBanner
        title="Plan Your Trip"
        description="Share your dreams and our travel experts will create a tailored itinerary and quote. No obligation."
        image="travel-planning"
        crumbs={crumbs}
      />
      <TrustBar />
      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
          <div>
            <h2 className="h-section">What happens next</h2>
            <ol className="mt-6 space-y-6">
              {next.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="bg-gold-100 text-gold-700 grid size-12 shrink-0 place-items-center rounded-lg">
                    <Icon size={26} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-sans text-lg font-semibold tracking-normal">{title}</h3>
                    <p className="text-muted mt-1">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="bg-cream-100 mt-10 rounded-lg p-6">
              <h3 className="text-xl">Prefer to talk?</h3>
              <p className="text-muted mt-1">Message or call us and a travel consultant will help.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonAnchor
                  href={whatsappLink('Hello Magnificent Travel, I would like to plan a trip.')}
                  target="_blank"
                  rel="noopener noreferrer">
                  <WhatsappLogo size={20} weight="fill" aria-hidden />
                  WhatsApp
                </ButtonAnchor>
                <ButtonAnchor href={site.phoneHref} variant="secondary">
                  <Phone size={20} aria-hidden />
                  {site.phone}
                </ButtonAnchor>
              </div>
            </div>
          </div>
          <QuoteForm variant="page" />
        </div>
      </section>
      <JsonLd
        data={[webPageJsonLd(lang, 'Plan My Trip', '/plan-my-trip', 'ContactPage', description), breadcrumbJsonLd(lang, crumbs)]}
      />
    </>
  );
}
