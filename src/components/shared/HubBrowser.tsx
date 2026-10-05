'use client';

import { useId, useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import type { Article } from '@/lib/content';
import { cn } from '@/lib/utils';
import { ArticleCard } from './ArticleCard';

export type HubArticle = Omit<Article, 'body'>;

export function HubBrowser({ articles, categories }: { articles: HubArticle[]; categories: string[] }) {
  const uid = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Articles');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (category === 'All Articles' || a.category === category) &&
        (!q || `${a.title} ${a.description} ${a.category}`.toLowerCase().includes(q)),
    );
  }, [articles, category, query]);

  return (
    <div>
      <div className="relative">
        <label htmlFor={`${uid}-q`} className="sr-only">
          Search articles, destinations and topics
        </label>
        <MagnifyingGlass
          size={22}
          className="text-gold-600 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          id={`${uid}-q`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, destinations, topics"
          className="border-navy-900/30 text-ink placeholder:text-muted/80 focus:border-navy-900 focus:ring-gold-500/50 h-14 w-full rounded-lg border bg-white pr-4 pl-12 text-base focus:ring-2 focus:outline-none"
        />
      </div>

      <div role="group" aria-label="Filter by topic" className="mt-5 flex flex-wrap gap-2">
        {['All Articles', ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition',
              category === c
                ? 'border-gold-600 bg-gold-600 text-white'
                : 'border-navy-900/25 text-navy-900 hover:border-navy-900 bg-white',
            )}>
            {c}
          </button>
        ))}
      </div>

      <p className="text-muted mt-6" aria-live="polite">
        {results.length} {results.length === 1 ? 'article' : 'articles'}
      </p>

      {results.length > 0 ? (
        <ul className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <li key={a.slug}>
              <ArticleCard article={{ ...a, body: '' }} className="h-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-cream-200 shadow-card mt-4 rounded-lg border bg-white p-8 text-center">
          <h3 className="text-xl">No articles found</h3>
          <p className="text-muted mt-1">Try a different word or choose another topic.</p>
        </div>
      )}
    </div>
  );
}
