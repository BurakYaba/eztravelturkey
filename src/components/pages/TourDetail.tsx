import { Link } from '@/i18n/link';
import { CalendarBlank, Clock, Translate, UsersThree } from '@phosphor-icons/react/dist/ssr';
import type { TourRecord } from '@/lib/data/types';
import { cn, eur } from '@/lib/utils';
import { Accordion } from '../shared/Accordion';
import type { Crumb } from '../shared/Breadcrumbs';
import { PageBanner } from '../shared/PageBanner';
import { Picture } from '../shared/Picture';
import { QuoteForm } from '../shared/QuoteForm';
import { SectionHeading } from '../shared/SectionHeading';

function List({ items, tone }: { items: string[]; tone?: 'plus' | 'minus' }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className={cn('mt-2 size-1.5 shrink-0 rounded-full', tone === 'minus' ? 'bg-muted' : 'bg-gold-600')}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Interim tour page: every field of the scraped tour, in the old page's order. The final blocks and look come in
 * docs/project-plan.md P3.1.
 */
export function TourDetail({ tour, crumbs }: { tour: TourRecord; crumbs: Crumb[] }) {
  const facts = [
    { label: 'Duration', value: tour.facts.duration, icon: Clock },
    { label: 'Group type', value: tour.facts.groupType, icon: UsersThree },
    { label: 'Guide languages', value: tour.facts.guideLanguages, icon: Translate },
    { label: 'Season', value: tour.facts.season, icon: CalendarBlank },
  ].filter((f) => f.value);
  const more = [
    { label: 'Flights', value: tour.facts.flights },
    { label: 'Difficulty', value: tour.facts.difficulty },
    { label: 'Cancellation', value: tour.facts.cancellation },
    ...tour.extraFacts,
  ].filter((f) => f.value);

  return (
    <>
      <PageBanner
        title={tour.title}
        description={
          tour.priceEUR === null ? (
            tour.facts.duration
          ) : (
            <>
              {tour.facts.duration}. From <strong>{eur(tour.priceEUR)}</strong> per person
            </>
          )
        }
        picture={tour.image}
        crumbs={crumbs}
      />

      <section className="section-y">
        <div className="container-wide grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-12">
            <ul className="grid gap-4 sm:grid-cols-2">
              {facts.map(({ label, value, icon: Icon }) => (
                <li key={label} className="border-cream-200 flex gap-3 rounded-lg border bg-white p-4">
                  <Icon size={26} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-muted text-sm">{label}</p>
                    <p className="text-navy-900 font-semibold">{value}</p>
                  </div>
                </li>
              ))}
            </ul>

            {tour.summary && (
              <section>
                <SectionHeading title="Trip overview" />
                <p className="text-ink/90 max-w-3xl leading-relaxed whitespace-pre-line">{tour.summary}</p>
                {more.length > 0 && (
                  <dl className="border-cream-200 mt-6 divide-y rounded-lg border bg-white">
                    {more.map((f) => (
                      <div key={f.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr]">
                        <dt className="text-muted">{f.label}</dt>
                        <dd className="text-navy-900">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            )}

            {tour.highlights.length > 0 && (
              <section>
                <SectionHeading title="Highlights and route" />
                <List items={tour.highlights} />
              </section>
            )}

            {tour.routeMap.image && (
              <section>
                <SectionHeading title="Route map" />
                {tour.routeMap.intro && <p className="text-muted mb-4 max-w-3xl">{tour.routeMap.intro}</p>}
                <figure className="bg-cream-100 relative max-w-3xl overflow-hidden rounded-lg">
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: `${tour.routeMap.image.width} / ${tour.routeMap.image.height}` }}>
                    <Picture image={tour.routeMap.image} sizes="(min-width: 1024px) 48rem, 100vw" className="object-contain" />
                  </div>
                </figure>
              </section>
            )}

            {tour.itinerary.length > 0 && (
              <section>
                <SectionHeading title="Day-by-day itinerary" />
                <Accordion
                  size="lg"
                  defaultOpen={['day-0']}
                  items={tour.itinerary.map((day, i) => ({
                    id: `day-${i}`,
                    badge: (
                      <span className="bg-navy-900 shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide text-white">
                        {day.dayLabel}
                      </span>
                    ),
                    title: day.title,
                    content: (
                      <div className="space-y-3">
                        <p className="text-ink/90 whitespace-pre-line">{day.text}</p>
                        {day.meals && day.meals !== 'None' && (
                          <p className="text-navy-900 text-sm font-semibold">Meals: {day.meals}</p>
                        )}
                      </div>
                    ),
                  }))}
                />
              </section>
            )}

            {(tour.included.length > 0 || tour.excluded.length > 0) && (
              <section className="grid gap-8 md:grid-cols-2">
                {tour.included.length > 0 && (
                  <div>
                    <h2 className="h-section mb-4">What is included</h2>
                    <List items={tour.included} />
                  </div>
                )}
                {tour.excluded.length > 0 && (
                  <div>
                    <h2 className="h-section mb-4">What is not included</h2>
                    <List items={tour.excluded} tone="minus" />
                  </div>
                )}
              </section>
            )}

            {tour.importantNotes.length > 0 && (
              <section>
                <SectionHeading title="Important notes" />
                <List items={tour.importantNotes} />
              </section>
            )}

            {tour.cancellationPolicy.length > 0 && (
              <section>
                <SectionHeading title="Cancellation policy" />
                <List items={tour.cancellationPolicy} />
              </section>
            )}

            {tour.gallery.length > 1 && (
              <section>
                <SectionHeading title="Gallery" />
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tour.gallery.map((image, i) => (
                    <li key={image.src} className="bg-cream-100 relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Picture image={image} sizes="(min-width: 1024px) 16rem, 50vw" alt={`${tour.title}, photo ${i + 1}`} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tour.faqs.length > 0 && (
              <section>
                <SectionHeading title="Frequently asked questions" />
                <Accordion items={tour.faqs.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
              </section>
            )}

            {tour.related.length > 0 && (
              <section>
                <SectionHeading title="You may also like" />
                <ul className="space-y-2">
                  {tour.related.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href} className="text-navy-900 font-semibold underline underline-offset-4">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside id="enquiry" className="lg:sticky lg:top-24 lg:self-start">
            <QuoteForm variant="sidebar" tour={{ slug: tour.slug, title: tour.title }} />
          </aside>
        </div>
      </section>
    </>
  );
}
