import type { ImageId } from './images';

export type CountryId = 'turkey' | 'greece' | 'egypt' | 'jordan' | 'morocco';
export type TourStyle = 'private' | 'small-group';

export type Faq = { q: string; a: string };

export type Destination = {
  id: CountryId;
  name: string;
  tagline: string;
  summary: string;
  intro: string[];
  image: ImageId;
  heroImage: ImageId;
  bestTime: string;
  currency: string;
  highlights: { name: string; blurb: string; image: ImageId }[];
  whyGo: string[];
  faqs: Faq[];
  /** True when the live site lists tours for this country that are modelled on this site. */
  hasTours: boolean;
};

export type ItineraryDay = {
  day: string;
  title: string;
  text: string;
  meals: string;
  overnight: string;
};

export type Tour = {
  slug: string;
  title: string;
  subtitle: string;
  countries: CountryId[];
  styles: TourStyle[];
  nights: number;
  days: number;
  fromPriceEUR: number;
  route: string[];
  difficulty: 'Easy' | 'Easy to moderate' | 'Moderate';
  season: string;
  guideLanguages: string[];
  flights: string;
  hotels: string;
  summary: string;
  overview: string;
  highlights: string[];
  stops: { name: string; blurb: string; image: ImageId }[];
  whyChoose: { title: string; text: string }[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  requirements: { title: string; text: string }[];
  faqs: Faq[];
  image: ImageId;
  gallery: ImageId[];
  related: string[];
  /** Itinerary written from the route outline, not copied from the live site. Needs owner review. */
  draft?: boolean;
};

export type Combo = {
  slug: string;
  name: string;
  countries: CountryId[];
  daysMin: number;
  daysMax: number;
  fromPriceEUR: number;
  route: string[];
  image: ImageId;
  image2: ImageId;
  summary: string;
  intro: string[];
  pairing: string;
  logistics: string;
  bestTime: string;
  faqs: Faq[];
};

export type Review = {
  name: string;
  date: string;
  text: string;
};
