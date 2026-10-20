import type { Template } from 'sanity';
import { languages } from './schemaTypes/fields';

/**
 * What "+" creates. Every new document starts in the language of the list it is created in (and a tour created inside a country
 * folder starts in that country), so the editor never picks the language by hand and cannot put a page in the wrong language.
 */
const types: [string, string][] = [
  ['tour', 'Tur'],
  ['destinationPage', 'Destinasyon sayfası'],
  ['blogPost', 'Blog yazısı'],
  ['blogCategory', 'Blog kategorisi'],
  ['author', 'Yazar'],
  ['staticPage', 'Metin sayfası'],
  ['hubPage', 'Ana bölüm sayfası'],
  ['teamMember', 'Ekip üyesi'],
];

/** The document types these templates replace (the default one, without a language, is hidden). */
export const templatedTypes = [...types.map(([type]) => type), 'homePage'];

export const languageTemplates: Template[] = types.flatMap(([type, title]) =>
  languages.map((language) => ({
    id: `${type}-${language.value}`,
    title: `${title}: ${language.title}`,
    schemaType: type,
    value: { language: language.value },
  })),
);

/** A tour created inside a country folder of the Turlar list. */
export const tourInFolder: Template = {
  id: 'tour-in-folder',
  title: 'Tur (klasörde)',
  schemaType: 'tour',
  parameters: [
    { name: 'language', type: 'string' },
    { name: 'parent', type: 'string' },
  ],
  value: (parameters: { language: string; parent: string }) => ({ language: parameters.language, parent: parameters.parent }),
};
