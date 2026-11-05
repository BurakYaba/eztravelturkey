import credits from './image-credits.json';

export type PhotoId = keyof typeof credits;
export type ImageId = PhotoId | 'hero-istanbul' | 'multi-country';

export type Img = { src: string; alt: string; width: number; height: number };

const TARGET_WIDTH = 1880;

export function img(id: ImageId): Img {
  if (id === 'hero-istanbul') {
    return {
      src: '/images/hero-istanbul.png',
      alt: 'Istanbul skyline at sunset with the Bosphorus and mosque minarets',
      width: 1983,
      height: 793,
    };
  }
  if (id === 'multi-country') {
    // A 2 x 2 collage of the pictures of the four country pages (Turkey, Greece, Egypt, Jordan): the picture of "multi-country".
    return {
      src: '/images/multi-country.jpg',
      alt: 'Collage of Istanbul, Mykonos, the pyramids and Sphinx of Giza, and Petra',
      width: 900,
      height: 1200,
    };
  }
  const meta = credits[id];
  return {
    src: `/images/photos/${id}.jpg`,
    alt: meta.alt.replace(/\s+/g, ' ').trim(),
    width: TARGET_WIDTH,
    height: Math.round((TARGET_WIDTH * meta.height) / meta.width),
  };
}

export const photoCredits = Object.entries(credits).map(([id, c]) => ({
  id,
  photographer: c.photographer,
  photographerUrl: c.photographerUrl,
  pexelsUrl: c.pexelsUrl,
}));
