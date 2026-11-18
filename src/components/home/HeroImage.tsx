import { preload } from 'react-dom';
import { img } from '@/data/images';

// The hero is pre-encoded: static WebP files in public/images/hero (made from public/images/hero-istanbul.png, the name carries a hash of
// the content so the files can be cached for a year). The image optimizer would encode it on its first request after every deploy and
// its cache is cold then. The phone gets the strip it shows (a 412 x 240 box, object-position 72% 50%), the rest two widths.
// Re-make them with the same names pattern if the picture changes, and change the names here.
const phone = '/images/hero/istanbul-phone-720.f3ba188e.webp';
const w1280 = '/images/hero/istanbul-1280.1f2d31a3.webp';
const w1920 = '/images/hero/istanbul-1920.c1ac4a9d.webp';
const desktopSrcSet = `${w1280} 1280w, ${w1920} 1920w`;
const phoneMedia = '(max-width: 767px)';
const desktopMedia = '(min-width: 768px)';

/**
 * The hero photo. It stays still: the scroll parallax was removed (docs/project-plan.md D26) because its script cost
 * more in loading and interaction time than the effect was worth. It is the largest paint of the page (P9.13): the preload goes
 * to the head with the highest priority (React does not add one for the `img` of a `picture`; a `link` written in the JSX would
 * land in the body, where it does nothing).
 */
export function HeroImage() {
  // `media` and `type` are valid on a preload link; React's type for the options does not list them.
  preload(phone, { as: 'image', fetchPriority: 'high', media: phoneMedia, type: 'image/webp' } as Parameters<
    typeof preload
  >[1]);
  preload(w1280, {
    as: 'image',
    imageSrcSet: desktopSrcSet,
    imageSizes: '100vw',
    fetchPriority: 'high',
    media: desktopMedia,
    type: 'image/webp',
  } as Parameters<typeof preload>[1]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <picture>
        <source media={phoneMedia} srcSet={phone} type="image/webp" />
        <source media={desktopMedia} srcSet={desktopSrcSet} sizes="100vw" type="image/webp" />
        <img
          src={w1280}
          alt={img('hero-istanbul').alt}
          width={1280}
          height={512}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[72%_50%] md:object-[70%_50%]"
        />
      </picture>
    </div>
  );
}
