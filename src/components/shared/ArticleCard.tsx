import { Link } from '@/i18n/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { getTour } from '@/data/tours';
import type { Article } from '@/lib/content';
import { cn, formatDate } from '@/lib/utils';
import { Photo } from './Photo';

export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  const related = article.tours
    .map((slug) => getTour(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 1);

  return (
    <article
      className={cn(
        'group border-cream-200 shadow-card hover:shadow-lift relative flex flex-col overflow-hidden rounded-lg border bg-white transition duration-300 hover:-translate-y-1',
        className,
      )}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Photo
          id={article.image}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-gold-700 text-sm font-semibold">{article.category}</p>
        <h3 className="h-card mt-1">
          <Link href={`/travel-hub/${article.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {article.title}
          </Link>
        </h3>
        <p className="text-muted mt-2 line-clamp-3">{article.description}</p>
        <div className="text-muted mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span>
            {formatDate(article.date)}, {article.readingMinutes} min read
          </span>
          <span className="text-navy-900 inline-flex items-center gap-1.5 font-semibold">
            Read
            <ArrowRight size={16} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
        {related.length > 0 && (
          <p className="border-cream-200 text-muted relative z-10 mt-3 border-t pt-3 text-sm">
            Related tour:{' '}
            <Link
              href={`/tours/${related[0].slug}`}
              className="text-navy-900 font-semibold underline underline-offset-4">
              {related[0].title}
            </Link>
          </p>
        )}
      </div>
    </article>
  );
}
