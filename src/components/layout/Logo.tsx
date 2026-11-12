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

// public/images/logo.png is the round "Magnificent Travel 中文" emblem the owner supplied on 2026-11-12 (EztravelLogo.png, 1254 x 1254): its cream
// background made transparent, trimmed and scaled to 512 x 512, so the footer can show it as a white line drawing on the navy background.
// The original is kept in data/brand/ (not in git). The emblem is square, so it needs height; the header is 80 px tall.
const sizes = {
  sm: 'h-12',
  md: 'h-[72px]',
  lg: 'h-28',
};
// The width each height gives (the logo is 512 x 512): the browser then fetches a picture of about that width instead of a larger
// one a plain width/height pair asks for.
const widths = { sm: 48, md: 72, lg: 112 };

export function Logo({ className, light = false, size = 'md', priority, label = 'Eztravel Turkey，回到首頁' }: Props) {
  return (
    <Link href="/" aria-label={label} className={cn('inline-flex shrink-0', className)}>
      <Image
        src="/images/logo.png"
        alt="Eztravel Turkey"
        width={512}
        height={512}
        sizes={`${widths[size]}px`}
        loading={priority ? 'eager' : undefined}
        className={cn('w-auto', sizes[size], light && 'brightness-0 invert')}
      />
    </Link>
  );
}
