'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react/dist/ssr';
import { htmlLang, localeNames, locales } from '@/i18n/config';
import { useLocale } from '@/i18n/locale-context';
import { switchLocaleHref } from '@/i18n/switch';
import { cn } from '@/lib/utils';

type Props = {
  /** Accessible name of the control, in the page language. */
  label: string;
  /** `dropdown` for the header, `list` for the mobile drawer. */
  variant?: 'dropdown' | 'list';
  className?: string;
};

/**
 * Language menu (flags are left out for now; `Flag.tsx` is kept for when they come back). Every option is a plain link (no cookie, crawlers can follow it); the current language
 * is marked and is not a link in the list variant.
 */
export function LanguageSwitcher({ label, variant = 'dropdown', className }: Props) {
  const lang = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const options = locales.map((code) => (
    <li key={code}>
      <NextLink
        href={switchLocaleHref(code, pathname)}
        hrefLang={htmlLang[code]}
        lang={htmlLang[code]}
        aria-current={code === lang ? 'true' : undefined}
        onClick={() => setOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.95rem] transition',
          code === lang ? 'bg-cream-100 text-navy-900 font-semibold' : 'text-navy-900 hover:bg-cream-100 font-medium',
        )}>
        <span className="flex-1">{localeNames[code]}</span>
        {code === lang && <Check size={16} weight="bold" className="text-gold-700" aria-hidden />}
      </NextLink>
    </li>
  ));

  if (variant === 'list') {
    return (
      <nav aria-label={label} className={className}>
        <ul className="border-cream-200 divide-cream-200 divide-y rounded-lg border bg-white p-1">{options}</ul>
      </nav>
    );
  }

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="text-navy-900 border-cream-200 hover:border-navy-900/40 flex h-11 items-center gap-2 rounded-lg border bg-white px-3 text-[0.95rem] font-medium transition">
        <span lang={htmlLang[lang]}>{localeNames[lang]}</span>
        <CaretDown size={13} weight="bold" aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      <div
        id={menuId}
        className={cn(
          'absolute top-full right-0 z-40 w-48 pt-2 transition duration-150',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}>
        <ul className="border-cream-200 shadow-lift overflow-hidden rounded-lg border bg-white p-1.5">{options}</ul>
      </div>
    </div>
  );
}
