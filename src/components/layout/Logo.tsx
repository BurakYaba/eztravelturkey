import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** White version for dark backgrounds. */
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
};

// public/images/logo.png is public/mtlogo.png with its transparent margins trimmed (502 x 282).
const sizes = {
  sm: 'h-12',
  md: 'h-[4.5rem]',
  lg: 'h-24',
};

export function Logo({ className, light = false, size = 'md', priority }: Props) {
  return (
    <Link href="/" aria-label="Magnificent Travel, home" className={cn('inline-flex shrink-0', className)}>
      <Image
        src="/images/logo.png"
        alt="Magnificent Travel"
        width={502}
        height={282}
        priority={priority}
        className={cn('w-auto', sizes[size], light && 'brightness-0 invert')}
      />
    </Link>
  );
}
