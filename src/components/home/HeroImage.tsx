'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { Photo } from '../shared/Photo';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Slow upward drift of the hero photo while the page scrolls. It gives the skyline depth against the
 * fixed text and only runs when the visitor has not asked for reduced motion.
 */
export function HeroImage() {
  const wrapper = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(inner.current, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: wrapper },
  );

  return (
    <div ref={wrapper} className="absolute inset-0 overflow-hidden">
      <div ref={inner} className="absolute inset-x-0 -top-[8%] bottom-0 will-change-transform">
        <Photo
          id="hero-istanbul"
          sizes="100vw"
          priority
          quality={85}
          className="object-[72%_50%] md:object-[70%_50%]"
        />
      </div>
    </div>
  );
}
