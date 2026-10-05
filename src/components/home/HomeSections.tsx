import Link from 'next/link';
import {
  ArrowRight,
  Buildings,
  CalendarCheck,
  Headset,
  MapTrifold,
  Path,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { ArticleCard } from '../shared/ArticleCard';
import { ComboCard } from '../shared/ComboCard';
import { DestinationTile } from '../shared/DestinationTile';
import { Photo } from '../shared/Photo';
import { ReviewCards } from '../shared/ReviewCards';
import { SectionHeading } from '../shared/SectionHeading';
import { TourCard } from '../tours/TourCard';
import { TextLink } from '../shared/Button';
import { combos } from '@/data/combos';
import { destinations } from '@/data/destinations';
import { site } from '@/data/site';
import { tours } from '@/data/tours';
import { getArticles } from '@/lib/content';
import { formatDate } from '@/lib/utils';

const reasons: { icon: Icon; title: string; text: string }[] = [
  {
    icon: CalendarCheck,
    title: `Local tour operator since ${site.founded}`,
    text: `Licensed under Turkish Ministry of Culture and Tourism License No. ${site.licenseNo}.`,
  },
  {
    icon: Path,
    title: 'Flexible, customized itineraries',
    text: 'Change dates, hotels and sightseeing pace, or add destinations.',
  },
  {
    icon: MapTrifold,
    title: 'Multi-country specialists',
    text: 'Flights, ferries, hotels, transfers and guides arranged as one journey.',
  },
  {
    icon: UsersThree,
    title: 'Small group and private tours',
    text: 'Choose flexibility or company. Locally arranged guides and transport either way.',
  },
  {
    icon: Headset,
    title: '24/7 local support',
    text: 'Our team helps with flights, transfers and hotels throughout your trip.',
  },
  {
    icon: Buildings,
    title: 'Carefully selected hotels',
    text: 'Chosen for location, cleanliness, comfort, service and traveler feedback.',
  },
];

export function WhyTravel() {
  return (
    <section className="section-y">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
        <div className="reveal shadow-card relative aspect-[4/5] overflow-hidden rounded-lg max-lg:aspect-[16/10]">
          <Photo id="travelers-couple" sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
        <div>
          <h2 className="h-section">Travel deeper with people who know</h2>
          <p className="text-muted mt-3 max-w-xl text-lg">
            From planning to the final day, we make your journey seamless, meaningful and uniquely yours.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <Icon size={32} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                <div>
                  <h3 className="font-sans text-base font-semibold tracking-normal">{title}</h3>
                  <p className="text-muted mt-1 text-[0.95rem]">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function DestinationsRow() {
  return (
    <section className="section-y bg-cream-100/60">
      <div className="container-x">
        <SectionHeading
          title="Explore our destinations"
          description="Extraordinary cultures. Timeless history. Unforgettable experiences."
          link={{ href: '/destinations', label: 'View all destinations' }}
        />
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {destinations.map((d) => (
            <li key={d.id} className="reveal">
              <DestinationTile href={`/destinations/${d.id}`} title={d.name} note={d.tagline} image={d.image} />
            </li>
          ))}
          <li className="reveal">
            <DestinationTile
              href="/multi-country-tours"
              title="Multi-Country"
              note="Many countries, one journey"
              image="santorini-domes"
            />
          </li>
        </ul>
      </div>
    </section>
  );
}

export function WaysToTravel() {
  const tile =
    'group relative block overflow-hidden rounded-lg bg-navy-900 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift';
  const overlay = 'absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent';
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading title="Ways to travel" description="Different travel styles. The same exceptional care." />
        <div className="grid gap-4 lg:grid-cols-5 lg:grid-rows-2">
          <Link href="/private-tours" className={`${tile} reveal min-h-[22rem] lg:col-span-2 lg:row-span-2`}>
            <Photo
              id="greek-ruins-columns"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="transition duration-700 group-hover:scale-105"
            />
            <span aria-hidden className={overlay} />
            <span className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-display block text-3xl font-semibold text-white">Private tours</span>
              <span className="mt-1 block max-w-xs text-white/90">
                Your interests. Your pace. A more personal way to see the world.
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-white">
                Learn more <ArrowRight size={16} weight="bold" aria-hidden />
              </span>
            </span>
          </Link>
          <Link href="/small-group-tours" className={`${tile} reveal min-h-56 lg:col-span-3`}>
            <Photo
              id="small-group-tour"
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="transition duration-700 group-hover:scale-105"
            />
            <span aria-hidden className={overlay} />
            <span className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-display block text-2xl font-semibold text-white">Small group tours</span>
              <span className="mt-1 block text-white/90">Meaningful travel with like-minded explorers.</span>
            </span>
          </Link>
          <Link href="/multi-country-tours" className={`${tile} reveal min-h-56 lg:col-span-3`}>
            <Photo
              id="mykonos"
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="transition duration-700 group-hover:scale-105"
            />
            <span aria-hidden className={overlay} />
            <span className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-display block text-2xl font-semibold text-white">Multi-country tours</span>
              <span className="mt-1 block text-white/90">Diverse cultures and landscapes woven into one trip.</span>
            </span>
          </Link>
        </div>
        <p className="bg-cream-100 text-ink mt-6 flex items-center gap-3 rounded-lg px-5 py-4">
          <Buildings size={24} className="text-gold-600 shrink-0" aria-hidden />
          One team coordinates hotels, guides, flights and transfers across your whole journey.
        </p>
      </div>
    </section>
  );
}

export function FeaturedTours() {
  const picks = [tours[0], tours[2], tours[5]];
  return (
    <section className="section-y bg-cream-100/60">
      <div className="container-x">
        <SectionHeading
          title="Inspiring tours, unforgettable moments"
          description="Handpicked journeys loved by our travelers."
          link={{ href: '/tours', label: 'View all tours' }}
        />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {picks.map((tour) => (
            <li key={tour.slug} className="reveal">
              <TourCard tour={tour} className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function MultiCountryRail() {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading
          title="Several countries, one journey"
          description="Multi-country itineraries across Turkey, Greece, Egypt and Jordan, coordinated by a single team."
          link={{ href: '/multi-country-tours', label: 'See all combinations' }}
        />
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2rem,calc((100%-80rem)/2+2rem))] lg:px-[max(2rem,calc((100%-80rem)/2+2rem))]">
        {combos.map((combo) => (
          <li key={combo.slug} className="w-[82%] shrink-0 snap-start sm:w-[22rem]">
            <ComboCard combo={combo} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HubPreview() {
  const [lead, ...rest] = getArticles();
  const side = rest.slice(0, 2);
  return (
    <section className="section-y bg-cream-100/60">
      <div className="container-x">
        <SectionHeading
          title="From the Travel Hub"
          description="Practical guides and inspiration for planning your trip."
          link={{ href: '/travel-hub', label: 'Explore the Travel Hub' }}
        />
        <div className="grid gap-6 lg:grid-cols-5">
          <Link
            href={`/travel-hub/${lead.slug}`}
            className="group reveal bg-navy-900 shadow-card hover:shadow-lift relative min-h-96 overflow-hidden rounded-lg transition duration-300 lg:col-span-3">
            <Photo
              id={lead.image}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-[50%_80%] transition duration-700 group-hover:scale-105"
            />
            <span
              aria-hidden
              className="from-navy-950/90 via-navy-950/30 absolute inset-0 bg-gradient-to-t to-transparent"
            />
            <span className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <span className="text-gold-100 text-sm font-semibold">Featured: {lead.category}</span>
              <span className="font-display mt-1 block text-3xl font-semibold text-white md:text-4xl">
                {lead.title}
              </span>
              <span className="mt-2 block max-w-lg text-white/90">{lead.description}</span>
              <span className="mt-3 block text-sm text-white/80">{formatDate(lead.date)}</span>
            </span>
          </Link>
          <div className="grid gap-6 lg:col-span-2">
            {side.map((article) => (
              <div key={article.slug} className="reveal">
                <ArticleCard article={article} className="h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection() {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading
          title="Verified guest reviews"
          description="Hear from our guests about their experiences."
          link={{ href: site.tripadvisorUrl, label: `All ${site.stats.reviews} reviews on Tripadvisor` }}
        />
        <ReviewCards />
        <p className="text-muted mt-6 text-center">
          Rated {site.stats.rating} out of 5 on Tripadvisor.{' '}
          <TextLink href="/about" className="ml-1">
            About Magnificent Travel
          </TextLink>
        </p>
      </div>
    </section>
  );
}
