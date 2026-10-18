import { Link } from '@/i18n/link';
import { CaretRight } from '@phosphor-icons/react/dist/ssr';
import { getDictionaryForPage } from '@/i18n/server';
import { cn } from '@/lib/utils';

export type Crumb = { name: string; path: string };

export async function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const { ui } = await getDictionaryForPage();
  return (
    <nav aria-label={ui.breadcrumb.label} className={cn('text-muted text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-navy-900 font-medium">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.path}
                    className="hover:text-navy-900 -my-3 inline-block py-3 underline-offset-4 hover:underline">
                    {item.name}
                  </Link>
                  <CaretRight size={12} aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
