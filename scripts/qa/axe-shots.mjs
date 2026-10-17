// Accessibility (axe-core) and screenshots of a sample of pages in every language at phone and desktop width
// (docs/project-plan.md P4.2).
//
//   node scripts/qa/axe-shots.mjs [address]        default http://localhost:3100
//
// Writes data/qa/axe.json and data/qa/shots/<lang>-<page>-<width>.png (not in git). Only reads; needs no login.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire('C:/Users/Burak/AppData/Roaming/npm/node_modules/@playwright/cli/');
const { chromium } = require('playwright-core');

const root = path.resolve(import.meta.dirname, '../..');
const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '');
const shots = path.join(root, 'data/qa/shots');
mkdirSync(shots, { recursive: true });
const axeSource = readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');

const pages = {
  home: '/',
  tours: '/tours/',
  tour: '/destinations/egypt-tours/8-day-best-of-egypt-tour/',
  country: '/destinations/turkey-tours/',
  category: '/destinations/egypt-tours/06-to-09-days-tours/',
  combo: '/destinations/turkey-greece-tours/',
  blog: '/blog/',
  about: '/about/',
  faq: '/faq/',
  contact: '/contact/',
  destinations: '/destinations/',
};
const sizes = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };

const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
for (const lang of ['en', 'zh', 'jp']) {
  for (const [size, viewport] of Object.entries(sizes)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    for (const [name, p] of Object.entries(pages)) {
      const page = await context.newPage();
      const messages = [];
      page.on('pageerror', (e) => messages.push(String(e).slice(0, 120)));
      page.on('console', (m) => m.type() === 'error' && messages.push(m.text().slice(0, 120)));
      const res = await page.goto(`${base}/${lang}${p}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);
      const status = res?.status() ?? 0;
      // lazy pictures and reveal animations
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      await page.addScriptTag({ content: axeSource });
      const axe = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (lang === 'en' || name === 'home' || name === 'tour') await page.screenshot({ path: path.join(shots, `${lang}-${name}-${size}.png`), fullPage: size === 'phone' && name !== 'blog' });
      results.push({
        lang, size, name, status, overflow, errors: messages.slice(0, 3),
        violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(' ').slice(0, 100) })),
      });
      await page.close();
    }
    await context.close();
  }
}
await browser.close();
writeFileSync(path.join(root, 'data/qa/axe.json'), JSON.stringify(results, null, 1));

const bad = results.filter((r) => r.status !== 200 || r.overflow || r.violations.length || r.errors.length);
console.log(`${results.length} page views, ${bad.length} with a problem`);
for (const r of bad) console.log(`${r.lang} ${r.size} ${r.name}: status ${r.status}${r.overflow ? ' HORIZONTAL SCROLL' : ''} ${r.errors.join(' | ')} ${r.violations.map((v) => `${v.id}(${v.impact},${v.nodes}) ${v.sample}`).join('; ')}`);
