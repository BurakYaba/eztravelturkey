import Image from 'next/image';
import type { ImageRef } from '@/lib/data/types';
import { cn } from '@/lib/utils';

type Props = {
  image: ImageRef;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
  quality?: number;
};

/** A scraped tour or blog picture. Fills its positioned parent, which controls the aspect ratio. */
export function Picture({ image, sizes, className, priority, alt, quality = 75 }: Props) {
  return (
    <Image
      src={image.src}
      alt={alt ?? image.alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      className={cn('object-cover', className)}
    />
  );
}
