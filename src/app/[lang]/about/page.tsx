import {
  ArrowUpRight,
  Binoculars,
  Bed,
  HandHeart,
  Headset,
  MapTrifold,
  Path,
  SealCheck,
} from '@phosphor-icons/react/dist/ssr';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { Photo } from '@/components/shared/Photo';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { photoCredits } from '@/data/images';
import { site } from '@/data/site';
import { breadcrumbJsonLd, localizedMetadata, webPageJsonLd } from '@/lib/seo';
import { getLocale } from '@/i18n/server';

const description = `${site.name} is a licensed Turkish tour operator (License No. ${site.licenseNo}) organizing private, small group and multi-country tours since ${site.founded}.`;

export const generateMetadata = localizedMetadata({ title: 'About Us', description, path: '/about', image: 'istanbul-bosphorus' });

const arrange = [
  { icon: Bed, text: 'Hotels selected for location, comfort and traveler feedback' },
  { icon: Binoculars, text: 'Licensed local guides and sightseeing' },
  { icon: MapTrifold, text: 'Airport and hotel transfers' },
  { icon: Path, text: 'Domestic and regional flights, and ferries' },
  { icon: HandHeart, text: 'Private, small group and fully customized tours' },
  { icon: Headset, text: '24/7 local support while you travel' },
];

const stats = [
  { value: String(site.founded), label: 'Founded in Istanbul' },
  { value: site.stats.travelers, label: 'Happy travelers' },
  { value: site.stats.tours, label: 'Tours completed' },
  { value: `${site.stats.rating}`, label: `Tripadvisor, ${site.stats.reviews} reviews` },
];

export default async function AboutPage() {
  const lang = await getLocale();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];
  return (
    <>
      <PageBanner
        title="About Magnificent Travel"
        description={`An independent Turkish tour operator, creating journeys across the eastern Mediterranean since ${site.founded}.`}
        image="istanbul-bosphorus"
        crumbs={crumbs}
      />
      <TrustBar />

      <section className="section-y">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-ink/90 space-y-4 text-lg">
            <h2 className="h-section mb-5">Why travel with Magnificent Travel?</h2>
            <p>
              We have operated since {site.founded} as a licensed local operator, offering private tours, small group
              tours and customized journeys across Turkey, Greece, Egypt, Jordan and Morocco.
            </p>
            <p>
              We arrange hotels, licensed guides, airport transfers, sightseeing, regional transport, flights and
              ferries. When a trip crosses borders, we run it as one itinerary instead of several separate holidays, so
              you speak to one team from your first message to your last day.
            </p>
            <p>Our local staff are available around the clock while you travel.</p>
          </div>
          <div className="shadow-card relative aspect-[4/3] overflow-hidden rounded-lg">
            <Photo id="istanbul-bazaar" sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-12 text-white">
        <div className="container-x">
          <dl className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="order-2 mt-1 text-white/80">{s.label}</dt>
                <dd className="font-display text-gold-100 text-4xl font-semibold md:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x">
          <SectionHeading
            title="What we arrange"
            description="Everything that makes a trip run smoothly, handled by one team."
          />
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {arrange.map(({ icon: Icon, text }) => (
              <li key={text} className="bg-cream-100 flex items-start gap-4 rounded-lg p-5">
                <Icon size={30} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                <span className="text-ink">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y bg-cream-100/60">
        <div className="container-x grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="h-section">Licensed and registered</h2>
            <p className="text-ink/90 mt-4 text-lg">
              {site.name} is officially registered as {site.legalName}, operating under Turkish Ministry of Culture and
              Tourism License No. {site.licenseNo}, and is registered with TURSAB, the Association of Turkish Travel
              Agencies.
            </p>
            <a
              href={site.tursabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-900 decoration-gold-500/60 mt-4 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
              <SealCheck size={20} className="text-gold-600" aria-hidden />
              Verify our registration with TURSAB <ArrowUpRight size={16} weight="bold" aria-hidden />
            </a>
          </div>
          <address className="border-cream-200 shadow-card rounded-lg border bg-white p-6 not-italic">
            <h3 className="text-xl">Our office</h3>
            <p className="text-ink mt-2">
              {site.address.street}
              <br />
              {site.address.district}, {site.address.city} {site.address.postalCode}
              <br />
              {site.address.country}
            </p>
          </address>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x max-w-3xl">
          <h2 className="text-2xl">Photo credits</h2>
          <p className="text-muted mt-2">
            Destination photography on this site is provided by photographers on{' '}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4">
              Pexels
            </a>
            . The Istanbul skyline in the home page header is an illustration supplied by Magnificent Travel.
          </p>
          <details className="border-cream-200 mt-4 rounded-lg border bg-white p-4">
            <summary className="text-navy-900 cursor-pointer font-semibold">Show photographers</summary>
            <ul className="text-muted mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {photoCredits.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4">
                    {c.photographer}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      <QuoteBand />
      <JsonLd
        data={[webPageJsonLd(lang, 'About Magnificent Travel', '/about', 'AboutPage', description), breadcrumbJsonLd(lang, crumbs)]}
      />
    </>
  );
}
