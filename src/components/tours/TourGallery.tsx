'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CaretLeft, CaretRight, MagnifyingGlassPlus, X } from '@phosphor-icons/react/dist/ssr';
import type { Dictionary } from '@/i18n/dictionaries';
import { format } from '@/i18n/template';
import type { ImageRef } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { Picture } from '../shared/Picture';

type Props = {
  images: ImageRef[];
  title: string;
  text: Dictionary['tour']['lightbox'];
  /** Template for the alt text of a photo: "{title}, photo {n}". */
  photoLabel: string;
};

const swipeDistance = 50;
const control =
  'grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none active:scale-95';

/**
 * The tour's photos: a mosaic on the page and a full-screen viewer. The viewer is a native `<dialog>`, so the browser
 * traps focus, closes on Escape and hands focus back to the photo that opened it. Arrow keys, the buttons, a swipe and
 * the thumbnail strip all move between photos. The page itself carries no JavaScript cost until a photo is opened:
 * the photos are plain buttons in the first HTML.
 */
export function TourGallery({ images, title, text, photoLabel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const swipeFrom = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

  const total = images.length;
  const alt = (i: number) => format(photoLabel, { title, n: i + 1 });

  const show = useCallback((i: number) => setCurrent(((i % total) + total) % total), [total]);

  function openAt(i: number) {
    setCurrent(i);
    setOpen(true);
    dialog.current?.showModal();
  }

  // The page behind the viewer does not scroll while it is open.
  useEffect(() => {
    if (!open) {
      return;
    }
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = before;
    };
  }, [open]);

  // Keep the active thumbnail visible in the strip.
  useEffect(() => {
    if (!open) {
      return;
    }
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.current
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
  }, [current, open]);

  function onKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key === 'ArrowLeft') {
      show(current - 1);
    } else if (e.key === 'ArrowRight') {
      show(current + 1);
    }
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    swipeFrom.current = e.clientX;
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    if (swipeFrom.current === null) {
      return;
    }
    const moved = e.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(moved) > swipeDistance) {
      show(current + (moved < 0 ? 1 : -1));
    }
  }

  const image = images[current];
  const ratio = image.width / image.height;

  return (
    <>
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        {images.map((photo, i) => {
          const feature = i === 0 && total >= 5;
          return (
            <li key={`${photo.src}-${i}`} className={cn(feature && 'col-span-2 md:row-span-2')}>
              <button
                type="button"
                onClick={() => openAt(i)}
                aria-label={format(text.open, { n: i + 1, total })}
                className={cn(
                  'group bg-cream-100 focus-visible:ring-gold-600 relative block w-full cursor-zoom-in overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  feature ? 'aspect-16/10 md:aspect-auto md:h-full md:min-h-80' : 'aspect-4/3',
                )}>
                <Picture
                  image={photo}
                  alt=""
                  sizes={feature ? '(min-width: 1024px) 32rem, 100vw' : '(min-width: 1024px) 16rem, 50vw'}
                  className="motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="text-navy-950 absolute right-2.5 bottom-2.5 grid size-9 place-items-center rounded-full bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <MagnifyingGlassPlus size={20} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        aria-label={title}
        onClose={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-white">
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
              <p className="min-w-0 truncate text-sm text-white/80">{title}</p>
              <button type="button" onClick={() => dialog.current?.close()} className={control}>
                <X size={22} weight="bold" aria-hidden />
                <span className="sr-only">{text.close}</span>
              </button>
            </div>

            <div
              onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-2 md:px-20">
              <button
                type="button"
                onClick={() => show(current - 1)}
                className={cn(control, 'absolute left-2 z-10 md:left-6')}>
                <CaretLeft size={22} weight="bold" aria-hidden />
                <span className="sr-only">{text.previous}</span>
              </button>

              <div
                key={current}
                className="lightbox-photo relative"
                style={{
                  aspectRatio: ratio,
                  width: `min(100%, calc(70dvh * ${ratio}), ${Math.round(image.width * 1.25)}px)`,
                }}>
                <Picture
                  image={image}
                  alt={alt(current)}
                  sizes="(min-width: 1024px) 60rem, 100vw"
                  quality={85}
                  priority
                  className="rounded-md object-contain"
                />
              </div>

              <button
                type="button"
                onClick={() => show(current + 1)}
                className={cn(control, 'absolute right-2 z-10 md:right-6')}>
                <CaretRight size={22} weight="bold" aria-hidden />
                <span className="sr-only">{text.next}</span>
              </button>
              <p className="sr-only" aria-live="polite">
                {format(text.position, { n: current + 1, total })}
              </p>
            </div>

            <ul
              ref={strip}
              aria-label={text.photos}
              className="flex justify-start gap-2 overflow-x-auto px-4 py-4 md:justify-center md:px-6">
              {images.map((photo, i) => (
                <li key={`${photo.src}-${i}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => show(i)}
                    aria-label={format(text.position, { n: i + 1, total })}
                    aria-current={i === current}
                    className={cn(
                      'focus-visible:ring-gold-500 relative block h-14 w-20 overflow-hidden rounded-md ring-2 transition focus-visible:outline-none md:h-16 md:w-24',
                      i === current ? 'ring-gold-500' : 'opacity-60 ring-transparent hover:opacity-100',
                    )}>
                    <Picture image={photo} alt="" sizes="6rem" quality={50} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </dialog>
    </>
  );
}
