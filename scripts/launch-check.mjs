// Launch-day check of eztravelturkey.com against a live address. Prints PASS / FAIL / WARN per line and exits 1 when anything failed.
//
//   node scripts/launch-check.mjs [base]                  default base: https://www.eztravelturkey.com
//   INDEXNOW_KEY=<key> node scripts/launch-check.mjs      also checks the IndexNow key file
//   node scripts/launch-check.mjs <base> --real           real domain: the settings the launch needs must all be on
//   node scripts/launch-check.mjs <base> --old            also checks the old addresses (the bare domain, the WordPress blog, /cn/, old /zh/ tabs)
//   node scripts/launch-check.mjs <base> --full           also opens every address of the sitemap
//
// Without --real, missing settings are WARN (a preview or the vercel.app address does not need them yet). The full checks of the old
// addresses are `npm run check:redirects -- <base>` (every address of the three old maps).
import { readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith('http')) ?? 'https://www.eztravelturkey.com').replace(/\/$/, '');
const real = args.includes('--real');
const checkOld = args.includes('--old');
const full = args.includes('--full');
const host = new URL(base).host;
// The site writes its own public address (NEXT_PUBLIC_SITE_URL) into robots.txt, the sitemaps and the canonical links, whichever
// address it is reached on. On a preview the entries are therefore tested on the preview, but must name the public address.
const publicOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.eztravelturkey.com').replace(/\/$/, '');
const apex = host.replace(/^www\./, '');
const root = path.resolve(import.meta.dirname, '..');
const json = (file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));

let failed = 0;
const out = (level, label, note = '') => {
  if (level === 'FAIL') failed++;
  console.log(`${level.padEnd(5)} ${label}${note ? '  ' + note : ''}`);
};
const ok = (cond, label, note) => out(cond ? 'PASS' : 'FAIL', label, cond ? '' : note);
const setting = (cond, label) => out(cond ? 'PASS' : real ? 'FAIL' : 'WARN', label, cond ? '' : real ? 'turn it on before launch' : 'not on yet');
const moved = (res) => [301, 308].includes(res.status);
const where = (res) => decodeURIComponent(res.headers.get('location') ?? '');

async function get(url, init = {}) {
  try {
    return await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), ...init });
  } catch (error) {
    return { status: 0, headers: new Headers(), text: async () => '', error: error.message };
  }
}

// 1. Health and settings
const healthRes = await get(`${base}/api/health/`);
ok(healthRes.status === 200, 'health: the site can read its content (/api/health/)', `answered ${healthRes.status}`);
const health = healthRes.status === 200 ? JSON.parse(await healthRes.text()) : { config: {} };
const c = health.config ?? {};
setting(c.mail && c.mail !== 'none', 'mail provider configured (SMTP, Brevo or Resend)');
setting(c.mailRecipients, 'enquiry recipients and sender configured (INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL)');
setting(c.turnstile, 'bot check keys configured (Turnstile)');
setting(c.revalidateSecret, 'revalidate secret configured (Sanity webhook)');
setting(c.previewToken, 'preview token configured (Studio preview)');
setting(c.deployHook, 'deploy hook configured (editor redirects)');
setting(c.gtm, 'NEXT_PUBLIC_GTM_ID set (Tag Manager)');
setting(c.indexNow, 'INDEXNOW_KEY set');
if (real) ok(c.aliasRedirect === true, 'REDIRECT_VERCEL_ALIAS=1 (the vercel.app address redirects to the real domain)', 'set it as the last launch step');

// 2. The language policy: one language, `/zh/`
const rootRes = await get(`${base}/`);
ok(moved(rootRes) && where(rootRes).endsWith('/zh/'), '/ redirects to /zh/', `got ${rootRes.status} ${where(rootRes)}`);
ok((await get(`${base}/en/`)).status === 404, '/en/ answers 404 (the site has one language)');
ok((await get(`${base}/jp/`)).status === 404, '/jp/ answers 404');

