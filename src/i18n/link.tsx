'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useLocale } from './locale-context';
import { localizeHref } from './paths';

type Props = ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for `next/link`. Internal paths are written without the language (`/tours`) and get the current
 * language prefix and a trailing slash (`/en/tours/`). External links, `#anchors` and `mailto:` pass through unchanged.
 */
export function Link({ href, ...props }: Props) {
  const lang = useLocale();
  const target = typeof href === 'string' ? localizeHref(lang, href) : href;
  return <NextLink href={target} {...props} />;
}
