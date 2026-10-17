import { ArrowUpRight, SealCheck } from '@phosphor-icons/react/dist/ssr';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { TeamBlock } from '@/components/shared/TeamBlock';
import { TrustBar } from '@/components/shared/TrustBar';
import { photoCredits } from '@/data/images';
import { site } from '@/data/site';
import { PageSections } from '@/components/pages/PageSections';
import { getPage } from '@/lib/data';
import { docMetadata } from '@/lib/page-meta';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/seo';
import { format, getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

const description = `${site.name} is a licensed Turkish tour operator (License No. ${site.licenseNo}) organizing private, small group and multi-country tours since ${site.founded}.`;

export const generateMetadata = docMetadata({
  title: 'About Us',
  description,
  path: '/about',
  image: 'istanbul-bosphorus',
});

const stats = [
  { value: String(site.founded), label: 'Founded in Istanbul' },
  { value: site.stats.travelers, label: 'Happy travelers' },
  { value: site.stats.tours, label: 'Tours completed' },
  { value: `${site.stats.rating}`, label: `Tripadvisor, ${site.stats.reviews} reviews` },
];

export default async function AboutPage() {
  const lang = await getLocale();
  // The text of the old About page, as it was. Sections that only hold icons or one-word labels are left out.
  const doc = await getPage(lang, 'about');
  const story = (doc?.sections ?? []).filter((s) => s.blocks.some((b) => b.type === 'p' && b.text.length > 60));
  if (lang !== 'en') {
    // The Chinese and Japanese pages show the text of their old About page, then the team (the English page's extra blocks are English text).
    const { ui, nav } = getDictionary(lang);
    const own = (doc?.sections ?? []).filter((s) => s.blocks.some((b) => b.type !== 'image'));
    const localCrumbs = [
      { name: nav.home, path: '/' },
      { name: ui.pages.about.crumb, path: '/about' },
    ];
    return (
      <>
        <PageBanner
          title={doc?.title ?? ui.pages.about.bannerTitle}
          description={format(ui.pages.about.banner, { year: site.founded })}
          image="istanbul-bosphorus"
          crumbs={localCrumbs}
        />
        <TrustBar />
        {own.length > 0 && (
          <section className="section-y">
            <div className="container-x max-w-3xl">
              <PageSections sections={own} />
            </div>
          </section>
        )}
        <TeamBlock className="section-y bg-cream-100/60" />
        <QuoteBand />
        <JsonLd
          data={[
            webPageJsonLd(lang, doc?.title ?? ui.pages.about.bannerTitle, '/about', 'AboutPage', doc?.metaDescription),
            breadcrumbJsonLd(lang, localCrumbs),
          ]}
        />
      </>
    );
  }
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];
  return (
    <>
      <PageBanner
        title={doc?.title ?? 'About Magnificent Travel'}
        description={`An independent Turkish tour operator, creating journeys across the eastern Mediterranean since ${site.founded}.`}
        image="istanbul-bosphorus"
        crumbs={crumbs}
      />
      <TrustBar />

      {story.length > 0 && (
        <section className="section-y">
          <div className="container-x max-w-3xl">
            <PageSections sections={story} />
          </div>
        </section>
      )}

      <TeamBlock className="section-y bg-cream-100/60" />

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
              className="text-navy-900 decoration-gold-500/60 mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold underline underline-offset-4">
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
            <summary className="text-navy-900 flex min-h-11 cursor-pointer items-center font-semibold">
              Show photographers
            </summary>
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
        data={[
          webPageJsonLd(lang, 'About Magnificent Travel', '/about', 'AboutPage', description),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
