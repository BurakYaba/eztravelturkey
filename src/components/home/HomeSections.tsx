import { Link } from '@/i18n/link';
import { ArrowRight, Buildings, MapTrifold, Path, UsersThree } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { BlogCard } from '../pages/BlogCard';
import { ComboCard } from '../shared/ComboCard';
import { DestinationTile } from '../shared/DestinationTile';
import { Photo } from '../shared/Photo';
import { Picture } from '../shared/Picture';
import { ReviewCards } from '../shared/ReviewCards';
import { ScrollRail } from '../shared/ScrollRail';
import { SectionHeading } from '../shared/SectionHeading';
import { TourCard } from '../tours/TourCard';
import { TextLink } from '../shared/Button';
import { destinations } from '@/data/destinations';
import { getSiteSettings } from '@/lib/data/settings';
import { format, getDictionary } from '@/i18n/dictionaries';
import { multiCountryHref } from '@/i18n/public-paths';
import { getDictionaryForPage, getLocale } from '@/i18n/server';
import { availableCountries, blogPosts, comboCards, featuredTours } from '@/lib/data';

// The trust bar right above already says: since 1997, licensed, 24/7 support. Not repeated here (P3.18).
const reasonIcons: Icon[] = [Path, MapTrifold, UsersThree, Buildings];

