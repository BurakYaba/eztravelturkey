import {
  ArrowUpRight,
  EnvelopeSimple,
  FacebookLogo,
  GlobeSimple,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  WhatsappLogo,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react/dist/ssr';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { TeamBlock } from '@/components/shared/TeamBlock';
import { QuoteForm } from '@/components/shared/QuoteForm';
import { site } from '@/data/site';
import { getPage } from '@/lib/data';
import { getSiteSettings, whatsappUrl } from '@/lib/data/settings';
import { docMetadata } from '@/lib/page-meta';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/seo';
import { PageSections } from '@/components/pages/PageSections';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocale } from '@/i18n/server';

const description = `Contact ${site.name} by WhatsApp, phone or the contact form. Our licensed Turkish tour operator office is in Sultanahmet, Istanbul.`;

export const generateMetadata = docMetadata({
  title: 'Contact Us',
  description,
  path: '/contact',
  image: 'istanbul-skyline',
});

export default async function ContactPage() {
  const lang = await getLocale();
  const doc = await getPage(lang, 'contact');
  if (lang !== 'en') {
    // The Chinese and Japanese pages list the contact details of their old Contact page, next to the form.
    const { ui, nav } = getDictionary(lang);
    const localCrumbs = [
      { name: nav.home, path: '/' },
      { name: ui.pages.contact.crumb, path: '/contact' },
    ];
    const details = (doc?.sections ?? []).filter((s) => s.blocks.some((b) => b.type === 'list'));
    return (
      <>
        <PageBanner
          title={doc?.title ?? ui.pages.contact.title}
          description={ui.pages.contact.banner}
          image="istanbul-skyline"
          crumbs={localCrumbs}
        />
        <section className="section-y">
          <div className="container-x grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
            <div>{details.length > 0 && <PageSections sections={details} />}</div>
            <div>
              <h2 className="h-section">{ui.pages.contact.formTitle}</h2>
              <p className="text-muted mt-2 mb-5">{ui.pages.contact.formText}</p>
              <QuoteForm variant="contact" />
            </div>
          </div>
        </section>
        <TeamBlock className="section-y bg-cream-100/60" />
        <JsonLd
          data={[
            webPageJsonLd(lang, doc?.title ?? ui.pages.contact.title, '/contact', 'ContactPage', doc?.metaDescription),
            breadcrumbJsonLd(lang, localCrumbs),
          ]}
        />
      </>
    );
  }
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];
  const settings = await getSiteSettings(lang);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${settings.address.street}, ${settings.address.district}, ${settings.address.city}`,
  )}`;
  const methods = [
    { icon: WhatsappLogo, label: 'WhatsApp', value: settings.whatsapp, href: whatsappUrl(settings.whatsappNumber), external: true },
    { icon: Phone, label: 'Phone', value: settings.phone, href: settings.phoneHref, external: false },
    ...(settings.email
      ? [{ icon: EnvelopeSimple, label: 'Email', value: settings.email, href: `mailto:${settings.email}`, external: false }]
      : []),
  ];
  const socials = [
    { label: 'Facebook', href: settings.social.facebook, icon: FacebookLogo },
    { label: 'LinkedIn', href: settings.social.linkedin, icon: LinkedinLogo },
    { label: 'Instagram', href: settings.social.instagram, icon: InstagramLogo },
    { label: 'X', href: settings.social.x, icon: XLogo },
    { label: 'YouTube', href: settings.social.youtube, icon: YoutubeLogo },
    ...settings.otherLinks.map((l) => ({ label: l.label, href: l.url, icon: GlobeSimple })),
  ].filter((s) => s.href);

  return (
    <>
      <PageBanner
        title={doc?.title ?? 'Contact Us'}
        description="Have a question? Send us a message or reach us directly. We will help you plan."
        image="istanbul-skyline"
        crumbs={crumbs}
      />
      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
          <div className="space-y-8">
            <ul className="space-y-4">
              {methods.map(({ icon: Icon, label, value, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="border-cream-200 shadow-card hover:border-gold-500/60 flex items-center gap-4 rounded-lg border bg-white p-4 transition">
                    <span className="bg-gold-100 text-gold-700 grid size-12 shrink-0 place-items-center rounded-lg">
                      <Icon size={26} aria-hidden />
                    </span>
                    <span>
                      <span className="text-gold-700 block text-sm font-semibold">{label}</span>
                      <span className="text-navy-900 block text-lg font-semibold">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <address className="flex gap-4 not-italic">
              <MapPin size={28} className="text-gold-600 mt-1 shrink-0" aria-hidden />
              <div>
                <h2 className="font-sans text-lg font-semibold tracking-normal">Our office</h2>
                <p className="text-ink mt-1">
                  {settings.address.street}
                  <br />
                  {settings.address.district}, {settings.address.city} {settings.address.postalCode}, {settings.address.country}
                </p>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 decoration-gold-500/60 mt-1 inline-flex min-h-11 items-center gap-1 font-semibold underline underline-offset-4">
                  Open in Google Maps <ArrowUpRight size={14} weight="bold" aria-hidden />
                </a>
              </div>
            </address>

            <div>
              <h2 className="font-sans text-lg font-semibold tracking-normal">Business details</h2>
              <p className="text-muted mt-1">
                {site.legalName}, an independent Turkish tour operator since {settings.founded}. License No.{' '}
                {settings.licenseNo}.
              </p>
              <ul className="mt-4 flex gap-3">
                {socials.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="border-navy-900/25 text-navy-900 hover:border-navy-900 grid size-11 place-items-center rounded-lg border transition hover:bg-white">
                      <Icon size={22} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="h-section">Have a question?</h2>
            <p className="text-muted mt-2 mb-5">Ask about a tour, your dates or a custom itinerary.</p>
            <QuoteForm variant="contact" />
          </div>
        </div>
      </section>
      <TeamBlock className="section-y bg-cream-100/60" />
      <JsonLd
        data={[
          webPageJsonLd(lang, 'Contact Magnificent Travel', '/contact', 'ContactPage', description),
          breadcrumbJsonLd(lang, crumbs),
        ]}
      />
    </>
  );
}
