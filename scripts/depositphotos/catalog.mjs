// Saves the client's Depositphotos download list (id, title, artist, size, license page, thumbnail) to
// data/depositphotos/catalog.json. Needs Chrome with remote debugging allowed (chrome://inspect/#remote-debugging) and the
// Depositphotos team account signed in; it only reads the list pages (160 rows each), nothing is bought or downloaded.
//
//   node scripts/depositphotos/catalog.mjs
//
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const require = createRequire('C:/Users/Burak/AppData/Roaming/npm/node_modules/@playwright/cli/');
const { chromium } = require('playwright-core');
const [port, wsPath] = readFileSync(process.env.LOCALAPPDATA + '/Google/Chrome/User Data/DevToolsActivePort', 'utf8').trim().split('\n');
const browser = await chromium.connectOverCDP(`ws://127.0.0.1:${port}${wsPath}`, { timeout: 240000 });
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
const all = [];
for (let offset = 0; offset < 3000; offset += 160) {
  await page.goto(`https://depositphotos.com/tr/subaccounts/downloads.html?offset=${offset}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const rows = await page.evaluate(() =>
    [...document.querySelectorAll('tr.table-default__row')].map((tr) => {
      const cells = [...tr.querySelectorAll('td')].map((td) => td.innerText.replace(/\s+/g, ' ').trim());
      const desc = tr.querySelector('.table-default__cell_desc')?.innerText.split('\n') ?? [];
      return {
        id: tr.dataset.id,
        title: (desc[0] ?? '').trim(),
        artist: (desc[1] ?? '').replace(/^@\s*/, '').trim(),
        date: tr.querySelector('.table-default__cell_date')?.innerText.trim(),
        kind: tr.querySelector('[class*="icon-size-video"]') ? 'video' : tr.querySelector('[class*="icon-size-"]')?.className.match(/icon-size-(\w+)/g)?.slice(-1)[0] ?? 'image',
        method: tr.querySelector('.table-default__cell_method')?.innerText.trim(),
        thumb: tr.querySelector('img')?.src,
        license: tr.querySelector('a._license')?.getAttribute('href'),
      };
    }),
  );
  console.log('offset', offset, 'rows', rows.length);
  if (rows.length === 0) break;
  all.push(...rows);
  if (rows.length < 160) break;
}
await page.close();
writeFileSync(`${root}/data/depositphotos/catalog.json`, JSON.stringify(all, null, 1));
const kinds = {};
for (const r of all) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
console.log('total', all.length, 'unique ids', new Set(all.map((r) => r.id)).size, kinds);
await browser.close();