// 3. The home page: language, tags, security headers
const home = await get(`${base}/zh/`);
ok(home.status === 200, '/zh/ answers 200', `answered ${home.status}`);
const html = home.status === 200 ? await home.text() : '';
ok(/<html[^>]*lang="zh-Hant"/.test(html), 'html lang is zh-Hant');
ok(/<title>[^<]*Eztravel Turkey/.test(html), 'the title names Eztravel Turkey');
ok(html.includes(`<link rel="canonical" href="${publicOrigin}/zh/"`), `canonical is ${publicOrigin}/zh/`, 'canonical missing or on another address');
ok(/hrefLang="zh-Hant"/i.test(html) && /hrefLang="x-default"/i.test(html), 'hreflang zh-Hant and x-default present');
ok(/og:locale" content="zh_TW"/.test(html), 'Open Graph locale zh_TW');
ok(!/name="robots"[^>]*noindex/i.test(html), 'the home page is not noindex');
ok(!/GTM-55HWFMHR/.test(html), 'no Tag Manager id of magnificenttravel.com in the page');
if (c.gtm) ok(/GTM-[A-Z0-9]{6,}/.test(html), 'the Tag Manager container loads on the page');
const h = home.headers;
const hsts = h.get('strict-transport-security') ?? '';
if (base.startsWith('https')) {
  ok(/max-age=\d{7,}/.test(hsts), 'HSTS header present', 'missing');
  if (real) ok(!/includeSubDomains|preload/i.test(hsts), 'HSTS without includeSubDomains/preload (the mail server lives on a subdomain)', `got "${hsts}"`);
}
ok(/frame-ancestors/.test(h.get('content-security-policy') ?? ''), 'Content-Security-Policy with frame-ancestors', 'missing');
ok(!h.get('x-powered-by'), 'no X-Powered-By header', `got ${h.get('x-powered-by')}`);
ok(h.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff');

// 4. Crawling files
const robots = await get(`${base}/robots.txt`);
const robotsText = await robots.text();
ok(robots.status === 200, 'robots.txt answers 200');
ok(robotsText.includes(`Sitemap: ${publicOrigin}/sitemap.xml`), `robots.txt lists ${publicOrigin}/sitemap.xml`, 'sitemap line missing or on another host');
ok(!/Disallow:\s*\/\s*$/m.test(robotsText), 'robots.txt does not block the whole site');
const index = await get(`${base}/sitemap.xml`);
const indexText = await index.text();
ok(index.status === 200, 'sitemap.xml answers 200');
ok((await get(`${base}/sitemap.xml/`)).status !== 404, 'the old sitemap address /sitemap.xml/ does not answer 404');
const sitemapUrls = [];
for (const loc of [...indexText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) {
  const res = await get(loc.replace(publicOrigin, base));
  ok(res.status === 200, `sitemap ${loc.replace(publicOrigin, '')}`, `answered ${res.status}`);
  if (res.status === 200) {
    sitemapUrls.push(...[...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
}
ok(sitemapUrls.length > 120, `the sitemap lists ${sitemapUrls.length} addresses (about 170 expected after the blog was reduced on 2026-11-04)`, 'far fewer than expected');
ok(sitemapUrls.every((u) => u.startsWith(publicOrigin)), `every sitemap address is on ${publicOrigin}`, 'an address is on another host');
ok((await get(`${base}/llms.txt`)).status === 200, 'llms.txt answers 200');
if (process.env.INDEXNOW_KEY) {
  const key = process.env.INDEXNOW_KEY;
  const res = await get(`${base}/${key}.txt`);
  ok(res.status === 200 && (await res.text()).trim() === key, 'IndexNow key file answers with the key');
}
if (full) {
  const bad = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (next < sitemapUrls.length) {
        const u = sitemapUrls[next++];
        const res = await get(u.replace(publicOrigin, base));
        if (res.status !== 200) bad.push(`${u} ${res.status}`);
      }
    }),
  );
  ok(bad.length === 0, `all ${sitemapUrls.length} sitemap addresses answer 200`, `${bad.length} do not, for example ${bad.slice(0, 3).join(', ')}`);
}

// 5. Host and protocol policy (only meaningful on the real domain)
if (real) {
  const viaHttp = await get(`http://${host}/zh/`);
  ok(moved(viaHttp) && (viaHttp.headers.get('location') ?? '').startsWith(`https://${host}`), 'http redirects to https in one step', `got ${viaHttp.status} ${viaHttp.headers.get('location')}`);
  if (host !== apex) {
    const bare = await get(`https://${apex}/zh/`);
    ok(moved(bare) && (bare.headers.get('location') ?? '').startsWith(base), `https://${apex}/ redirects to ${base}`, `got ${bare.status} ${bare.headers.get('location')}`);
  }
  const alias = await get('https://eztravelturkey.vercel.app/zh/');
  ok(moved(alias) && (alias.headers.get('location') ?? '').startsWith(base), 'eztravelturkey.vercel.app redirects to the real domain', `got ${alias.status} ${alias.headers.get('location')}`);
}

// 6. The old addresses: one of each kind (the whole maps are in `npm run check:redirects`)
if (checkOld) {
  const zhMap = json('src/data/redirects-zh.json');
  const [zhOld, zhNew] = Object.entries(zhMap).find(([k]) => k.endsWith('/itinerary')) ?? Object.entries(zhMap)[0];
  const tab = await get(`${base}/zh/${zhOld.split('/').map(encodeURIComponent).join('/')}/`);
  ok(moved(tab) && where(tab).endsWith(decodeURIComponent(zhNew)), `old tour tab /zh/${zhOld.slice(0, 40)}... goes to its tour page`, `got ${tab.status} ${where(tab)}`);
  const cnMap = json('src/data/redirects-cn.json');
  const [cnOld, cnNew] = Object.entries(cnMap).find(([k]) => k.startsWith('destinations/turkey-tours/')) ?? Object.entries(cnMap)[0];
  const cn = await get(`${base}/cn/${cnOld}/`);
  ok(moved(cn) && where(cn) === `https://www.magnificenttravel.com${cnNew}`, `old /cn/${cnOld.slice(0, 40)}... goes to magnificenttravel.com`, `got ${cn.status} ${where(cn)}`);
  const blogMap = json('src/data/redirects-blog.json').posts;
  const [blogOld, blogNew] = Object.entries(blogMap)[0];
  const blog = await get(`https://${apex}/blog/${encodeURIComponent(blogOld)}/`);
  ok(moved(blog) && where(blog).endsWith(decodeURIComponent(blogNew)), `old blog post on the bare domain (/blog/${blogOld.slice(0, 20)}...) goes to its new page in one step`, `got ${blog.status} ${where(blog)}`);
  const hub = await get(`https://${apex}/blog/`);
  ok(moved(hub) && where(hub).endsWith('/zh/blog/'), 'the old blog home goes to /zh/blog/', `got ${hub.status} ${where(hub)}`);
  const bareHome = await get(`https://${apex}/`);
  ok(moved(bareHome), 'the bare domain redirects (to www and /zh/)', `got ${bareHome.status}`);
}

console.log(failed ? `\n${failed} FAILED` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
