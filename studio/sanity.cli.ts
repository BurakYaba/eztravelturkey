import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: '91izz3mt', dataset: 'production' },
  // The Studio is hosted by Sanity at https://eztravelturkey.sanity.studio (`npm run deploy`). It has no `deployment.appId` until
  // the first deploy has created it; add the id that deploy prints. NEVER copy the id of the main project's Studio here: a deploy
  // would overwrite the Studio of magnificenttravel.com.
  studioHost: 'eztravelturkey',
});
