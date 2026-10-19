import { defineField, defineType, type ValidationContext } from 'sanity';
import { BlogPathInput } from '../components/BlogPathInput';
import {
  languageField,
  mainImageField,
  metaDescriptionField,
  metaTitleField,
  pageFields,
  pathField,
  titleField,
} from './fields';

/**
 * Every text page type shares the same fields. The `kind` tells the site how to use the page and is set by the type
 * (destination pages and hub pages choose it themselves).
 */
const kindField = (options: { value: string; title: string }[], initial: string, editable: boolean) =>
  defineField({
    name: 'kind',
    title: 'Kind of page',
    type: 'string',
    options: { list: options, layout: 'radio' },
    initialValue: initial,
    readOnly: !editable,
    validation: (rule) => rule.required(),
  });

const kinds = {
  destinationPage: [
    { value: 'country', title: 'Country' },
    { value: 'combo', title: 'Multi-country combination' },
    { value: 'category', title: 'Category (length or package)' },
  ],
  hubPage: [
    { value: 'destinations-hub', title: 'Destinations hub' },
    { value: 'blog-hub', title: 'Blog hub' },
  ],
};

function pageType(
  name: string,
  title: string,
  kind: string,
  kindOptions?: { value: string; title: string }[],
  extraFields: ReturnType<typeof defineField>[] = [],
  replaceFields: Record<string, ReturnType<typeof defineField>> = {},
) {
  return defineType({
    name,
    title,
    type: 'document',
    fields: [
      pageFields[0]!,
      kindField(kindOptions ?? [{ value: kind, title }], kind, Boolean(kindOptions)),
      ...pageFields.slice(1).map((field) => replaceFields[field.name] ?? field),
      ...extraFields,
    ],
    orderings: [{ title: 'Page address', name: 'path', by: [{ field: 'path', direction: 'asc' }] }],
    preview: { select: { title: 'title', subtitle: 'path', media: 'mainImage' } },
  });
}

export const destinationPage = pageType('destinationPage', 'Destination page', 'country', kinds.destinationPage);
/** Posts created before this day were moved from the old site and may stay without an author. */
const legacyCutoff = '2026-10-19';

/** The old addresses of a post, as the editor may paste them: `/en/blog/x/y/`, without the last slash or with the whole domain. */
export const normalizeOldUrl = (value: string) =>
  `/${value
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')}/`.toLowerCase();

/** Fields only blog posts have: who wrote it, the answer in a nutshell and when the facts were last checked. */
const blogFields = [
  defineField({
    name: 'author',
    title: 'Author',
    type: 'reference',
    to: [{ type: 'author' }],
    description: 'Shown as the byline and in the author card. Required for new posts (readers and search engines trust a named author).',
    validation: (rule) =>
      rule.custom((value, context: ValidationContext) => {
        // The 34 posts moved from the old site have no author and are credited to Magnificent Travel; only new posts need one.
        const created = (context.document as { _createdAt?: string } | undefined)?._createdAt ?? '';
        return value || (created && created < legacyCutoff) ? true : 'Choose the author of this post.';
      }),
  }),
  defineField({
    name: 'shortAnswer',
    title: 'Short answer',
    type: 'text',
    rows: 3,
    description: 'The answer to the question of the post in 40 to 60 words. Shown in a highlighted box before the text.',
    validation: (rule) => rule.max(400).warning('Keep the short answer under about 60 words.'),
  }),
  defineField({
    name: 'lastUpdated',
    title: 'Last updated',
    type: 'date',
    description: 'The day the facts in the post were last checked. Shown on the page and in search results.',
  }),
  defineField({
    name: 'oldUrls',
    title: 'Old addresses of this post (redirects)',
    type: 'array',
    of: [{ type: 'string' }],
    description:
      'Only when this post replaces a post of the old site: paste the old address, for example /en/blog/turkey/old-name/. Visitors and Google who use it are sent to this post (a permanent redirect). The redirect starts after the next site update, about 5 minutes after you publish.',
    validation: (rule) =>
      rule.custom(async (values: string[] | undefined, context: ValidationContext) => {
        if (!values?.length) {return true;}
        const doc = context.document as { _id?: string; language?: string; path?: string } | undefined;
        const id = (doc?._id ?? '').replace(/^drafts\./, '');
        const own = `/${doc?.language ?? 'en'}/${doc?.path ?? ''}/`;
        const client = context.getClient({ apiVersion: '2025-01-01' });
        const seen = new Set<string>();
        for (const value of values) {
          const url = normalizeOldUrl(value);
          const match = /^\/(en|cn|jp)\/(.+)\/$/.exec(url);
          if (!match) {return `${value}: write the address of the old page, starting with /en/, /cn/ or /jp/.`;}
          if (url === own.toLowerCase()) {return `${value}: that is the address of this post itself.`;}
          if (seen.has(url)) {return `${value}: listed twice.`;}
          seen.add(url);
          const [, language, path] = match;
          const clash = await client.fetch<{ title: string } | null>(
            '*[defined(path) && language == $language && path == $path && !(_id in [$id, "drafts." + $id])][0]{ title }',
            { language, path, id },
          );
          if (clash) {return `${value}: a page already exists at this address ("${clash.title}"), so it cannot be redirected.`;}
          const taken = await client.fetch<{ title: string } | null>(
            '*[_type == "blogPost" && !(_id in [$id, "drafts." + $id]) && $url in oldUrls[]][0]{ title }',
            { url, id },
          );
          if (taken) {return `${value}: already used by the post "${taken.title}".`;}
        }
        return true;
      }),
  }),
];

export const blogPost = pageType('blogPost', 'Blog post', 'blog-post', undefined, blogFields, {
  path: { ...pathField, components: { input: BlogPathInput } },
});
export const blogCategory = pageType('blogCategory', 'Blog category', 'blog-category');
export const author = pageType('author', 'Author', 'author');
export const staticPage = pageType('staticPage', 'Text page (about, legal)', 'static');
export const hubPage = pageType('hubPage', 'Hub page', 'destinations-hub', kinds.hubPage);

/** The home page of a language: its meta texts and the cards (combinations and tours) it features. */
export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fields: [
    languageField,
    defineField({ name: 'kind', title: 'Kind of page', type: 'string', initialValue: 'home', readOnly: true }),
    titleField,
    metaTitleField,
    metaDescriptionField,
    mainImageField,
    defineField({
      name: 'cards',
      title: 'Featured cards',
      type: 'array',
      description: 'The combinations and tours the home page highlights, in order.',
      of: [
        defineField({
          name: 'card',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'href', title: 'Link', type: 'string', description: 'Site address such as /destinations/turkey-greece-tours/' }),
            defineField({ name: 'meta', title: 'Short facts', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'price', title: 'Price text', type: 'string' }),
            defineField({ name: 'image', title: 'Picture', type: 'picture' }),
          ],
          preview: { select: { title: 'title', subtitle: 'href', media: 'image' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'language' } },
});
