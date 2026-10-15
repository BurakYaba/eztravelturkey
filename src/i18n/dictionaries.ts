import en from './dictionaries/en.json';
import zh from './dictionaries/zh.json';
import jp from './dictionaries/jp.json';
import type { Locale } from './config';

/** English is the source: the other languages must have exactly the same keys, or the build fails. */
export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = { en, zh, jp };

export const getDictionary = (lang: Locale): Dictionary => dictionaries[lang];

export { format } from './template';
