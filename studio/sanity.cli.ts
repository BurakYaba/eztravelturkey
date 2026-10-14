import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: 'aj0pbi0w', dataset: 'production' },
  // The Studio is hosted by Sanity at https://magnificenttravel.sanity.studio (`npm run deploy`).
  studioHost: 'magnificenttravel',
});
