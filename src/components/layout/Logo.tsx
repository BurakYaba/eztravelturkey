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

// public/images/logo.png is the "Magnificent Travel 中文" logo the owner supplied on 2026-11-07 (eztravellogo.png, 1536 x 1024), its transparent
// margins trimmed and scaled to 640 x 404. It is a wide logo; the original files are kept in data/brand/ (not in git).
const sizes = {
  sm: 'h-12',
  md: 'h-[68px]',
  lg: 'h-24',
};
// The width each height gives (the logo is 640 x 404): the browser then fetches a picture of about that width instead of a larger
// one a plain width/height pair asks for.
const widths = { sm: 76, md: 108, lg: 152 };

export function Logo({ className, light = false, size = 'md', priority, label = 'Eztravel Turkey，回到首頁' }: Props) {
  return (
    <Link href="/" aria-label={label} className={cn('inline-flex shrink-0', className)}>
      <Image
        src="/images/logo.png"
        alt="Eztravel Turkey"
        width={640}
        height={404}
        sizes={`${widths[size]}px`}
        loading={priority ? 'eager' : undefined}
        className={cn('w-auto', sizes[size], light && 'brightness-0 invert')}
      />
    </Link>
  );
}
