'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { defaultLocale, type Locale } from './config';

const LocaleContext = createContext<Locale>(defaultLocale);

/** Makes the page language available to client components (links). Server components use `next/root-params`. */
export function LocaleProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={lang}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
