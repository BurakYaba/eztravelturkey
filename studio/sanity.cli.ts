import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: '91izz3mt', dataset: 'production' },
  // The Studio is hosted by Sanity at https://eztravelturkey.sanity.studio (`npm run deploy`; first deployed 2026-10-29).
  // NEVER copy the id of the main project's Studio here: a deploy would overwrite the Studio of magnificenttravel.com.
  studioHost: 'eztravelturkey',
  // Id of the deployed Studio, so `npm run deploy` does not ask for it.
  deployment: { appId: 'tah1hy5iu3ukprdrwqvhwbn2' },
});
