import { ArrowUpRight, Star } from '@phosphor-icons/react/dist/ssr';
import { reviews } from '@/data/reviews';
import { site } from '@/data/site';
import { formatDate } from '@/lib/utils';

export function ReviewCards() {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {reviews.map((review) => (
        <li key={review.name} className="border-cream-200 shadow-card flex flex-col rounded-lg border bg-white p-6">
          <div className="text-gold-500 flex gap-0.5" role="img" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} weight="fill" aria-hidden />
            ))}
          </div>
          <blockquote className="text-ink mt-4 flex-1">&ldquo;{review.text}&rdquo;</blockquote>
          <footer className="border-cream-200 mt-5 border-t pt-4">
            <p className="text-navy-900 font-semibold">{review.name}</p>
            <p className="text-muted text-sm">Tripadvisor, {formatDate(review.date)}</p>
            <a
              href={site.tripadvisorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-700 mt-2 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">
              Read more on Tripadvisor
              <ArrowUpRight size={14} weight="bold" aria-hidden />
            </a>
          </footer>
        </li>
      ))}
    </ul>
  );
}
