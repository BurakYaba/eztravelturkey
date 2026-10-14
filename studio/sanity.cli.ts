import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: 'aj0pbi0w', dataset: 'production' },
  // The Studio is hosted by Sanity at https://magnificenttravel.sanity.studio (`npm run deploy`).
  studioHost: 'magnificenttravel',
  // Id of the deployed Studio, so `npm run deploy` does not ask for it.
  deployment: { appId: 'bk0ghiswfjo9hglqeba6cyjb' },
});
