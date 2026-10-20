import { Handshake, ListChecks, PaperPlaneTilt, Phone, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { ButtonAnchor } from '@/components/shared/Button';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteForm } from '@/components/shared/QuoteForm';
import { TrustBar } from '@/components/shared/TrustBar';
import { getSiteSettings, whatsappUrl } from '@/lib/data/settings';
import { dictMetadata } from '@/lib/dict-meta';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

export const generateMetadata = dictMetadata((d) => d.ui.pages.plan, {
  path: '/plan-my-trip',
  image: 'travel-planning',
});

const icons = [PaperPlaneTilt, ListChecks, Handshake];

export default async function PlanMyTripPage() {
  const lang = await getLocale();
  const site = await getSiteSettings(lang);
  const { ui, nav } = getDictionary(lang);
  const t = ui.pages.plan;
  const crumbs = [
    { name: nav.home, path: '/' },
    { name: t.title, path: '/plan-my-trip' },
  ];
  return (
    <>
      <PageBanner title={t.bannerTitle} description={t.banner} image="travel-planning" crumbs={crumbs} />
      <TrustBar />
      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
          <div>
            <h2 className="h-section">{t.nextTitle}</h2>
            <ol className="mt-6 space-y-6">
              {t.steps.map(({ title, text }, i) => {
                const Icon = icons[i] ?? PaperPlaneTilt;
                return (
                  <li key={title} className="flex gap-4">
                    <span className="bg-gold-100 text-gold-700 grid size-12 shrink-0 place-items-center rounded-lg">
                      <Icon size={26} aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-sans text-lg font-semibold tracking-normal">{title}</h3>
                      <p className="text-muted mt-1">{text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="bg-cream-100 mt-10 rounded-lg p-6">
              <h3 className="text-xl">{t.talkTitle}</h3>
              <p className="text-muted mt-1">{t.talkText}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonAnchor
                  href={whatsappUrl(site.whatsappNumber, ui.quoteBand.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer">
                  <WhatsappLogo size={20} weight="fill" aria-hidden />
                  {t.whatsapp}
                </ButtonAnchor>
                <ButtonAnchor href={site.phoneHref} variant="secondary">
                  <Phone size={20} aria-hidden />
                  {site.phone}
                </ButtonAnchor>
              </div>
            </div>
          </div>
          <QuoteForm variant="page" />
        </div>
      </section>
      <JsonLd
        data={[
          webPageJsonLd(lang, t.title, '/plan-my-trip', 'ContactPage', t.description),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
