import { defineConfig } from 'sanity';
import { trTRLocale } from '@sanity/locale-tr-tr';
import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';
import { languageTemplates, templatedTypes, tourInFolder } from './templates';

/** Where the site runs: the real domain (since the launch, 2026-10-27). `SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000` previews the local site. */
const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? 'https://www.eztravelturkey.com';

/** The address a document has on the site: language, then the path the editor sees in the "Page address" field. */
const locationOf = (doc: { title?: string; language?: string; path?: string } | null) =>
  doc?.language
    ? { locations: [{ title: doc.title || 'Başlıksız', href: `/${doc.language}/${encodeURI(doc.path ?? '')}${doc.path ? '/' : ''}` }] }
    : null;

/**
 * Which document a page of the site shows, so the Studio can open it next to the preview. The page at `/en/blog/turkey/x/`
 * is the document whose address (`path`) is `blog/turkey/x` in English; the home page is the home document of its language.
 * Addresses have one to four parts after the language.
 */
const pageTypes = '["tour","destinationPage","blogPost","blogCategory","author","staticPage","hubPage"]';
const mainDocuments = defineDocuments([
  { route: '/:lang', filter: '_type == "homePage" && language == $lang' },
  { route: '/:lang/:a', filter: `_type in ${pageTypes} && language == $lang && path == $a` },
  { route: '/:lang/:a/:b', filter: `_type in ${pageTypes} && language == $lang && path == $a + "/" + $b` },
  { route: '/:lang/:a/:b/:c', filter: `_type in ${pageTypes} && language == $lang && path == $a + "/" + $b + "/" + $c` },
  { route: '/:lang/:a/:b/:c/:d', filter: `_type in ${pageTypes} && language == $lang && path == $a + "/" + $b + "/" + $c + "/" + $d` },
]);

export default defineConfig({
  name: 'default',
  title: 'Eztravel Turkey',
  projectId: '91izz3mt',
  // The published Studio edits `production`; `SANITY_STUDIO_DATASET=staging npm run dev` tries things on the test copy instead.
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [
    // The Studio's own words (menus, buttons, messages) in Turkish; with this plugin installed it is the default language of the
    // interface. The field names and hints are ours, written in the schema (also in Turkish).
    trTRLocale(),
    structureTool({ structure, title: 'İçerik' }),
    // Preview of unpublished changes on the real site (docs/project-plan.md P6.5). The site checks a one-time secret that
    // only a signed-in editor can create, then turns on Next.js Draft Mode for that browser.
    presentationTool({
      title: 'Önizleme',
      previewUrl: { origin: previewOrigin, previewMode: { enable: '/api/draft/', disable: '/api/draft/disable/' } },
      resolve: {
        mainDocuments,
        locations: Object.fromEntries(
          ['tour', 'destinationPage', 'blogPost', 'blogCategory', 'author', 'staticPage', 'hubPage', 'homePage'].map((type) => [
            type,
            defineLocations({ select: { title: 'title', language: 'language', path: 'path' }, resolve: locationOf }),
          ]),
        ),
      },
    }),
  ],
  // Releases (grouped publishing) is not used and its name is not translated; the tool is hidden to keep the top bar simple.
  releases: { enabled: false },
  // Scheduled drafts is a paid feature (the free plan has no scheduled publishing); hidden for the same reason.
  scheduledDrafts: { enabled: false },
  // Tasks and comments are also paid features of the trial; the free plan has neither.
  tasks: { enabled: false },
  document: {
    comments: { enabled: false },
    // The lists have their own "+" (structure.ts) that starts the document in the list's language and country; the default one,
    // which lists the template of every language, is hidden there. The top bar's "+" keeps the per-language templates.
    newDocumentOptions: (previous, { creationContext }) => (creationContext.type === 'structure' ? [] : previous),
  },
  schema: {
    types: schemaTypes,
    // The default "new document" of a type has no language; each language has its own (and a tour can start in a country folder).
    templates: (previous) => [...previous.filter((template) => !templatedTypes.includes(template.schemaType)), ...languageTemplates, tourInFolder],
  },
});
