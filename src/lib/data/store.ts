import fs from 'node:fs';
import path from 'node:path';
import type { ScrapedTour } from '@/lib/schema/tour.ts';
import type { ScrapedPage } from '@/lib/schema/page.ts';
import { defaultLocale, type Locale } from '@/i18n/config';

type Store = { tours: ScrapedTour[]; pages: ScrapedPage[] };

const root = path.join(process.cwd(), 'content', 'scraped');
const cache = new Map<string, Store | null>();

function readJsonFiles<T>(dir: string): T[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return readJsonFiles<T>(full);
    }
    return entry.name.endsWith('.json') ? [JSON.parse(fs.readFileSync(full, 'utf8')) as T] : [];
  });
}

/** The scraped content of one language, or null when that language has none yet (zh and jp until P5). */
export function loadStore(lang: Locale): Store | null {
  if (!cache.has(lang)) {
    const dir = path.join(root, lang);
    cache.set(
      lang,
      fs.existsSync(dir)
        ? { tours: readJsonFiles<ScrapedTour>(path.join(dir, 'tours')), pages: readJsonFiles<ScrapedPage>(path.join(dir, 'pages')) }
        : null,
    );
  }
  return cache.get(lang) ?? null;
}

/** The store to read for a language and whether it is the English stand-in. */
export function storeFor(lang: Locale): { store: Store; fallback: boolean } {
  const own = loadStore(lang);
  if (own) {
    return { store: own, fallback: false };
  }
  const english = loadStore(defaultLocale);
  if (!english) {
    throw new Error('content/scraped/en is missing. Run npm run scrape:parse.');
  }
  return { store: english, fallback: true };
}

export const hasNativeContent = (lang: Locale) => loadStore(lang) !== null;
