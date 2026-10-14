import type { StructureResolver } from 'sanity/structure';
import { languages } from './schemaTypes/fields';

/** A list of one document type that opens a language first: Tours, then English, 繁體中文 or 日本語. */
const byLanguage = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem()
    .title(title)
    .child(
      S.list()
        .title(title)
        .items(
          languages.map((language) =>
            S.listItem()
              .title(language.title)
              .child(
                S.documentList()
                  .title(`${title}: ${language.title}`)
                  .filter('_type == $type && language == $language')
                  .params({ type, language: language.value })
                  .defaultOrdering([{ field: 'path', direction: 'asc' }]),
              ),
          ),
        ),
    );

/** The home page is one document per language. */
const homePages = (S: Parameters<StructureResolver>[0]) =>
  S.listItem()
    .title('Home page')
    .child(
      S.list()
        .title('Home page')
        .items(
          languages.map((language) =>
            S.listItem()
              .title(language.title)
              .child(
                S.documentList()
                  .title(`Home page: ${language.title}`)
                  .filter('_type == "homePage" && language == $language')
                  .params({ language: language.value }),
              ),
          ),
        ),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Magnificent Travel')
    .items([
      byLanguage(S, 'tour', 'Tours'),
      byLanguage(S, 'destinationPage', 'Destination pages'),
      byLanguage(S, 'blogPost', 'Blog posts'),
      byLanguage(S, 'blogCategory', 'Blog categories'),
      byLanguage(S, 'author', 'Authors'),
      byLanguage(S, 'staticPage', 'Text pages (about, legal)'),
      byLanguage(S, 'hubPage', 'Hub pages'),
      homePages(S),
    ]);
