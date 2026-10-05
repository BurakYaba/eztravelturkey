import type { ReactNode } from 'react';
import { TextLink } from './Button';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  link?: { href: string; label: string };
  as?: 'h1' | 'h2';
  className?: string;
  children?: ReactNode;
};

export function SectionHeading({ title, description, eyebrow, link, as: Tag = 'h2', className, children }: Props) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-10', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <Tag className="h-section">{title}</Tag>
        {description && <p className="text-muted mt-3 text-lg">{description}</p>}
        {children}
      </div>
      {link && <TextLink href={link.href}>{link.label}</TextLink>}
    </div>
  );
}
