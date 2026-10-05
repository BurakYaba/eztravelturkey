import type { ReactNode } from 'react';
import type { ImageId } from '@/data/images';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { Photo } from './Photo';

type Props = {
  title: string;
  description?: ReactNode;
  image: ImageId;
  crumbs?: Crumb[];
  eyebrow?: string;
  actions?: ReactNode;
};

/** Page header with the photo bleeding in from the right and fading into the page color. */
export function PageBanner({ title, description, image, crumbs, eyebrow, actions }: Props) {
  return (
    <section className="border-cream-200 bg-cream-50 relative isolate overflow-hidden border-b">
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[68%]">
        <Photo id={image} sizes="(min-width: 1024px) 68vw, 100vw" priority className="object-center" />
        <div aria-hidden className="bg-cream-50/80 absolute inset-0 lg:hidden" />
        <div aria-hidden className="fade-left absolute inset-0 hidden lg:block" />
      </div>
      <div className="container-wide py-10 md:py-16 lg:py-20">
        {crumbs && <Breadcrumbs items={crumbs} className="mb-6" />}
        <div className="max-w-xl">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="h-display">{title}</h1>
          {description && <div className="text-ink/85 mt-4 text-lg">{description}</div>}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
