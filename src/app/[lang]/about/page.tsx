import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteBand } from '@/components/shared/QuoteBand';
import { TeamBlock } from '@/components/shared/TeamBlock';
import { TrustBar } from '@/components/shared/TrustBar';
import { site } from '@/data/site';
import { PageSections } from '@/components/pages/PageSections';
import { getPage } from '@/lib/data';
import { getSiteSettings } from '@/lib/data/settings';
import { docMetadata } from '@/lib/page-meta';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/seo';
import { format, getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

export const generateMetadata = docMetadata({
  path: '/about',
  image: 'istanbul-bosphorus',
  dictionary: (d) => ({
    title: d.ui.pages.about.bannerTitle,
    description: format(d.ui.pages.about.banner, { year: site.founded }),
  }),
});

export default async function AboutPage() {
  const lang = await getLocale();
  const settings = await getSiteSettings(lang);
  const doc = await getPage(lang, 'about');
  // The text of the old About page, then the team.
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
        description={format(ui.pages.about.banner, { year: settings.founded })}
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
