import Image from 'next/image';
import { Link } from '@/i18n/link';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** White version for dark backgrounds. */
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
  /** Accessible name of the link, in the page language. */
  label?: string;
};

// public/images/logo.png is public/mtlogo.png with its transparent margins trimmed (502 x 282).
const sizes = {
  sm: 'h-12',
  md: 'h-[4.5rem]',
  lg: 'h-24',
};
// The width each height gives (the logo is 502 x 282): the browser then fetches a picture of about that width instead of the
// 640 or 1080 pixel one a plain width/height pair asks for (the home page spent 33 KB of its first seconds on the logo).
const widths = { sm: 86, md: 128, lg: 171 };

export function Logo({ className, light = false, size = 'md', priority, label = 'Magnificent Travel, home' }: Props) {
  return (
    <Link href="/" aria-label={label} className={cn('inline-flex shrink-0', className)}>
      <Image
        src="/images/logo.png"
        alt="Magnificent Travel"
        width={502}
        height={282}
        sizes={`${widths[size]}px`}
        loading={priority ? 'eager' : undefined}
        className={cn('w-auto', sizes[size], light && 'brightness-0 invert')}
      />
    </Link>
  );
}
