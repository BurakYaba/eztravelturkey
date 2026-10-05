import {
  ArrowUpRight,
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  WhatsappLogo,
} from '@phosphor-icons/react/dist/ssr';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageBanner } from '@/components/shared/PageBanner';
import { QuoteForm } from '@/components/shared/QuoteForm';
import { site, whatsappLink } from '@/data/site';
import { breadcrumbJsonLd, buildMetadata, webPageJsonLd } from '@/lib/seo';

const description = `Contact ${site.name} by WhatsApp, phone or the contact form. Our office is in Sultanahmet, Istanbul.`;

export const metadata = buildMetadata({
  title: 'Contact Us',
  description,
  path: '/contact',
  image: 'istanbul-skyline',
});

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.address.street}, ${site.address.district}, ${site.address.city}`,
)}`;

export default function ContactPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];
  const methods = [
    { icon: WhatsappLogo, label: 'WhatsApp', value: site.whatsapp, href: whatsappLink(), external: true },
    { icon: Phone, label: 'Phone', value: site.phone, href: site.phoneHref, external: false },
    ...(site.email
      ? [{ icon: EnvelopeSimple, label: 'Email', value: site.email, href: `mailto:${site.email}`, external: false }]
      : []),
  ];
  const socials = [
    { label: 'Facebook', href: site.social.facebook, icon: FacebookLogo },
    { label: 'LinkedIn', href: site.social.linkedin, icon: LinkedinLogo },
    { label: 'Instagram', href: site.social.instagram, icon: InstagramLogo },
  ];

  return (
    <>
      <PageBanner
        title="Contact Us"
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
                  {site.address.street}
                  <br />
                  {site.address.district}, {site.address.city} {site.address.postalCode}, {site.address.country}
                </p>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 decoration-gold-500/60 mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-4">
                  Open in Google Maps <ArrowUpRight size={14} weight="bold" aria-hidden />
                </a>
              </div>
            </address>

            <div>
              <h2 className="font-sans text-lg font-semibold tracking-normal">Business details</h2>
              <p className="text-muted mt-1">
                {site.legalName}, an independent Turkish tour operator since {site.founded}. License No.{' '}
                {site.licenseNo}.
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
      <JsonLd
        data={[
          webPageJsonLd('Contact Magnificent Travel', '/contact', 'ContactPage', description),
          breadcrumbJsonLd(crumbs),
        ]}
      />
    </>
  );
}
