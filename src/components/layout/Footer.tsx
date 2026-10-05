import Link from 'next/link';
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
import { site, whatsappLink } from '@/data/site';
import { Logo } from './Logo';

const explore = [
  { label: 'All tours', href: '/tours' },
  { label: 'Multi-country tours', href: '/multi-country-tours' },
  { label: 'Private tours', href: '/private-tours' },
  { label: 'Small group tours', href: '/small-group-tours' },
  { label: 'Travel guides', href: '/travel-hub' },
];

const company = [
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Plan my trip', href: '/plan-my-trip' },
  { label: 'Terms and conditions', href: '/terms-conditions' },
  { label: 'Privacy policy', href: '/privacy-policy' },
];

const socials = [
  { label: 'Facebook', href: site.social.facebook, icon: FacebookLogo },
  { label: 'LinkedIn', href: site.social.linkedin, icon: LinkedinLogo },
  { label: 'Instagram', href: site.social.instagram, icon: InstagramLogo },
];

const linkClass = 'text-white/75 transition hover:text-white';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo light size="lg" />
          <p className="max-w-sm text-white/75">
            {site.name} (License No. {site.licenseNo}), officially registered as {site.legalName}, has been an
            independent Turkish tour operator since {site.founded}.
          </p>
          <ul className="flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:border-gold-500 grid size-10 place-items-center rounded-lg border border-white/20 text-white/85 transition hover:text-white">
                  <Icon size={20} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Destinations and tours">
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">Explore</h2>
          <ul className="space-y-2.5">
            {destinations.map((d) => (
              <li key={d.id}>
                <Link href={`/destinations/${d.id}`} className={linkClass}>
                  {d.name} tours
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

        <nav aria-label="Company">
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">Company</h2>
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
          <h2 className="text-gold-100 mb-4 font-sans text-sm font-semibold tracking-[0.14em] uppercase">Contact</h2>
          <ul className="space-y-3.5 text-white/85">
            <li className="flex gap-3">
              <WhatsappLogo size={22} className="text-gold-500 mt-0.5 shrink-0" aria-hidden />
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                WhatsApp {site.whatsapp}
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
        <div className="container-wide flex flex-col gap-3 py-6 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <a href={site.tursabUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                TURSAB member
              </a>
            </li>
            <li>
              <a href={site.tripadvisorUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Tripadvisor reviews
              </a>
            </li>
            <li>Visa and Mastercard accepted</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
