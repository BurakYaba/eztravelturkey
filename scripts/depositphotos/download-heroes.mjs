// Downloads the originals of the chosen hero pictures from the client's Depositphotos download list.
//
//   node scripts/depositphotos/download-heroes.mjs
//
// Needs the client's Chrome with remote debugging allowed (chrome://inspect/#remote-debugging) and the Depositphotos
// account signed in. It only presses the download icon of pictures that are already in the account's download list
// (a re-download: nothing is bought and no credit is spent) and works one picture at a time with a pause. Files go to
// data/depositphotos/originals/ (not in git). Pictures already there are skipped, so it can be run again.
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const require = createRequire('C:/Users/Burak/AppData/Roaming/npm/node_modules/@playwright/cli/');
const { chromium } = require('playwright-core');

const root = path.resolve(import.meta.dirname, '../..');
const dir = path.join(root, 'data/depositphotos');
const catalog = JSON.parse(readFileSync(path.join(dir, 'catalog.json'), 'utf8'));
const proposal = JSON.parse(readFileSync(path.join(dir, 'proposal.json'), 'utf8'));
const have = () => new Set(readdirSync(path.join(dir, 'originals')).map((f) => f.match(/Depositphotos_(\d+)_/)?.[1]));

const wanted = [...new Set(proposal.map((p) => p.pick?.id).filter(Boolean))];
const todo = wanted.filter((id) => !have().has(id));
console.log(`${wanted.length} pictures wanted, ${wanted.length - todo.length} already downloaded, ${todo.length} to go`);

const [port, wsPath] = readFileSync(process.env.LOCALAPPDATA + '/Google/Chrome/User Data/DevToolsActivePort', 'utf8').trim().split('\n');
const browser = await chromium.connectOverCDP(`ws://127.0.0.1:${port}${wsPath}`, { timeout: 240000 });
const page = await browser.contexts()[0].newPage();

// Group by list page (160 rows each) so every page is opened once.
const byOffset = new Map();
for (const id of todo) {
  const offset = Math.floor(catalog.findIndex((r) => r.id === id) / 160) * 160;
  byOffset.set(offset, [...(byOffset.get(offset) ?? []), id]);
}

let done = 0;
let failed = [];
for (const [offset, ids] of byOffset) {
  await page.goto(`https://depositphotos.com/tr/subaccounts/downloads.html?offset=${offset}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  for (const id of ids) {
    const button = page.locator(`tr[data-id="${id}"] a._download`).first();
    if ((await button.count()) === 0) {
      failed.push([id, 'no download button on its page']);
      continue;
    }
    try {
      const [download] = await Promise.all([page.waitForEvent('download', { timeout: 45000 }), button.click()]);
      await download.saveAs(path.join(dir, 'originals', download.suggestedFilename()));
      done++;
      console.log(`${done}/${todo.length} ${download.suggestedFilename()}`);
    } catch (error) {
      failed.push([id, String(error).slice(0, 120)]);
      console.log('FAILED', id, String(error).slice(0, 100));
    }
    await page.waitForTimeout(2500);
  }
}
await page.close();
await browser.close();
console.log(`done: ${done} downloaded, ${failed.length} failed`);
for (const [id, why] of failed) console.log(' ', id, why);
