import { useId } from 'react';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/** Small inline flags, so nothing is downloaded and they look the same on every system (emoji flags do not show on Windows). */
export function Flag({ locale, className }: { locale: Locale; className?: string }) {
  const uid = useId();
  const box = cn('h-4 w-6 shrink-0 rounded-[3px] ring-1 ring-black/15', className);

  if (locale === 'jp') {
    return (
      <svg viewBox="0 0 90 60" className={box} aria-hidden>
        <rect width="90" height="60" fill="#fff" />
        <circle cx="45" cy="30" r="18" fill="#bc002d" />
      </svg>
    );
  }

  if (locale === 'zh') {
    return (
      <svg viewBox="0 0 90 60" className={box} aria-hidden>
        <rect width="90" height="60" fill="#fe0000" />
        <rect width="45" height="30" fill="#000095" />
        <g fill="#fff">
          {Array.from({ length: 12 }, (_, i) => (
            <polygon key={i} points="22.5,1.2 20.6,6.4 24.4,6.4" transform={`rotate(${i * 30} 22.5 15)`} />
          ))}
          <circle cx="22.5" cy="15" r="6.6" />
        </g>
        <circle cx="22.5" cy="15" r="5.5" fill="#000095" />
        <circle cx="22.5" cy="15" r="4.7" fill="#fff" />
      </svg>
    );
  }

  const clipA = `${uid}-a`;
  const clipB = `${uid}-b`;
  return (
    <svg viewBox="0 0 60 30" className={box} aria-hidden>
      <clipPath id={clipA}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={clipB}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${clipA})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${clipB})`} stroke="#c8102e" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}
