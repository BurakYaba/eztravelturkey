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
  className?: string;
};

/**
 * The starting price in every currency the client has filled in (D40): euro, dollar or both, with no switch and no
 * exchange rate. Nothing is shown for a currency without a price.
 */
export function TourPrice({ lang, eur, usd, text, size = 'card', className }: Props) {
  const amounts = [
    eur === null ? null : formatPrice(lang, eur, 'EUR'),
    usd === null ? null : formatPrice(lang, usd, 'USD'),
  ].filter((a): a is string => a !== null);

  if (amounts.length === 0) {
    return <p className={cn('text-navy-900 font-semibold', className)}>{text.onRequest}</p>;
  }
  return (
    <p className={cn('leading-tight', className)}>
      <span className="text-muted block text-xs">{text.from}</span>
      <span
        className={cn(
          'font-display text-navy-900 font-semibold',
          size === 'page' ? 'text-4xl' : 'text-2xl',
        )}>
        {amounts.map((amount, i) => (
          <span key={amount}>
            {i > 0 && <span className="text-muted mx-2 font-sans text-base font-normal">/</span>}
            {amount}
          </span>
        ))}
      </span>
      <span className="text-muted text-sm"> {text.perPerson}</span>
    </p>
  );
}
