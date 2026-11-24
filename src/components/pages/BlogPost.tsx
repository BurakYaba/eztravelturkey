import Image from 'next/image';
import { Link } from '@/i18n/link';
import { Lightbulb } from '@phosphor-icons/react/dist/ssr';
import type { ImageId } from '@/data/images';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';
import { format } from '@/i18n/template';
import { combinationHref } from '@/i18n/public-paths';
import { blogContext, type PageRecord } from '@/lib/data';
import { Accordion } from '../shared/Accordion';
import type { Crumb } from '../shared/Breadcrumbs';
import { TextLink } from '../shared/Button';
import { PageBanner } from '../shared/PageBanner';
import { SectionHeading } from '../shared/SectionHeading';
import { TourCard } from '../tours/TourCard';
import { BlogCard } from './BlogCard';
import { PageSections } from './PageSections';

/** Stock banner photo of each country, for posts whose own picture is shown in the text instead. */
const bannerPhoto: Record<string, ImageId> = {
  turkey: 'istanbul-skyline',
  greece: 'santorini-sunset',
  egypt: 'giza-pyramids',
  jordan: 'petra-treasury',
  morocco: 'marrakech-souk',
};

/**
 * A blog post. The text and pictures of the old post are shown as they were (D12). Around them the page adds what a
 * reader and a search engine look for: who wrote it, when it was last checked, the short answer when the editor wrote
 * one, tours and further guides about the same country. Nothing is shown that the post does not have: no author means
 * the company is credited, no date means no date line.
 */
export async function BlogPost({ page, crumbs }: { page: PageRecord; crumbs: Crumb[] }) {
  const lang = await getLocale();
  const dict = getDictionary(lang);
  const { blog: t, card, countries } = dict;

  // What the post is about comes from the countries ticked in the Studio (post, then category), not from the folder in its address: a
  // category about two countries, or a post moved between categories, keeps its tours and guides.
  const folder = page.path.split('/')[1] ?? '';
  const { countries: countryIds, maps, tours, guides } = await blogContext(lang, page.path);
  const country = countryIds.map((id) => countries[id as keyof typeof countries]?.name).filter(Boolean).join(t.countryJoin);
  const toursHref = countryIds.length === 1 ? `/destinations/${countryIds[0]}-tours` : combinationHref(lang, countryIds);

  const isMap = (page.path.split('/').pop() ?? '').startsWith('map-of-');
  const byline = page.author
    ? format(t.byline, { name: page.author.name })
    : format(t.byline, { name: t.organization });
  const description = [
    byline,
    page.updated && !page.updated.inText ? format(t.updated, { date: page.updated.label }) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <PageBanner
        title={page.title}
        description={description}
        // A map is the content of its post, so it is shown whole in the text, not cropped into the banner.
        {...(isMap ? { image: bannerPhoto[folder] ?? 'hero-istanbul' } : { picture: page.image })}
        crumbs={crumbs}
      />
      <article className="section-y" data-track-placement="body">
        <div className="container-x max-w-3xl">
          {page.shortAnswer && (
            <aside className="border-gold-500/40 bg-cream-50 mb-10 flex gap-4 rounded-lg border p-5">
              <Lightbulb size={30} className="text-gold-600 mt-0.5 shrink-0" aria-hidden />
              <div>
                <h2 className="text-xl">{t.shortAnswer}</h2>
                <p className="text-ink/90 mt-1 leading-relaxed">{page.shortAnswer}</p>
              </div>
            </aside>
          )}

          <PageSections sections={page.sections} skipLeadImage={!isMap} />

          {page.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="h-section mb-6">{dict.tour.faqs}</h2>
              <Accordion items={page.faqs.map((f, i) => ({ id: `q-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
            </div>
          )}

          {maps.length > 0 && (
            <aside className="border-gold-500/40 bg-cream-50 mt-12 rounded-lg border p-5">
              <p className="text-ink/90 leading-relaxed">{t.mapIntro}</p>
              <ul className="mt-2 flex flex-wrap gap-x-8">
                {maps.map((item) => (
                  <li key={item.href}>
                    <TextLink href={item.href}>{item.title}</TextLink>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {page.author && (
            <aside className="border-cream-200 shadow-card mt-12 flex items-center gap-5 rounded-lg border bg-white p-5">
              {page.author.image && (
                <Image
                  src={page.author.image.src}
                  alt={page.author.image.alt || page.author.name}
                  width={80}
                  height={80}
                  className="size-20 shrink-0 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-muted text-sm">{t.aboutAuthor}</p>
                <p className="font-display text-navy-900 text-xl font-semibold">{page.author.name}</p>
                <Link href={page.author.href} className="text-navy-900 font-semibold underline underline-offset-4">
                  {t.readProfile}
                </Link>
              </div>
            </aside>
          )}
        </div>
      </article>

      {tours.length > 0 && country && (
        <section className="section-y bg-cream-100/60" data-track-placement="related_tours">
          <div className="container-x">
            <SectionHeading
              title={format(t.toursIn, { country })}
              link={{ href: toursHref, label: format(t.allToursIn, { country }) }}
            />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <li key={tour.href}>
                  <TourCard tour={tour} lang={lang} text={card} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <SectionHeading title={country ? format(t.guidesFor, { country }) : t.allGuides} />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((post) => (
                <li key={post.path}>
                  <BlogCard post={post} className="h-full" />
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <TextLink href="/blog">{t.allGuides}</TextLink>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
