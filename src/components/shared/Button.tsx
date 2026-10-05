import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'light' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition duration-200 ease-out active:translate-y-px active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-gold-600 text-white hover:bg-gold-700 shadow-[0_6px_16px_-8px_rgb(133_89_26/0.8)]',
  secondary: 'border border-navy-900/25 bg-white text-navy-900 hover:border-navy-900 hover:bg-cream-50',
  light: 'bg-white text-navy-900 hover:bg-cream-100',
  ghost: 'text-navy-900 hover:bg-navy-900/5',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 px-7 text-base',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  arrow,
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      {arrow && <ArrowRight size={18} weight="bold" aria-hidden />}
    </Link>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  arrow,
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      {arrow && <ArrowRight size={18} weight="bold" aria-hidden />}
    </button>
  );
}

/** Anchor styled as a button, for external links such as WhatsApp. */
export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  arrow,
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<'a'>, 'className' | 'children'>) {
  return (
    <a className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      {arrow && <ArrowRight size={18} weight="bold" aria-hidden />}
    </a>
  );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'group text-navy-900 decoration-gold-500/60 hover:decoration-gold-600 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 transition',
        className,
      )}>
      {children}
      <ArrowRight size={16} weight="bold" className="transition group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
