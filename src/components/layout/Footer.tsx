import { Link } from '@/i18n/link';
import {
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
import { destinations } from '@/data/destinations';
import { format } from '@/i18n/dictionaries';
import { legalHref, multiCountryHref } from '@/i18n/public-paths';
import { availableCountries, getPage } from '@/lib/data';
import { getDictionaryForPage, getLocale } from '@/i18n/server';
import { site } from '@/data/site';
import { getSiteSettings, whatsappUrl } from '@/lib/data/settings';
import { Logo } from './Logo';
import { TripadvisorBadge } from './TripadvisorBadge';

const linkClass = 'inline-block py-1.5 text-white/75 transition hover:text-white';

export async function Footer() {
  const lang = await getLocale();
  const settings = await getSiteSettings(lang);
  const { footer: t, countries, common } = await getDictionaryForPage();
  // The accounts the language has (Studio: "Site ayarları"); an empty one shows no icon.
  const socials = [
    { label: 'Facebook', href: settings.social.facebook, icon: FacebookLogo },
    { label: 'LinkedIn', href: settings.social.linkedin, icon: LinkedinLogo },
    { label: 'Instagram', href: settings.social.instagram, icon: InstagramLogo },
    { label: 'X', href: settings.social.x, icon: XLogo },
    { label: 'YouTube', href: settings.social.youtube, icon: YoutubeLogo },
    ...settings.otherLinks.map((l) => ({ label: l.label, href: l.url, icon: GlobeSimple })),
  ].filter((s) => s.href);
  const available = await availableCountries(lang);
  const explore = [
    { label: t.allTours, href: '/tours' },
    { label: t.multiCountry, href: multiCountryHref(lang) },
    { label: t.privateTours, href: '/private-tours' },
    { label: t.smallGroupTours, href: '/small-group-tours' },
    { label: t.travelGuides, href: '/blog' },
  ];
  // A text page of the old Chinese site that no other page links to (how to book). The old Japanese page "privacy conditions" held
  // the FAQ and was moved into the FAQ page on 2026-10-24; its old address redirects there.
  const extraPages = lang === 'cn' ? ['how-to-book-a-trip'] : [];
  const extra = (
    await Promise.all(extraPages.map(async (path) => ({ page: await getPage(lang, path), path })))
  ).flatMap(({ page, path }) => (page && !page.fallback ? [{ label: page.title, href: `/${path}` }] : []));
  const company = [
    { label: t.aboutUs, href: '/about' },
    { label: t.contact, href: '/contact' },
    { label: t.faq, href: '/faq' },
    { label: t.planMyTrip, href: '/plan-my-trip' },
    { label: t.terms, href: legalHref(lang, 'terms') },
    { label: t.privacy, href: legalHref(lang, 'privacy') },
    // The old English site links the Turkish distance sales agreement from every page (a Turkish tour operator's legal text); the Chinese and Japanese sites never had it.
    ...extra,
    ...(lang === 'en' ? [{ label: t.distanceSales, href: '/gdpr/mesafeli-satis-sozlesmesi' }] : []),
  ];
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo light size="lg" label={common.homeLabel} />
          <p className="max-w-sm text-white/75">
            {format(t.about, {
              name: site.name,
              licenseNo: settings.licenseNo,
              legalName: site.legalName,
              founded: settings.founded,
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
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">
            {t.exploreHeading}
          </h2>
          <ul className="space-y-2.5">
            {destinations
              .filter((d) => available.includes(d.id))
              .map((d) => (
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
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">
            {t.companyHeading}
          </h2>
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
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">
            {t.contactHeading}
          </h2>
          <ul className="space-y-3.5 text-white/85">
            <li className="flex gap-3">
              <WhatsappLogo size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
              <a href={whatsappUrl(settings.whatsappNumber)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {format(t.whatsapp, { number: settings.whatsapp })}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
              <a href={settings.phoneHref} className={linkClass}>
                {settings.phone}
              </a>
            </li>
            {settings.email && (
              <li className="flex gap-3">
                <EnvelopeSimple size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
                <a href={`mailto:${settings.email}`} className={linkClass}>
                  {settings.email}
                </a>
              </li>
            )}
            <li className="flex gap-3">
              <MapPin size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
              <address className="text-white/75 not-italic">
                {settings.address.street}
                <br />
                {settings.address.district}, {settings.address.city} {settings.address.postalCode}, {settings.address.country}
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-3 py-6 text-sm text-white/65 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
          <p>{format(t.rights, { year: new Date().getFullYear(), name: site.name })}</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-center">
            <li>
              <a href={site.tursabUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {t.tursab}
              </a>
            </li>
            <li>
              <TripadvisorBadge lang={lang} label={t.tripadvisor} url={settings.tripadvisorUrl} />
            </li>
            <li>{t.cards}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
