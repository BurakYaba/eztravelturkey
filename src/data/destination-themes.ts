import type { CountryId } from './types';

/**
 * Visual identity of each destination page. Colors are used for ornaments only; buttons and body text keep the
 * brand navy and bronze. Ornament files live in public/ornaments (built by scripts/build-ornaments.mjs).
 */
export type DestinationTheme = {
  id: CountryId;
  /** Dark section color. The skyline silhouette is drawn in the same color so it rises out of the next section. */
  deep: string;
  /** Ornament color on light backgrounds. */
  ink: string;
  /** Ornament color on the deep section. */
  onDeep: string;
  /** Light tinted section background. */
  tint: string;
  /** Edge length of the repeating tile pattern, in px. */
  tileSize: number;
  /** Name of the visual motif, used in the alt-style caption under the heading ornament. */
  motif: string;
  /** Short line shown above the page title. */
  eyebrow: string;
};

export const destinationThemes: Record<CountryId, DestinationTheme> = {
  turkey: {
    id: 'turkey',
    deep: '#0f3f6b',
    ink: '#1c5c93',
    onDeep: '#7fb6e0',
    tint: '#eaf2f8',
    tileSize: 76,
    motif: 'Iznik tile and Ottoman skyline',
    eyebrow: 'Ottoman heritage',
  },
  greece: {
    id: 'greece',
    deep: '#0a4a8a',
    ink: '#0b5ca8',
    onDeep: '#9cc6ec',
    tint: '#edf3f9',
    tileSize: 64,
    motif: 'Greek key and Doric temple',
    eyebrow: 'Hellenic world',
  },
  egypt: {
    id: 'egypt',
    deep: '#1f3166',
    ink: '#8a5a12',
    onDeep: '#d6a63c',
    tint: '#f6ecd6',
    tileSize: 56,
    motif: 'Lotus frieze and pyramids',
    eyebrow: 'Land of the pharaohs',
  },
  jordan: {
    id: 'jordan',
    deep: '#7b2f25',
    ink: '#a8483a',
    onDeep: '#eab68c',
    tint: '#f7ebe1',
    tileSize: 120,
    motif: 'Nabataean steps and rose-red rock',
    eyebrow: 'Nabataean kingdom',
  },
  morocco: {
    id: 'morocco',
    deep: '#134e3d',
    ink: '#1c6b52',
    onDeep: '#e2c277',
    tint: '#e9f1ec',
    tileSize: 190,
    motif: 'Zellige stars and kasbah walls',
    eyebrow: 'Imperial cities',
  },
};

export const getTheme = (id: CountryId) => destinationThemes[id];
