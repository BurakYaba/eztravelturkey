import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarBlank, Check, Coins } from '@phosphor-icons/react/dist/ssr';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { Ornament, OrnamentRule } from '@/components/destinations/Ornament';
import { ShapedTile } from '@/components/destinations/ShapedTile';
import { Accordion } from '@/components/shared/Accordion';
import { ButtonLink } from '@/components/shared/Button';
import { ComboCard } from '@/components/shared/ComboCard';
import { JsonLd } from '@/components/shared/JsonLd';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrustBar } from '@/components/shared/TrustBar';
import { TourCard } from '@/components/tours/TourCard';
import { combos } from '@/data/combos';
import { destinations, getDestination } from '@/data/destinations';
import { getTheme } from '@/data/destination-themes';
import { toursForCountry } from '@/data/tours';
import { breadcrumbJsonLd, buildMetadata, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo';
import { toCardData } from '@/lib/tours';

type Params = { country: string };

export function generateStaticParams() {
  return destinations.map((d) => ({ country: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country } = await params;
  const d = getDestination(country);
  if (!d) {
    return {};
  }
  return buildMetadata({
    title: `${d.name} Tours`,
    description: `${d.summary} Private and small group ${d.name} tours from a licensed local operator.`,
    path: `/destinations/${d.id}`,
    image: d.heroImage,
  });
}

export default async function CountryPage({ params }: { params: Promise<Params> }) {
  const { country } = await params;
  const d = getDestination(country);
  if (!d) {
    notFound();
  }

  const theme = getTheme(d.id);
  const path = `/destinations/${d.id}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Destinations', path: '/destinations' },
    { name: `${d.name} Tours`, path },
  ];
  const list = toursForCountry(d.id);
  const related = combos.filter((c) => c.countries.includes(d.id)).slice(0, 3);

  return (
    <>
      <DestinationHero
        destination={d}
        theme={theme}
        crumbs={crumbs}
        actions={
          <>
            <ButtonLink href="#tours" size="lg" arrow>
              Explore Tours
            </ButtonLink>
            <ButtonLink href="/plan-my-trip" size="lg" variant="secondary">
              Plan My Trip
            </ButtonLink>
          </>
        }
      />

      {/* Highlights: the skyline above rises out of this section. */}
      <section
        className="relative isolate overflow-hidden pt-6 pb-16 text-white md:pb-24"
        style={{ backgroundColor: theme.deep }}>
        <Ornament
          country={d.id}
          kind="tile"
          color={theme.onDeep}
          tileSize={theme.tileSize}
          opacity={0.1}
          className="absolute inset-0 -z-10"
        />
        <div className="container-x">
          <div className="mb-10 text-center">
            <OrnamentRule country={d.id} color={theme.onDeep} />
            <h2 className="h-section text-white">Highlights of {d.name}</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">{d.tagline}</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {d.highlights.map((h) => (
              <li key={h.name} className="reveal">
                <ShapedTile
                  href={path}
                  title={h.name}
                  note={h.blurb}
                  image={h.image}
                  country={d.id}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Introduction and key facts */}
      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="text-ink/90 space-y-4 text-lg">
            <h2 className="h-section mb-5">Discover {d.name} with a local operator</h2>
            {d.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ul className="space-y-2 pt-2">
              {d.whyGo.map((w) => (
                <li key={w} className="flex gap-3">
                  <Check size={22} weight="bold" className="mt-0.5 shrink-0" style={{ color: theme.ink }} aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="shadow-card h-fit overflow-hidden rounded-lg border bg-white"
            style={{ borderColor: `${theme.ink}55` }}>
            <Ornament
              country={d.id}
              kind="band"
              color={theme.ink}
              height={40}
              className="w-full"
              style={{ backgroundColor: theme.ink }}
            />
            <dl className="space-y-5 p-6">
              <div className="flex gap-4">
                <CalendarBlank size={28} className="mt-0.5 shrink-0" style={{ color: theme.ink }} aria-hidden />
                <div>
                  <dt className="text-navy-900 font-semibold">Best time to visit</dt>
                  <dd className="text-muted mt-1">{d.bestTime}</dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Coins size={28} className="mt-0.5 shrink-0" style={{ color: theme.ink }} aria-hidden />
                <div>
                  <dt className="text-navy-900 font-semibold">Currency</dt>
                  <dd className="text-muted mt-1">{d.currency}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Tours */}
      <section
        id="tours"
        className="relative isolate scroll-mt-24 overflow-hidden py-14 md:py-20"
        style={{ backgroundColor: theme.tint }}>
        <Ornament
          country={d.id}
          kind="tile"
          color={theme.ink}
          tileSize={theme.tileSize}
          opacity={0.08}
          className="absolute inset-0 -z-10"
        />
        <div className="container-x">
          <div className="mb-10 text-center">
            <OrnamentRule country={d.id} color={theme.ink} />
            <h2 className="h-section">{d.name} tour packages</h2>
            {list.length > 0 && (
              <p className="text-muted mx-auto mt-3 max-w-xl text-lg">
                Choose a ready-made itinerary and we will adjust it to your dates.
              </p>
            )}
          </div>
          {list.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <li key={t.slug}>
                  <TourCard tour={toCardData(t)} className="h-full" />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="shadow-card mx-auto max-w-2xl rounded-lg border bg-white p-8 text-center md:p-10"
              style={{ borderColor: `${theme.ink}55` }}>
              <h3 className="text-2xl">{d.name} is planned to order</h3>
              <p className="text-muted mt-2">
                We design {d.name} journeys individually rather than selling fixed packages. Tell us how long you have,
                when you want to travel and what you would like to see, and we will send a proposal.
              </p>
              <ButtonLink href="/plan-my-trip" size="lg" arrow className="mt-6">
                Plan My Trip
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      <TrustBar />

      {related.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <SectionHeading
              title={`Combine ${d.name} with other countries`}
              link={{ href: '/multi-country-tours', label: 'All multi-country tours' }}
            />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <li key={c.slug}>
                  <ComboCard combo={c} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section-y bg-cream-100/60">
        <div className="container-x max-w-3xl">
          <SectionHeading title={`${d.name} travel questions`} link={{ href: '/faq', label: 'All FAQs' }} />
          <Accordion items={d.faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
        </div>
      </section>

      <Ornament country={d.id} kind="band" color={theme.ink} height={34} className="w-full" />
      <QuoteBand
        title={`Ready for ${d.name}?`}
        text="Share your dates and interests and we will reply with a personalized itinerary and quote."
        image={d.heroImage}
      />

      <JsonLd
        data={[
          collectionPageJsonLd(`${d.name} Tours`, path, d.summary),
          itemListJsonLd(
            `${d.name} tours`,
            list.map((t) => ({ name: `${t.title}: ${t.subtitle}`, path: `/tours/${t.slug}` })),
          ),
          breadcrumbJsonLd(crumbs),
        ]}
      />
    </>
  );
}
