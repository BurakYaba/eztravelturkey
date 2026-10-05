import Image from 'next/image';
import { img, type ImageId } from '@/data/images';
import { cn } from '@/lib/utils';

type Props = {
  id: ImageId;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
  quality?: number;
};

/** Fills its positioned parent. The parent controls the aspect ratio. */
export function Photo({ id, sizes, className, priority, alt, quality = 75 }: Props) {
  const picture = img(id);
  return (
    <Image
      src={picture.src}
      alt={alt ?? picture.alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      className={cn('object-cover', className)}
    />
  );
}
