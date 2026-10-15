import { Link } from '@/i18n/link';
import {
  CalendarBlank,
  Clock,
  Compass,
  MapPin,
  Translate,
  Star,
  UsersThree,
  WhatsappLogo,
} from '@phosphor-icons/react/dist/ssr';
import { site, whatsappLink } from '@/data/site';
import { format, getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';
import type { TourRecord } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { Accordion } from '../shared/Accordion';
import type { Crumb } from '../shared/Breadcrumbs';
import { ButtonAnchor, ButtonLink } from '../shared/Button';
import { PageBanner } from '../shared/PageBanner';
import { Picture } from '../shared/Picture';
import { QuoteForm } from '../shared/QuoteForm';
import { SectionHeading } from '../shared/SectionHeading';
import { TourPrice } from '../tours/TourPrice';

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
 * The tour page. The blocks and their order are fixed in code (D37): an editor changes the content, not the layout.
 * The order follows the client's "Tour Page Structure" (Ek D.2): overview with the facts and the price, itinerary,
 * inclusions, practical information, FAQs, reviews. Blocks without content are left out. Everything is in the first
 * HTML, so the sticky bar at the top is a plain set of links (H.2).
 */
export async function TourDetail({ tour, crumbs }: { tour: TourRecord; crumbs: Crumb[] }) {
  const lang = await getLocale();
  const { tour: t, card } = getDictionary(lang);

  const style = tour.styles.length > 1 ? card.either : tour.styles[0] === 'private' ? t.style.private : t.style.smallGroup;
  const glance = [
    { label: t.glance.duration, value: tour.facts.duration, icon: Clock },
    { label: t.glance.route, value: tour.route.join(' · '), icon: MapPin },
    { label: t.glance.style, value: tour.facts.groupType ? style : '', icon: UsersThree },
    { label: t.glance.guide, value: tour.facts.guideLanguages, icon: Translate },
    { label: t.glance.season, value: tour.facts.season, icon: CalendarBlank },
  ].filter((f) => f.value);
  const practical = [
    { label: t.practical.flights, value: tour.facts.flights },
    { label: t.practical.difficulty, value: tour.facts.difficulty },
    { label: t.practical.cancellation, value: tour.facts.cancellation },
    ...tour.extraFacts,
  ].filter((f) => f.value);
  const hasPrice = tour.priceEUR !== null || tour.priceUSD !== null;
  const hasInclusions = tour.included.length > 0 || tour.excluded.length > 0;
  const hasPolicies = tour.importantNotes.length > 0 || tour.cancellationPolicy.length > 0;

  const sections = [
    { id: 'overview', label: t.tabs.overview, show: true },
    { id: 'itinerary', label: t.tabs.itinerary, show: tour.itinerary.length > 0 },
    { id: 'inclusions', label: t.tabs.inclusions, show: hasInclusions || hasPolicies },
    { id: 'faqs', label: t.tabs.faqs, show: tour.faqs.length > 0 },
    { id: 'reviews', label: t.tabs.reviews, show: true },
  ].filter((s) => s.show);

  return (
    <>
      <PageBanner
        title={tour.title}
        description={tour.facts.duration}
        picture={tour.image}
        crumbs={crumbs}
        actions={
          <>
            <ButtonLink href="#enquiry" arrow>
              {t.cta.quote}
            </ButtonLink>
            <ButtonAnchor
              href={whatsappLink(format(card.whatsappAsk, { tour: tour.title }))}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary">
              <WhatsappLogo size={20} weight="fill" aria-hidden />
              {t.cta.whatsapp}
            </ButtonAnchor>
          </>
        }
      />

      <nav
        aria-label={t.sectionsLabel}
        className="border-cream-200 bg-cream-50/95 supports-backdrop-filter:bg-cream-50/85 sticky top-20 z-40 border-b backdrop-blur">
        <ul className="container-wide flex gap-1 overflow-x-auto whitespace-nowrap">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-navy-900 hover:border-gold-600 block border-b-2 border-transparent px-4 py-3.5 text-sm font-semibold transition">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="section-y">
        <div className="container-wide grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-14">
            <section id="overview" className="scroll-mt-36 space-y-10">
              <div>
                <SectionHeading title={t.overview} className="mb-5 md:mb-6" />
                {tour.summary && (
                  <p className="text-ink/90 max-w-3xl leading-relaxed whitespace-pre-line">{tour.summary}</p>
                )}
              </div>

              {glance.length > 0 && (
                <div className="border-cream-200 bg-cream-50 rounded-lg border p-5 md:p-6">
                  <h3 className="mb-4 text-2xl">{t.glance.title}</h3>
                  <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {glance.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex gap-3">
                        <Icon size={26} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                        <div className="min-w-0">
                          <dt className="text-muted text-sm">{label}</dt>
                          <dd className="text-navy-900 font-semibold">{value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="border-cream-200 rounded-lg border bg-white p-5 md:p-6">
                <h3 className="mb-3 text-2xl">{t.price.title}</h3>
                <TourPrice lang={lang} eur={tour.priceEUR} usd={tour.priceUSD} text={{ ...t.price, ...card }} size="page" />
                {hasPrice && <p className="text-muted mt-3 max-w-2xl text-sm">{t.price.note}</p>}
                {tour.priceNote && <p className="text-navy-900 mt-1 text-sm font-medium">{tour.priceNote}</p>}
                {tour.departures.length > 0 && (
                  <div className="border-cream-200 mt-4 border-t pt-4">
                    <p className="text-navy-900 mb-2 text-sm font-semibold">{t.price.departures}</p>
                    <List items={tour.departures} />
                  </div>
                )}
              </div>

              {tour.highlights.length > 0 && (
                <div>
                  <h3 className="mb-4 text-2xl">{t.highlights}</h3>
                  <List items={tour.highlights} />
                </div>
              )}

              {tour.routeMap.image && (
                <div>
                  <h3 className="mb-4 text-2xl">{t.routeMap}</h3>
                  {tour.routeMap.intro && <p className="text-muted mb-4 max-w-3xl">{tour.routeMap.intro}</p>}
                  <figure className="bg-cream-100 relative max-w-3xl overflow-hidden rounded-lg">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: `${tour.routeMap.image.width} / ${tour.routeMap.image.height}` }}>
                      <Picture
                        image={tour.routeMap.image}
                        sizes="(min-width: 1024px) 48rem, 100vw"
                        className="object-contain"
                      />
                    </div>
                  </figure>
                </div>
              )}

              {tour.gallery.length > 1 && (
                <div>
                  <h3 className="mb-4 text-2xl">{t.gallery}</h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {tour.gallery.map((image, i) => (
                      <li key={image.src} className="bg-cream-100 relative aspect-4/3 overflow-hidden rounded-lg">
                        <Picture
                          image={image}
                          sizes="(min-width: 1024px) 16rem, 50vw"
                          alt={format(t.photo, { title: tour.title, n: i + 1 })}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {tour.itinerary.length > 0 && (
              <section id="itinerary" className="scroll-mt-36 space-y-10">
                <div>
                  <SectionHeading title={t.itinerary} />
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
                            <p className="text-navy-900 text-sm font-semibold">{format(t.meals, { meals: day.meals })}</p>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </div>

                {tour.hotels.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-2xl">{t.hotels.title}</h3>
                    <div className="border-cream-200 overflow-x-auto rounded-lg border bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-cream-50 text-navy-900">
                          <tr>
                            <th scope="col" className="px-4 py-3 font-semibold">
                              {t.hotels.city}
                            </th>
                            <th scope="col" className="px-4 py-3 font-semibold">
                              {t.hotels.nights}
                            </th>
                            <th scope="col" className="px-4 py-3 font-semibold">
                              {t.hotels.hotel}
                            </th>
                            <th scope="col" className="px-4 py-3 font-semibold">
                              {t.hotels.category}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-cream-200 divide-y">
                          {tour.hotels.map((stay, i) => (
                            <tr key={i}>
                              <th scope="row" className="text-navy-900 px-4 py-3 font-semibold">
                                {stay.city}
                              </th>
                              <td className="px-4 py-3">{stay.nights ?? ''}</td>
                              <td className="px-4 py-3">{stay.name}</td>
                              <td className="px-4 py-3">{stay.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}

            {(hasInclusions || hasPolicies) && (
              <section id="inclusions" className="scroll-mt-36 space-y-10">
                {hasInclusions && (
                  <div className="grid gap-8 md:grid-cols-2">
                    {tour.included.length > 0 && (
                      <div>
                        <h2 className="h-section mb-4">{t.included}</h2>
                        <List items={tour.included} />
                      </div>
                    )}
                    {tour.excluded.length > 0 && (
                      <div>
                        <h2 className="h-section mb-4">{t.excluded}</h2>
                        <List items={tour.excluded} tone="minus" />
                      </div>
                    )}
                  </div>
                )}
                {tour.importantNotes.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-2xl">{t.notes}</h3>
                    <List items={tour.importantNotes} />
                  </div>
                )}
                {tour.cancellationPolicy.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-2xl">{t.cancellation}</h3>
                    <List items={tour.cancellationPolicy} />
                  </div>
                )}
              </section>
            )}

            {tour.faqs.length > 0 && (
              <section id="faqs" className="scroll-mt-36">
                <SectionHeading title={t.faqs} />
                <Accordion items={tour.faqs.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
              </section>
            )}

            <section id="reviews" className="scroll-mt-36">
              <SectionHeading title={t.reviews.title} />
              <div className="border-cream-200 flex flex-wrap items-center gap-5 rounded-lg border bg-white p-5 md:p-6">
                <Star size={40} weight="fill" className="text-gold-600 shrink-0" aria-hidden />
                <p className="text-ink/90 min-w-0 flex-1 basis-64">{t.reviews.text}</p>
                <ButtonAnchor href={site.tripadvisorUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                  {t.reviews.link}
                </ButtonAnchor>
              </div>
            </section>

            {tour.related.length > 0 && (
              <section>
                <SectionHeading title={t.related} />
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

          <aside id="enquiry" className="scroll-mt-36 space-y-6">
            <QuoteForm variant="sidebar" tour={{ slug: tour.slug, title: tour.title }} />
            {practical.length > 0 && (
              <div className="border-cream-200 bg-cream-50 rounded-lg border p-5">
                <h2 className="mb-3 text-xl">{t.practical.title}</h2>
                <dl className="divide-cream-200 divide-y text-sm">
                  {practical.map((f) => (
                    <div key={f.label} className="py-2.5">
                      <dt className="text-muted">{f.label}</dt>
                      <dd className="text-navy-900 font-medium">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3">
                  <Link href="/contact" className="text-navy-900 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
                    <Compass size={18} aria-hidden />
                    {t.practical.ask}
                  </Link>
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