export async function WhyTravel() {
  const { ui } = await getDictionaryForPage();
  const t = ui.home.why;
  return (
    <section className="section-y">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
        <div className="reveal shadow-card relative aspect-[4/5] overflow-hidden rounded-lg max-lg:aspect-[16/10]">
          <Photo id="cappadocia-valley" sizes="(min-width: 1024px) 40vw, 100vw" className="object-[80%_75%]" />
        </div>
        <div>
          <h2 className="h-section">{t.title}</h2>
          <p className="text-muted mt-3 max-w-xl text-lg">{t.text}</p>
          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {t.reasons.map(({ title, text }, i) => {
              const Icon = reasonIcons[i] ?? Path;
              return (
                <li key={title} className="flex gap-4">
                  <Icon size={32} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <h3 className="font-sans text-base font-semibold tracking-normal">{title}</h3>
                    <p className="text-muted mt-1 text-[0.95rem]">{text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export async function DestinationsRow() {
  const { ui, countries } = await getDictionaryForPage();
  const t = ui.home.destinations;
  const lang = await getLocale();
  const available = await availableCountries(lang);
  const tiles = destinations.filter((d) => available.includes(d.id));
  // One column per tile on wide screens (the countries plus the multi-country tile), so the row fills the width whatever the number
  // of countries is; Tailwind needs the whole class names here.
  const wide =
    ({ 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' } as Record<number, string>)[tiles.length + 1] ??
    'lg:grid-cols-6';
  return (
    <section className="section-y bg-cream-100/60">
      <div className="container-x">
        <SectionHeading title={t.title} description={t.text} link={{ href: '/destinations', label: t.all }} />
        <ul className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${wide}`}>
          {tiles.map((d) => (
            <li key={d.id} className="reveal">
              <DestinationTile
                href={`/destinations/${d.id}-tours`}
                title={countries[d.id].name}
                note={countries[d.id].tagline}
                image={d.image}
              />
            </li>
          ))}
          <li className="reveal">
            <DestinationTile href={multiCountryHref(lang)} title={t.multi} note={t.multiNote} image="multi-country" />
          </li>
        </ul>
      </div>
    </section>
  );
}

export async function WaysToTravel() {
  const lang = await getLocale();
  const { ui } = await getDictionaryForPage();
  const t = ui.home.ways;
  const tile =
    'group relative block overflow-hidden rounded-lg bg-navy-900 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift';
  const overlay = 'absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent';
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading title={t.title} description={t.text} />
        <div className="grid gap-4 lg:grid-cols-5 lg:grid-rows-2">
          <Link href="/private-tours" className={`${tile} reveal min-h-[22rem] lg:col-span-2 lg:row-span-2`}>
            <Photo
              id="greek-ruins-columns"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="transition duration-700 group-hover:scale-105"
            />
            <span aria-hidden className={overlay} />
            <span className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-display block text-3xl font-semibold text-white">{t.privateTitle}</span>
              <span className="mt-1 block max-w-xs text-white/90">{t.privateText}</span>
              <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-white">
                {t.learnMore} <ArrowRight size={16} weight="bold" aria-hidden />
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
              <span className="font-display block text-2xl font-semibold text-white">{t.smallTitle}</span>
              <span className="mt-1 block text-white/90">{t.smallText}</span>
            </span>
          </Link>
          <Link href={multiCountryHref(lang)} className={`${tile} reveal min-h-56 lg:col-span-3`}>
            <Photo
              id="mykonos"
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="transition duration-700 group-hover:scale-105"
            />
            <span aria-hidden className={overlay} />
            <span className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-display block text-2xl font-semibold text-white">{t.multiTitle}</span>
              <span className="mt-1 block text-white/90">{t.multiText}</span>
            </span>
          </Link>
        </div>
        <p className="bg-cream-100 text-ink mt-6 flex items-center gap-3 rounded-lg px-5 py-4">
          <Buildings size={24} className="text-gold-600 shrink-0" aria-hidden />
          {t.note}
        </p>
      </div>
    </section>
  );
}

export async function FeaturedTours() {
  const lang = await getLocale();
  const [picks, { card, ui }] = [await featuredTours(lang), getDictionary(lang)];
  const t = ui.home.featured;
  if (picks.length === 0) {
    return null;
  }
  return (
    <section className="section-y bg-cream-100/60">
      <div className="container-x">
        <SectionHeading title={t.title} description={t.text} link={{ href: '/tours', label: t.all }} />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {picks.map((tour) => (
            <li key={tour.href} className="reveal">
              <TourCard tour={tour} lang={lang} text={card} className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function MultiCountryRail() {
  const lang = await getLocale();
  const combos = await comboCards(lang);
  const { ui, common } = getDictionary(lang);
  const t = ui.home.multiRail;
  if (combos.length === 0) {
    return null;
  }
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading title={t.title} description={t.text} link={{ href: multiCountryHref(lang), label: t.all }} />
        <ScrollRail previousLabel={common.scrollPrevious} nextLabel={common.scrollNext}>
          {combos.map((combo) => (
            <li
              key={combo.href}
              className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
              <ComboCard combo={combo} className="h-full" />
            </li>
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}

export async function HubPreview() {
  const lang = await getLocale();
  const t = getDictionary(lang).ui.home.hub;
  const [lead, ...rest] = (await blogPosts(lang)).filter((p) => p.image);
  if (!lead) {
    return null;
  }
  const side = rest.slice(0, 2);
  return (
    <section className="section-y bg-cream-100/60">
      <div className="container-x">
        <SectionHeading title={t.title} description={t.text} link={{ href: '/blog', label: t.all }} />
        <div className="grid gap-6 lg:grid-cols-5">
          <Link
            href={lead.href}
            className="group reveal bg-navy-900 shadow-card hover:shadow-lift relative min-h-96 overflow-hidden rounded-lg transition duration-300 lg:col-span-3">
            {lead.image && (
              <Picture
                image={lead.image}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="transition duration-700 group-hover:scale-105"
              />
            )}
            <span
              aria-hidden
              className="from-navy-950/90 via-navy-950/30 absolute inset-0 bg-gradient-to-t to-transparent"
            />
            <span className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <span className="text-gold-100 text-sm font-semibold capitalize">
                {format(t.featured, { topic: lead.path.split('/')[1] ?? '' })}
              </span>
              <span className="font-display mt-1 block text-3xl font-semibold text-white md:text-4xl">
                {lead.title}
              </span>
              <span className="mt-2 block max-w-lg text-white/90">{lead.metaDescription}</span>
            </span>
          </Link>
          <div className="grid gap-6 lg:col-span-2">
            {side.map((post) => (
              <div key={post.path} className="reveal">
                <BlogCard post={post} className="h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export async function ReviewsSection() {
  const { ui } = await getDictionaryForPage();
  const site = await getSiteSettings(await getLocale());
  const t = ui.home.reviews;
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading
          title={t.title}
          description={t.text}
          link={{ href: site.tripadvisorUrl, label: format(t.all, { count: site.stats.reviews }) }}
        />
        <ReviewCards />
        <p className="text-muted mt-6 text-center">
          {format(t.rated, { rating: site.stats.rating })}{' '}
          <TextLink href="/about" className="ml-1">
            {t.about}
          </TextLink>
        </p>
      </div>
    </section>
  );
}
