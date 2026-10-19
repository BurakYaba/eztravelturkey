import { defineConfig } from 'sanity';
import { trTRLocale } from '@sanity/locale-tr-tr';
import { defineLocations, presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';

/** Where the site runs. Change it to the real domain when it is attached; `SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000` previews the local site. */
const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? 'https://magnificenttravel.vercel.app';

/** The address a document has on the site: language, then the path the editor sees in the "Page address" field. */
const locationOf = (doc: { title?: string; language?: string; path?: string } | null) =>
  doc?.language
    ? { locations: [{ title: doc.title || 'Untitled', href: `/${doc.language}/${encodeURI(doc.path ?? '')}${doc.path ? '/' : ''}` }] }
    : null;

export default defineConfig({
  name: 'default',
  title: 'Magnificent Travel',
  projectId: 'aj0pbi0w',
  dataset: 'production',
  plugins: [
    // The Studio's own words (menus, buttons, messages) in Turkish; with this plugin installed it is the default language of the
    // interface (each user can still pick English from the profile menu). The field names and hints are ours, written in the schema.
    trTRLocale(),
    structureTool({ structure }),
    // Preview of unpublished changes on the real site (docs/project-plan.md P6.5). The site checks a one-time secret that
    // only a signed-in editor can create, then turns on Next.js Draft Mode for that browser.
    presentationTool({
      previewUrl: { origin: previewOrigin, previewMode: { enable: '/api/draft/', disable: '/api/draft/disable/' } },
      resolve: {
        locations: Object.fromEntries(
          ['tour', 'destinationPage', 'blogPost', 'blogCategory', 'author', 'staticPage', 'hubPage', 'homePage'].map((type) => [
            type,
            defineLocations({ select: { title: 'title', language: 'language', path: 'path' }, resolve: locationOf }),
          ]),
        ),
      },
    }),
  ],
  schema: { types: schemaTypes },
});
