import { Photo } from '../shared/Photo';

/**
 * The hero photo. It stays still: the scroll parallax was removed (docs/project-plan.md D26) because its script cost
 * more in loading and interaction time than the effect was worth. `priority` loads it at once with the highest fetch priority; it is the largest paint of the page (P9.13).
 */
export function HeroImage() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Photo
        id="hero-istanbul"
        sizes="100vw"
        priority
        quality={85}
        className="object-[72%_50%] md:object-[70%_50%]"
      />
    </div>
  );
}
