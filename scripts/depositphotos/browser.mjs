// Opens a browser that is signed in to Depositphotos, for the scripts in this folder.
//
// Default: a Chrome window of its own, with its own saved profile (data/depositphotos/browser-profile, not in git). The
// first time, run `node scripts/depositphotos/browser.mjs login`, sign in to the client's Depositphotos account in the
// window that opens, and the session is kept for the next runs. Nothing about the account is written anywhere else.
//
// Alternative: pass --cdp to use the client's own running Chrome (remote debugging allowed in chrome://inspect). Chrome
// asks for permission at every connection, which was slow to get working, so the own window is the normal way.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire('C:/Users/Burak/AppData/Roaming/npm/node_modules/@playwright/cli/');
const { chromium } = require('playwright-core');

const root = path.resolve(import.meta.dirname, '../..');
export const profileDir = path.join(root, 'data/depositphotos/browser-profile');

export async function openBrowser({ cdp = false } = {}) {
  if (cdp) {
    const [port, wsPath] = readFileSync(process.env.LOCALAPPDATA + '/Google/Chrome/User Data/DevToolsActivePort', 'utf8').trim().split('\n');
    const browser = await chromium.connectOverCDP(`ws://127.0.0.1:${port}${wsPath}`, { timeout: 240000 });
    return { context: browser.contexts()[0], close: () => browser.close() };
  }
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  });
  return { context, close: () => context.close() };
}

// `node scripts/depositphotos/browser.mjs login`: opens the downloads page and waits until the account is signed in.
if (process.argv[2] === 'login') {
  const { context, close } = await openBrowser();
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto('https://depositphotos.com/tr/subaccounts/downloads.html', { waitUntil: 'domcontentloaded' });
  console.log('Sign in to Depositphotos in the window that opened. Waiting for the download list...');
  for (let i = 0; i < 180; i++) {
    if ((await page.locator('tr[data-id]').count()) > 0) {
      console.log('Signed in: the download list is visible. The session is saved.');
      break;
    }
    await page.waitForTimeout(5000);
  }
  await close();
}
