import { Link } from '@/i18n/link';
import {
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  WhatsappLogo,
} from '@phosphor-icons/react/dist/ssr';
import { destinations } from '@/data/destinations';
import { format } from '@/i18n/dictionaries';
import { getDictionaryForPage, getLocale } from '@/i18n/server';
import { site, whatsappLink } from '@/data/site';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { TripadvisorBadge } from './TripadvisorBadge';

const socials = [
  { label: 'Facebook', href: site.social.facebook, icon: FacebookLogo },
  { label: 'LinkedIn', href: site.social.linkedin, icon: LinkedinLogo },
  { label: 'Instagram', href: site.social.instagram, icon: InstagramLogo },
];

const linkClass = 'text-white/75 transition hover:text-white';
const webcraft = 'https://www.webcraft.tr';

export async function Footer() {
  const lang = await getLocale();
  const { footer: t, countries, common } = await getDictionaryForPage();
  const explore = [
    { label: t.allTours, href: '/tours' },
    { label: t.multiCountry, href: '/multi-country-tours' },
    { label: t.privateTours, href: '/private-tours' },
    { label: t.smallGroupTours, href: '/small-group-tours' },
    { label: t.travelGuides, href: '/blog' },
  ];
  const company = [
    { label: t.aboutUs, href: '/about' },
    { label: t.contact, href: '/contact' },
    { label: t.faq, href: '/faq' },
    { label: t.planMyTrip, href: '/plan-my-trip' },
    { label: t.terms, href: '/gdpr/terms-conditions' },
    { label: t.privacy, href: '/gdpr/privacy-policy' },
  ];
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo light size="lg" label={common.homeLabel} />
          <p className="max-w-sm text-white/75">
            {format(t.about, {
              name: site.name,
              licenseNo: site.licenseNo,
              legalName: site.legalName,
              founded: site.founded,
            })}
          </p>
          <ul className="flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:bg-gold-600 focus-visible:ring-gold-500 grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:ring-transparent focus-visible:ring-2">
                  <Icon size={22} weight="fill" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={t.exploreLabel}>
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">{t.exploreHeading}</h2>
          <ul className="space-y-2.5">
            {destinations.map((d) => (
              <li key={d.id}>
                <Link href={`/destinations/${d.id}-tours`} className={linkClass}>
                  {format(t.countryTours, { country: countries[d.id as keyof typeof countries]?.name ?? d.name })}
                </Link>
              </li>
            ))}
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.companyLabel}>
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">{t.companyHeading}</h2>
          <ul className="space-y-2.5">
            {company.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">{t.contactHeading}</h2>
          <ul className="space-y-3.5 text-white/85">
            <li className="flex gap-3">
              <WhatsappLogo size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {format(t.whatsapp, { number: site.whatsapp })}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
              <a href={site.phoneHref} className={linkClass}>
                {site.phone}
              </a>
            </li>
            {site.email && (
              <li className="flex gap-3">
                <EnvelopeSimple size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
                <a href={`mailto:${site.email}`} className={linkClass}>
                  {site.email}
                </a>
              </li>
            )}
            <li className="flex gap-3">
              <MapPin size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
              <address className="text-white/75 not-italic">
                {site.address.street}
                <br />
                {site.address.district}, {site.address.city} {site.address.postalCode}, {site.address.country}
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-3 py-6 text-sm text-white/65 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
          <p>
            {format(t.rights, { year: new Date().getFullYear(), name: site.name })}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-center">
            <li>
              <a href={site.tursabUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {t.tursab}
              </a>
            </li>
            <li>
              <TripadvisorBadge lang={lang} label={t.tripadvisor} />
            </li>
            <li>{t.cards}</li>
          </ul>
          <p className="lg:text-right">
            <a href={`${webcraft}/hizmetler/web-tasarim`} target="_blank" rel="noopener" className={linkClass}>
              Web tasarım
            </a>{' '}
            ve{' '}
            <a href={`${webcraft}/hizmetler/seo-hizmeti`} target="_blank" rel="noopener" className={linkClass}>
              SEO
            </a>
            :{' '}
            <a href={`${webcraft}/`} target="_blank" rel="noopener" className={cn(linkClass, 'font-semibold')}>
              Webcraft
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
