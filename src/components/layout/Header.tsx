'use client';

import { Link } from '@/i18n/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/i18n/locale-context';
import { stripLocale } from '@/i18n/paths';
import { logicalPath } from '@/i18n/public-paths';
import { useEffect, useRef, useState } from 'react';
import { CaretDown, List, X } from '@phosphor-icons/react/dist/ssr';
import { destinations } from '@/data/destinations';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';
import { ButtonLink } from '../shared/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

type DropItem = { label: string; href: string; note?: string };

type Props = {
  nav: Dictionary['nav'];
  countries: Dictionary['countries'];
  homeLabel: string;
  /** The countries this language has a page for. */
  available: string[];
};

const countryLabel = (countries: Dictionary['countries'], id: string) =>
  countries[id as keyof Dictionary['countries']] ?? { name: id, tagline: '' };

function Dropdown({
  label,
  items,
  pathname,
  active,
}: {
  label: string;
  items: DropItem[];
  pathname: string;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'text-navy-900 hover:text-gold-700 flex items-center gap-1 py-2 text-[0.95rem] font-medium transition',
          active && 'text-gold-700',
        )}>
        {label}
        <CaretDown size={13} weight="bold" aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      <div
        className={cn(
          'absolute top-full left-1/2 z-40 w-72 -translate-x-1/2 pt-3 transition duration-150',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}>
        <ul className="border-cream-200 shadow-lift overflow-hidden rounded-lg border bg-white p-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? 'page' : undefined}
                className="hover:bg-cream-100 block rounded-md px-3 py-2.5 transition">
                <span className="text-navy-900 block text-[0.95rem] font-semibold">{item.label}</span>
                {item.note && <span className="text-muted block text-sm">{item.note}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Header({ nav, countries, homeLabel, available }: Props) {
  const lang = useLocale();
  const currentPath = usePathname();
  const pathname = logicalPath(lang, decodeURIComponent(stripLocale(currentPath)));
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('keydown', onKey);
      closeRef.current?.focus();
      wasOpen.current = true;
    } else if (wasOpen.current) {
      toggleRef.current?.focus();
      wasOpen.current = false;
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isActive = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

  const destinationItems: DropItem[] = [
    ...destinations
      .filter((d) => available.includes(d.id))
      .map((d) => {
        const country = countryLabel(countries, d.id);
        return { label: country.name, href: `/destinations/${d.id}-tours`, note: country.tagline };
      }),
    { label: nav.allDestinations, href: '/destinations' },
  ];
  const styleItems: DropItem[] = [
    { label: nav.privateTours, href: '/private-tours', note: nav.privateNote },
    { label: nav.smallGroupTours, href: '/small-group-tours', note: nav.smallGroupNote },
    { label: nav.allTours, href: '/tours' },
  ];
  const primary = [
    { label: nav.multiCountry, href: '/multi-country-tours' },
    { label: nav.about, href: '/about' },
    { label: nav.travelGuides, href: '/blog' },
    { label: nav.contact, href: '/contact' },
  ];

  return (
    <>
      <header className="border-cream-200/80 bg-cream-50/95 supports-[backdrop-filter]:bg-cream-50/85 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container-wide flex h-[80px] items-center justify-between gap-6">
          <Logo priority label={homeLabel} />

          <nav aria-label={nav.main} className="hidden items-center gap-6 lg:flex xl:gap-8">
            <Dropdown
              label={nav.destinations}
              items={destinationItems}
              pathname={pathname}
              active={isActive('/destinations')}
            />
            <Dropdown
              label={nav.tourStyles}
              items={styleItems}
              pathname={pathname}
              active={isActive('/private-tours') || isActive('/small-group-tours') || isActive('/tours')}
            />
            {primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'text-navy-900 hover:text-gold-700 py-2 text-[0.95rem] font-medium whitespace-nowrap transition',
                  isActive(item.href) && 'text-gold-700',
                )}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher label={nav.language} className="hidden lg:flex" />
            <ButtonLink href="/plan-my-trip" arrow className="hidden sm:inline-flex">
              {nav.planMyTrip}
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              className="border-cream-200 text-navy-900 grid size-11 place-items-center rounded-lg border bg-white lg:hidden"
              aria-label={nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}>
              <List size={22} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setMenuOpen(false)}
        className={cn(
          'bg-navy-950/55 fixed inset-0 z-[55] backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none lg:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Drawer: slides in from the right and covers half the screen (never narrower than 17rem). */}
      <aside
        id="mobile-menu"
        aria-label={nav.menu}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={cn(
          'bg-cream-50 shadow-lift fixed top-0 right-0 z-[60] flex h-dvh w-1/2 max-w-md min-w-[17rem] flex-col',
          'transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:hidden',
          menuOpen ? 'visible translate-x-0' : 'invisible translate-x-full',
        )}>
        <div className="border-cream-200 flex h-[80px] shrink-0 items-center justify-between border-b px-5">
          <span className="font-display text-navy-900 text-lg font-semibold">{nav.menu}</span>
          <button
            ref={closeRef}
            type="button"
            aria-label={nav.closeMenu}
            onClick={() => setMenuOpen(false)}
            className="border-cream-200 text-navy-900 grid size-11 place-items-center rounded-lg border bg-white">
            <X size={22} aria-hidden />
          </button>
        </div>

        <nav aria-label={nav.mobile} className="flex-1 overflow-y-auto px-5 pb-6">
          {[
            { key: 'destinations', label: nav.destinations, items: destinationItems },
            { key: 'styles', label: nav.tourStyles, items: styleItems },
          ].map((group) => {
            const open = mobileSection === group.key;
            return (
              <div key={group.key} className="border-cream-200 border-b">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setMobileSection(open ? null : group.key)}
                  className="font-display text-navy-900 flex w-full items-center justify-between py-4 text-left text-lg font-semibold">
                  {group.label}
                  <CaretDown
                    size={16}
                    weight="bold"
                    aria-hidden
                    className={cn('transition-transform duration-300', open && 'rotate-180')}
                  />
                </button>
                <div className="acc-panel" data-open={open}>
                  <ul className="overflow-hidden">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          tabIndex={open ? 0 : -1}
                          className="text-muted hover:text-navy-900 block py-2 pl-3 text-[0.97rem]">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li className="pb-2" />
                  </ul>
                </div>
              </div>
            );
          })}
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-cream-200 font-display text-navy-900 block border-b py-4 text-lg font-semibold">
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher label={nav.language} variant="list" className="mt-6" />
          <ButtonLink href="/plan-my-trip" size="lg" arrow className="mt-6 w-full">
            {nav.planMyTrip}
          </ButtonLink>
        </nav>
      </aside>
    </>
  );
}
