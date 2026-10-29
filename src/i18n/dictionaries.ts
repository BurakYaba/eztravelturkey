import zh from './dictionaries/zh.json';
import type { Locale } from './config';

/** The source of the dictionary type; any further language must have exactly the same keys, or the build fails. */
export type Dictionary = typeof zh;

export const dictionaries: Record<Locale, Dictionary> = { zh };

export const getDictionary = (lang: Locale): Dictionary => dictionaries[lang];

export { format } from './template';
