import { Link } from '@/i18n/link';
import type { PageSummary } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { Picture } from '../shared/Picture';

export function BlogCard({ post, className }: { post: PageSummary; className?: string }) {
  const category = post.path.split('/')[1] ?? '';
  return (
    <article
      className={cn(
        'group border-cream-200 shadow-card hover:shadow-lift relative flex flex-col overflow-hidden rounded-lg border bg-white transition duration-300 hover:-translate-y-1',
        className,
      )}>
      <div className="bg-cream-100 relative aspect-[3/2] overflow-hidden">
        {post.image && (
          <Picture
            image={post.image}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-gold-700 text-sm font-semibold capitalize">{category}</p>
        <h3 className="h-card mt-1">
          <Link href={post.href} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className="text-muted mt-2 line-clamp-3 text-sm">{post.metaDescription}</p>
      </div>
    </article>
  );
}
