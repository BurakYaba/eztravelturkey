import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Boat,
  Check,
  CompassRose,
  HandHeart,
  IdentificationCard,
  Info,
  MinusCircle,
  PersonSimpleWalk,
  SealCheck,
  ShieldCheck,
  Star,
  Suitcase,
  AirplaneTilt,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { countryName } from '@/data/destinations';
import { img } from '@/data/images';
import { site } from '@/data/site';
import type { Tour } from '@/data/types';
import { Accordion } from '../shared/Accordion';
import { Photo } from '../shared/Photo';
import { ReviewCards } from '../shared/ReviewCards';
import { SectionHeading } from '../shared/SectionHeading';

const styleText = (tour: Tour) =>
  tour.styles.length > 1 ? 'Private or small group' : tour.styles[0] === 'private' ? 'Private' : 'Small group';

export function TripGlance({ tour }: { tour: Tour }) {
  const items = [
    ['Duration', `${tour.nights} nights, ${tour.days} days`],
    ['Countries', tour.countries.map(countryName).join(', ')],
    ['Route', tour.route.join(', ')],
    ['Travel style', styleText(tour)],
    ['Physical level', tour.difficulty],
    ['Season', tour.season],
    ['Guide', tour.guideLanguages.join(' or ')],
    ['Transport', tour.flights],
    ['Hotels', tour.hotels],
  ];
  return (
    <div className="bg-cream-100 rounded-lg p-5 md:p-6">
      <h3 className="text-2xl">Trip at a glance</h3>
      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-gold-700 text-sm font-semibold">{label}</dt>
            <dd className="text-ink mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function StopsGrid({ tour }: { tour: Tour }) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tour.stops.map((stop) => (
        <li key={stop.name} className="bg-navy-900 shadow-card relative aspect-[3/4] overflow-hidden rounded-lg">
          <Photo id={stop.image} sizes="(min-width: 1024px) 200px, 50vw" />
          <span
            aria-hidden
            className="from-navy-950/90 via-navy-950/20 absolute inset-0 bg-gradient-to-t to-transparent"
          />
          <span className="absolute inset-x-0 bottom-0 p-4">
            <span className="font-display block text-xl font-semibold text-white">{stop.name}</span>
            <span className="block text-sm text-white/90">{stop.blurb}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const whyIcons: Icon[] = [CompassRose, HandHeart, SealCheck, Sparkle];

export function WhyChoose({ tour }: { tour: Tour }) {
  const extra = tour.gallery.filter((id) => !tour.stops.some((stop) => stop.image === id) && id !== tour.image);
  return (
    <div className="mt-12">
      <h3 className="text-2xl">Why choose this journey</h3>
      <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {tour.whyChoose.map((item, i) => {
          const Glyph = whyIcons[i % whyIcons.length];
          return (
            <li key={item.title} className="flex gap-4">
              <Glyph size={36} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
              <div>
                <h4 className="font-sans text-base font-semibold tracking-normal">{item.title}</h4>
                <p className="text-muted mt-1">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {extra.length >= 2 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {extra.slice(0, 2).map((id) => (
            <div key={id} className="shadow-card relative aspect-[4/3] overflow-hidden rounded-lg">
              <Photo id={id} sizes="(min-width: 1024px) 380px, 100vw" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ItinerarySection({ tour }: { tour: Tour }) {
  return (
    <section id="itinerary" className="scroll-mt-40 pt-14">
      <SectionHeading title="Day-by-day itinerary" as="h2" className="mb-6" />
      <Accordion
        size="lg"
        defaultOpen={[tour.itinerary[0] ? 'day-0' : '']}
        items={tour.itinerary.map((d, i) => ({
          id: `day-${i}`,
          badge: (
            <span className="bg-gold-100 font-display text-gold-700 grid size-11 shrink-0 place-items-center rounded-lg text-center text-base leading-tight font-bold">
              {d.day.replace(/^Days? /, '').replace(' to ', '-')}
            </span>
          ),
          title: (
            <span>
              <span className="text-navy-900 block">{d.title}</span>
              <span className="text-muted mt-0.5 block text-sm font-normal">{d.day}</span>
            </span>
          ),
          content: (
            <div className="space-y-3">
              <p className="text-ink">{d.text}</p>
              <p className="text-sm">
                <strong className="text-navy-900">Meals:</strong> {d.meals}
                {d.overnight && (
                  <>
                    <span className="text-cream-200 mx-2">|</span>
                    <strong className="text-navy-900">Overnight:</strong> {d.overnight}
                  </>
                )}
              </p>
            </div>
          ),
        }))}
      />
    </section>
  );
}

export function InclusionsSection({ tour }: { tour: Tour }) {
  return (
    <section id="inclusions" className="scroll-mt-40 pt-14">
      <SectionHeading title="Inclusions and exclusions" as="h2" className="mb-6" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="border-cream-200 shadow-card rounded-lg border bg-white p-5">
          <h3 className="flex items-center gap-2 font-sans text-lg font-semibold tracking-normal">
            <ShieldCheck size={24} weight="fill" className="text-gold-600" aria-hidden />
            What is included
          </h3>
          <ul className="mt-4 space-y-3">
            {tour.included.map((item) => (
              <li key={item} className="flex gap-3">
                <Check size={20} weight="bold" className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-cream-200 shadow-card rounded-lg border bg-white p-5">
          <h3 className="flex items-center gap-2 font-sans text-lg font-semibold tracking-normal">
            <MinusCircle size={24} weight="fill" className="text-navy-700" aria-hidden />
            What is not included
          </h3>
          <ul className="mt-4 space-y-3">
            {tour.excluded.map((item) => (
              <li key={item} className="flex gap-3">
                <MinusCircle size={20} className="text-navy-700 mt-0.5 shrink-0" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const requirementIcon = (title: string): Icon => {
  const t = title.toLowerCase();
  if (t.includes('passport') || t.includes('visa')) {
    return IdentificationCard;
  }
  if (t.includes('flight')) {
    return AirplaneTilt;
  }
  if (t.includes('ferr') || t.includes('sail')) {
    return Boat;
  }
  if (t.includes('walk')) {
    return PersonSimpleWalk;
  }
  if (t.includes('insurance')) {
    return ShieldCheck;
  }
  if (t.includes('luggage')) {
    return Suitcase;
  }
  return Info;
};

export function RequirementsSection({ tour }: { tour: Tour }) {
  return (
    <section id="requirements" className="scroll-mt-40 pt-14">
      <SectionHeading title="Trip requirements and practical information" as="h2" className="mb-6" />
      <ul className="grid gap-4 sm:grid-cols-2">
        {tour.requirements.map((r) => {
          const Glyph = requirementIcon(r.title);
          return (
            <li key={r.title} className="bg-cream-100 flex gap-4 rounded-lg p-4">
              <Glyph size={30} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
              <div>
                <h3 className="font-sans text-base font-semibold tracking-normal">{r.title}</h3>
                <p className="text-muted mt-1 text-[0.95rem]">{r.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function TourFaqs({ tour }: { tour: Tour }) {
  return (
    <section id="faqs" className="scroll-mt-40 pt-14">
      <SectionHeading
        title="Frequently asked questions"
        as="h2"
        className="mb-6"
        link={{ href: '/faq', label: 'View all FAQs' }}
      />
      <Accordion items={tour.faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
    </section>
  );
}

export function TourReviews() {
  const picture = img('ephesus');
  return (
    <section id="reviews" className="scroll-mt-40 pt-14">
      <SectionHeading title="Reviews" as="h2" className="mb-6" />
      <div className="border-cream-200 shadow-card relative overflow-hidden rounded-lg border bg-white">
        <div className="grid items-center md:grid-cols-[1fr_1fr]">
          <div className="p-6 md:p-8">
            <p className="text-gold-500 flex items-center gap-1" role="img" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} weight="fill" aria-hidden />
              ))}
            </p>
            <p className="text-ink mt-3 text-lg">
              Read traveler reviews for {site.name} on Tripadvisor. Rated {site.stats.rating} out of 5 across{' '}
              {site.stats.reviews} reviews.
            </p>
            <a
              href={site.tripadvisorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-900 decoration-gold-500/60 mt-4 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
              View on Tripadvisor <ArrowUpRight size={16} weight="bold" aria-hidden />
            </a>
          </div>
          <div className="relative hidden h-full min-h-44 md:block">
            <Photo id="ephesus" sizes="320px" alt={picture.alt} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <ReviewCards />
      </div>
    </section>
  );
}

export function RelatedLinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-navy-900 decoration-gold-500/60 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
      {label} <ArrowRight size={16} weight="bold" aria-hidden />
    </Link>
  );
}
