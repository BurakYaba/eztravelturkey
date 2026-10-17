import { Link } from '@/i18n/link';
import {
  AirplaneTilt,
  CalendarBlank,
  Check,
  Clock,
  IdentificationCard,
  Info,
  MapPin,
  MinusCircle,
  PersonSimpleWalk,
  ShieldCheck,
  Translate,
  UsersThree,
  WhatsappLogo,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { paymentSummary, travelRules } from '@/data/policies';
import { whatsappLink } from '@/data/site';
import { format, getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';
import type { TourRecord } from '@/lib/data/types';
import { Accordion } from '../shared/Accordion';
import type { Crumb } from '../shared/Breadcrumbs';
import { ButtonAnchor, ButtonLink } from '../shared/Button';
import { PageBanner } from '../shared/PageBanner';
import { Picture } from '../shared/Picture';
import { QuoteForm } from '../shared/QuoteForm';
import { SectionHeading } from '../shared/SectionHeading';
import { TourGallery } from '../tours/TourGallery';
import { TourPanel } from '../tours/TourPanel';
import { TourPrice } from '../tours/TourPrice';
import { TourTabs, TourTabsProvider } from '../tours/TourTabs';

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="bg-gold-600 mt-2 size-1.5 shrink-0 rounded-full" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const ruleIcon: Record<string, Icon> = { passport: IdentificationCard, insurance: ShieldCheck };

/**
 * The tour page. The sections and their order are fixed in code (D37): an editor changes the content, not the layout.
 * The sections follow the client's tab strip (Overview, Itinerary, Inclusions, Trip Requirements, FAQs, Route Map,
 * Payment Summary, Trip Cancellation Terms). From lg up they are tabs and only the chosen one shows; on phones they
 * are accordion panels. All of it is in the first HTML either way (H.2). Sections without content are left out.
 * There is no reviews tab: the live tour pages carry no reviews of their own, only the Tripadvisor badge in the footer.
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
  // Facts the old page printed that belong with the practical rules.
  const practical = [
    { label: t.practical.flights, value: tour.facts.flights, icon: AirplaneTilt },
    { label: t.practical.difficulty, value: tour.facts.difficulty, icon: PersonSimpleWalk },
    ...tour.extraFacts.map((f) => ({ ...f, icon: Info })),
  ].filter((f) => f.value);
  const hasInclusions = tour.included.length > 0 || tour.excluded.length > 0;
  const hasPrice = tour.priceEUR !== null || tour.priceUSD !== null;
  // The old pages mix sentences about the price ("Prices are per person, based on a minimum of ...") into the notes.
  // They move to the price tab word for word; the other notes stay where they were.
  const isPriceNote = (note: string) => /^prices?/i.test(note);
  const priceNotes = tour.importantNotes.filter(isPriceNote);
  const otherNotes = tour.importantNotes.filter((note) => !isPriceNote(note));

  const tabs = [
    { id: 'overview', label: t.tabs.overview },
    ...(tour.itinerary.length > 0 ? [{ id: 'itinerary', label: t.tabs.itinerary }] : []),
    ...(hasInclusions ? [{ id: 'inclusions', label: t.tabs.inclusions }] : []),
    { id: 'requirements', label: t.tabs.requirements },
    ...(tour.faqs.length > 0 ? [{ id: 'faqs', label: t.tabs.faqs }] : []),
    ...(tour.routeMap.image ? [{ id: 'route-map', label: t.tabs.routeMap }] : []),
    { id: 'price', label: t.tabs.price },
    { id: 'payment', label: t.tabs.payment },
    { id: 'cancellation', label: t.tabs.cancellation },
  ];
  const label = (id: string) => tabs.find((tab) => tab.id === id)?.label ?? '';

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

      <TourTabsProvider tabs={tabs}>
        <TourTabs tabs={tabs} label={t.sectionsLabel} />

        <div className="container-wide grid gap-10 pb-16 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div id="tour-panels" className="min-w-0 max-lg:pt-6 lg:min-h-136">
            <TourPanel id="overview" label={label('overview')} defaultOpen className="max-lg:mt-0">
              <SectionHeading title={t.overview} className="mb-5 md:mb-6 max-lg:hidden" />
              {tour.summary && (
                <p className="text-ink/90 max-w-3xl leading-relaxed whitespace-pre-line">{tour.summary}</p>
              )}

              {glance.length > 0 && (
                <div className="border-cream-200 bg-cream-50 mt-8 rounded-lg border p-5 md:p-6">
                  <h3 className="mb-4 text-2xl">{t.glance.title}</h3>
                  <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {glance.map(({ label: name, value, icon: Glyph }) => (
                      <li key={name} className="flex gap-3">
                        <Glyph size={26} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                        <span className="min-w-0">
                          <span className="text-muted block text-sm">{name}</span>
                          <span className="text-navy-900 block font-semibold">{value}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.highlights.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-2xl">{t.highlights}</h3>
                  <Bullets items={tour.highlights} />
                </div>
              )}

              {tour.gallery.length > 1 && (
                <div className="mt-10">
                  <h3 className="mb-4 text-2xl">{t.gallery}</h3>
                  <TourGallery images={tour.gallery} title={tour.title} text={t.lightbox} photoLabel={t.photo} />
                </div>
              )}
            </TourPanel>

            {tour.itinerary.length > 0 && (
              <TourPanel id="itinerary" label={label('itinerary')} defaultOpen>
                <SectionHeading title={t.itinerary} className="mb-6 max-lg:hidden" />
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

                {tour.hotels.length > 0 && (
                  <div className="mt-10">
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
              </TourPanel>
            )}

            {hasInclusions && (
              <TourPanel id="inclusions" label={label('inclusions')}>
                <SectionHeading title={t.tabs.inclusions} className="mb-6 max-lg:hidden" />
                <div className="grid gap-5 md:grid-cols-2">
                  {tour.included.length > 0 && (
                    <div className="border-cream-200 shadow-card rounded-lg border bg-white p-5">
                      <h3 className="flex items-center gap-2 font-sans text-lg font-semibold tracking-normal">
                        <ShieldCheck size={24} weight="fill" className="text-gold-600" aria-hidden />
                        {t.included}
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {tour.included.map((item, i) => (
                          <li key={i} className="flex gap-3">
                            <Check size={20} weight="bold" className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.excluded.length > 0 && (
                    <div className="border-cream-200 shadow-card rounded-lg border bg-white p-5">
                      <h3 className="flex items-center gap-2 font-sans text-lg font-semibold tracking-normal">
                        <MinusCircle size={24} weight="fill" className="text-navy-700" aria-hidden />
                        {t.excluded}
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {tour.excluded.map((item, i) => (
                          <li key={i} className="flex gap-3">
                            <MinusCircle size={20} className="text-navy-700 mt-0.5 shrink-0" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TourPanel>
            )}

            <TourPanel id="requirements" label={label('requirements')}>
              <SectionHeading title={t.requirements.title} className="mb-6 max-lg:hidden" />
              <ul className="grid gap-4 sm:grid-cols-2">
                {practical.map(({ label: name, value, icon: Glyph }) => (
                  <li key={name} className="bg-cream-100 flex gap-4 rounded-lg p-4">
                    <Glyph size={30} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <h3 className="font-sans text-base font-semibold tracking-normal">{name}</h3>
                      <p className="text-muted mt-1 text-[0.95rem]">{value}</p>
                    </div>
                  </li>
                ))}
                {travelRules.map((rule) => {
                  const Glyph = ruleIcon[rule.kind] ?? Info;
                  return (
                    <li key={rule.kind} className="bg-cream-100 flex gap-4 rounded-lg p-4 sm:col-span-2">
                      <Glyph size={30} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                      <div>
                        <h3 className="font-sans text-base font-semibold tracking-normal">{rule.title}</h3>
                        <p className="text-muted mt-1 text-[0.95rem]">{rule.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {otherNotes.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-2xl">{t.requirements.notes}</h3>
                  <Bullets items={otherNotes} />
                </div>
              )}
            </TourPanel>

            {tour.faqs.length > 0 && (
              <TourPanel id="faqs" label={label('faqs')}>
                <SectionHeading title={t.faqs} className="mb-6 max-lg:hidden" />
                <Accordion items={tour.faqs.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
              </TourPanel>
            )}

            {tour.routeMap.image && (
              <TourPanel id="route-map" label={label('route-map')}>
                <SectionHeading title={t.routeMap} className="mb-6 max-lg:hidden" />
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
              </TourPanel>
            )}

            <TourPanel id="price" label={label('price')}>
              <SectionHeading title={t.price.title} className="mb-6 max-lg:hidden" />
              <div className="border-cream-200 shadow-card rounded-lg border bg-white p-5 md:p-6">
                <TourPrice
                  lang={lang}
                  eur={tour.priceEUR}
                  usd={tour.priceUSD}
                  text={{ ...t.price, ...card }}
                  size="page"
                />
                {hasPrice && <p className="text-muted mt-3 max-w-2xl text-sm">{t.price.note}</p>}
                {tour.priceNote && <p className="text-navy-900 mt-1 text-sm font-medium">{tour.priceNote}</p>}
                <ButtonLink href="#enquiry" arrow className="mt-5">
                  {t.cta.quote}
                </ButtonLink>
              </div>
              {tour.facts.season && (
                <div className="bg-cream-100 mt-5 flex gap-4 rounded-lg p-4">
                  <CalendarBlank size={30} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <h3 className="font-sans text-base font-semibold tracking-normal">{t.price.season}</h3>
                    <p className="text-muted mt-1 text-[0.95rem]">{tour.facts.season}</p>
                  </div>
                </div>
              )}
              {tour.departures.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-2xl">{t.price.departures}</h3>
                  <Bullets items={tour.departures} />
                </div>
              )}
              {priceNotes.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-2xl">{t.price.notes}</h3>
                  <Bullets items={priceNotes} />
                </div>
              )}
            </TourPanel>

            <TourPanel id="payment" label={label('payment')}>
              <SectionHeading title={t.payment.title} className="mb-6 max-lg:hidden" />
              <ul className="grid gap-4 sm:grid-cols-3">
                {paymentSummary.map((step) => (
                  <li key={step.label} className="border-cream-200 shadow-card rounded-lg border bg-white p-5">
                    <p className="text-gold-700 text-sm font-semibold">{step.label}</p>
                    <p className="font-display text-navy-900 mt-1 text-2xl font-semibold">{step.value}</p>
                    <p className="text-muted mt-2 text-[0.95rem]">{step.text}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5">
                <Link href="/gdpr/terms-conditions" className="text-navy-900 font-semibold underline underline-offset-4">
                  {t.payment.terms}
                </Link>
              </p>
            </TourPanel>

            <TourPanel id="cancellation" label={label('cancellation')}>
              <SectionHeading title={t.cancel.title} className="mb-6 max-lg:hidden" />
              {tour.facts.cancellation && (
                <p className="text-navy-900 mb-4 text-lg font-semibold">{tour.facts.cancellation}</p>
              )}
              {tour.cancellationPolicy.length > 0 ? (
                <Bullets items={tour.cancellationPolicy} />
              ) : (
                !tour.facts.cancellation && <p className="text-muted">{t.cancel.none}</p>
              )}
              <p className="mt-5">
                <Link href="/gdpr/terms-conditions" className="text-navy-900 font-semibold underline underline-offset-4">
                  {t.cancel.terms}
                </Link>
              </p>
            </TourPanel>
          </div>

          <aside id="enquiry" className="scroll-mt-40 lg:self-start lg:pt-10">
            <div className="space-y-5 lg:sticky lg:top-40 lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:pr-1">
              <div className="bg-navy-900 rounded-lg p-5 text-white">
                <TourPrice
                  lang={lang}
                  eur={tour.priceEUR}
                  usd={tour.priceUSD}
                  text={{ ...t.price, ...card }}
                  size="page"
                  tone="dark"
                />
                {hasPrice && (
                  <p className="mt-2 text-sm text-white/80">{t.price.note}</p>
                )}
                {tour.priceNote && <p className="mt-1 text-sm font-medium text-white">{tour.priceNote}</p>}
                {tour.departures.length > 0 && (
                  <div className="mt-4 border-t border-white/15 pt-4 text-sm">
                    <p className="text-gold-100 mb-1 font-semibold">{t.price.departures}</p>
                    <ul className="space-y-1 text-white/90">
                      {tour.departures.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <QuoteForm variant="sidebar" tour={{ slug: tour.slug, title: tour.title }} />
            </div>
          </aside>
        </div>
      </TourTabsProvider>

      {tour.related.length > 0 && (
        <section className="section-y border-cream-200 bg-cream-100/60 border-t">
          <div className="container-wide">
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
          </div>
        </section>
      )}
    </>
  );
}
