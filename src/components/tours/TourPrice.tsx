import type { Locale } from '@/i18n/config';
import { formatPrice } from '@/i18n/format';
import { cn } from '@/lib/utils';

type Props = {
  lang: Locale;
  eur: number | null;
  usd: number | null;
  text: { from: string; perPerson: string; onRequest: string };
  /** `card` is the small block on a tour card; `page` is the larger one on the tour page. */
  size?: 'card' | 'page';
  /** `dark` is for the navy price card beside the tour page. */
  tone?: 'light' | 'dark';
  className?: string;
};

/**
 * The starting price in every currency the client has filled in (D40): euro, dollar or both, with no switch and no
 * exchange rate. Nothing is shown for a currency without a price.
 */
export function TourPrice({ lang, eur, usd, text, size = 'card', tone = 'light', className }: Props) {
  const amounts = [
    eur === null ? null : formatPrice(lang, eur, 'EUR'),
    usd === null ? null : formatPrice(lang, usd, 'USD'),
  ].filter((a): a is string => a !== null);

  if (amounts.length === 0) {
    return <p className={cn('font-semibold', tone === 'dark' ? 'text-white' : 'text-navy-900', className)}>{text.onRequest}</p>;
  }
  return (
    <p className={cn('leading-tight', className)}>
      <span className={cn('block text-xs', tone === 'dark' ? 'text-gold-100' : 'text-muted')}>{text.from}</span>
      <span
        className={cn(
          'font-display font-semibold',
          tone === 'dark' ? 'text-white' : 'text-navy-900',
          size === 'page' ? 'text-4xl' : 'text-2xl',
        )}>
        {amounts.map((amount, i) => (
          <span key={amount}>
            {i > 0 && <span className={cn('mx-2 font-sans text-base font-normal', tone === 'dark' ? 'text-white/60' : 'text-muted')}>/</span>}
            {amount}
          </span>
        ))}
      </span>
      <span className={cn('text-sm', tone === 'dark' ? 'text-white/80' : 'text-muted')}> {text.perPerson}</span>
    </p>
  );
}
