'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Link } from '@/i18n/link';
import { useLocale } from '@/i18n/locale-context';

type Entry = { title: string; href: string; text: string; kind: 'tour' | 'destination' | 'blog' };

type Labels = {
  placeholder: string;
  button: string;
  empty: string;
  hint: string;
  results: string;
  kinds: Record<Entry['kind'], string>;
};

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));

/** Words of the query must all appear; a title match ranks above a text match. */
function search(entries: Entry[], query: string): Entry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }
  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const text = `${title} ${entry.text.toLowerCase()}`;
      const hit = words.every((w) => text.includes(w));
      const inTitle = words.every((w) => title.includes(w));
      return { entry, score: hit ? (inTitle ? 2 : 1) : 0 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.entry);
}

export function SearchClient({ labels }: { labels: Labels }) {
  const lang = useLocale();
  const query = useSearchParams().get('q') ?? '';
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/${lang}/search-index.json`)
      .then((response) => response.json() as Promise<Entry[]>)
      .then((data) => !cancelled && setEntries(data))
      .catch(() => !cancelled && setEntries([]));
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const results = useMemo(() => (entries ? search(entries, query) : []), [entries, query]);

  return (
    <div className="max-w-3xl">
      <form action={`/${lang}/search/`} method="get" role="search" className="flex gap-3">
        <label htmlFor="site-search" className="sr-only">
          {labels.placeholder}
        </label>
        <input
          id="site-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={labels.placeholder}
          className="border-navy-900/30 text-ink placeholder:text-muted/80 focus:border-navy-900 focus:ring-gold-500/50 h-12 w-full rounded-lg border bg-white px-4 text-[0.97rem] focus:ring-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-navy-900 hover:bg-navy-800 inline-flex h-12 shrink-0 items-center gap-2 rounded-lg px-5 font-semibold text-white">
          <MagnifyingGlass size={18} weight="bold" aria-hidden />
          {labels.button}
        </button>
      </form>

      <div className="mt-8" aria-live="polite">
        {!query && <p className="text-muted">{labels.hint}</p>}
        {query && entries && results.length === 0 && <p className="text-muted">{fill(labels.empty, { query })}</p>}
        {query && results.length > 0 && (
          <>
            <p className="text-muted mb-4">{fill(labels.results, { query, count: results.length })}</p>
            <ul className="divide-cream-200 border-cream-200 divide-y rounded-lg border bg-white">
              {results.slice(0, 40).map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="hover:bg-cream-100 block px-4 py-3">
                    <span className="text-gold-700 text-xs font-semibold tracking-wide uppercase">
                      {labels.kinds[r.kind]}
                    </span>
                    <span className="text-navy-900 block font-semibold">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
