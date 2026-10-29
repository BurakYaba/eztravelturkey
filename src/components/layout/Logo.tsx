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

// public/images/logo.png is the logo of the old eztravelturkey.com (300 x 61, transparent; a temporary choice of the owner,
// 2026-10-29; the file is small, so a sharper one should replace it).
const sizes = {
  sm: 'h-8',
  md: 'h-11',
  lg: 'h-14',
};
// The width each height gives (the logo is 300 x 61): the browser then fetches a picture of about that width instead of a larger
// one a plain width/height pair asks for.
const widths = { sm: 157, md: 216, lg: 275 };

export function Logo({ className, light = false, size = 'md', priority, label = 'Eztravel Turkey，回到首頁' }: Props) {
  return (
    <Link href="/" aria-label={label} className={cn('inline-flex shrink-0', className)}>
      <Image
        src="/images/logo.png"
        alt="Eztravel Turkey"
        width={300}
        height={61}
        sizes={`${widths[size]}px`}
        loading={priority ? 'eager' : undefined}
        className={cn('w-auto', sizes[size], light && 'brightness-0 invert')}
      />
    </Link>
  );
}
