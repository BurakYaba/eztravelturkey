import type { StructureResolver } from 'sanity/structure';
import { languages } from './schemaTypes/fields';

type Builder = Parameters<StructureResolver>[0];

/** A list of one document type that opens a language first: Tours, then English, 繁體中文 or 日本語. Every list and item needs an id. */
const byLanguage = (S: Builder, type: string, title: string, orderBy = 'path') =>
  S.listItem()
    .id(type)
    .title(title)
    .child(
      S.list()
        .id(`${type}-languages`)
        .title(title)
        .items(
          languages.map((language) =>
            S.listItem()
              .id(`${type}-${language.value}`)
              .title(language.title)
              .child(
                S.documentList()
                  .id(`${type}-${language.value}-documents`)
                  .title(`${title}: ${language.title}`)
                  .schemaType(type)
                  .apiVersion('2025-01-01')
                  .filter('_type == $type && language == $language')
                  .params({ type, language: language.value })
                  .defaultOrdering([{ field: orderBy, direction: 'asc' }]),
              ),
          ),
        ),
    );

/** The home page is one document per language. */
const homePages = (S: Builder) =>
  S.listItem()
    .id('homePage')
    .title('Ana sayfa')
    .child(
      S.list()
        .id('homePage-languages')
        .title('Ana sayfa')
        .items(
          languages.map((language) =>
            S.listItem()
              .id(`homePage-${language.value}`)
              .title(language.title)
              .child(
                S.documentList()
                  .id(`homePage-${language.value}-documents`)
                  .title(`Ana sayfa: ${language.title}`)
                  .schemaType('homePage')
                  .apiVersion('2025-01-01')
                  .filter('_type == "homePage" && language == $language')
                  .params({ language: language.value }),
              ),
          ),
        ),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Magnificent Travel')
    .items([
      byLanguage(S, 'tour', 'Turlar'),
      byLanguage(S, 'destinationPage', 'Destinasyon sayfaları'),
      byLanguage(S, 'blogPost', 'Blog yazıları'),
      byLanguage(S, 'blogCategory', 'Blog kategorileri'),
      byLanguage(S, 'author', 'Yazarlar'),
      byLanguage(S, 'staticPage', 'Metin sayfaları (hakkımızda, yasal)'),
      byLanguage(S, 'hubPage', 'Ana bölüm sayfaları (Destinasyonlar, Blog)'),
      homePages(S),
      byLanguage(S, 'teamMember', 'Ekip (Hakkımızda ve İletişim sayfaları)', 'order'),
    ]);
