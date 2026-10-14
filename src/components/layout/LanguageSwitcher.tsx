'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe } from '@phosphor-icons/react/dist/ssr';
import { locales, localeNames, htmlLang } from '@/i18n/config';
import { useLocale } from '@/i18n/locale-context';
import { switchLocaleHref } from '@/i18n/switch';
import { cn } from '@/lib/utils';

/**
 * Plain links, one per language: crawlers can follow them and no cookie is needed. The current language is marked
 * and is not a link.
 */
export function LanguageSwitcher({ label, className }: { label: string; className?: string }) {
  const lang = useLocale();
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={cn('flex items-center gap-1.5 text-sm', className)}>
      <Globe size={18} className="text-gold-700 shrink-0" aria-hidden />
      <ul className="flex items-center gap-1">
        {locales.map((code) => (
          <li key={code}>
            {code === lang ? (
              <span aria-current="true" lang={htmlLang[code]} className="bg-navy-900 rounded-md px-2 py-1 font-semibold text-white">
                {localeNames[code]}
              </span>
            ) : (
              <NextLink
                href={switchLocaleHref(code, pathname)}
                hrefLang={htmlLang[code]}
                lang={htmlLang[code]}
                className="text-navy-900 hover:bg-cream-100 rounded-md px-2 py-1 font-medium">
                {localeNames[code]}
              </NextLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
