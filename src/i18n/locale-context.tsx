'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { defaultLocale, type Locale } from './config';
import type { Alternates } from './switch';

const LocaleContext = createContext<Locale>(defaultLocale);
const AlternatesContext = createContext<Alternates>({});

/**
 * Makes the page language, and which pages have a counterpart in the other languages, available to client components
 * (links, language menu). Server components use `next/root-params`.
 */
export function LocaleProvider({ lang, alternates = {}, children }: { lang: Locale; alternates?: Alternates; children: ReactNode }) {
  return (
    <LocaleContext.Provider value={lang}>
      <AlternatesContext.Provider value={alternates}>{children}</AlternatesContext.Provider>
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
export const useAlternates = () => useContext(AlternatesContext);
