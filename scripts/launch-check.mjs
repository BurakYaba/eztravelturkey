// Launch-day check against a live address (docs/project-plan.md P10.1, P10.3, G8). Prints PASS / FAIL / WARN per line and
// exits 1 when anything failed.
//
//   node scripts/launch-check.mjs [base]                  default base: https://www.magnificenttravel.com
//   INDEXNOW_KEY=<key> node scripts/launch-check.mjs      also checks the IndexNow key file
//   node scripts/launch-check.mjs <base> --real           real domain: the settings the launch needs must all be on
//   node scripts/launch-check.mjs <base> --old            also checks the old domains redirect (torukoryoko.com, eztravelturkey.com)
//
// Without --real, missing settings are WARN (a preview or the vercel.app address does not need them yet).
const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith('http')) ?? 'https://www.magnificenttravel.com').replace(/\/$/, '');
const real = args.includes('--real');
const checkOld = args.includes('--old');
const host = new URL(base).host;
// The site writes its own public address (NEXT_PUBLIC_SITE_URL) into robots.txt and the sitemaps, whichever address it is
// reached on. On a preview the entries are therefore tested on the preview, but must name the public address.
const publicOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.magnificenttravel.com').replace(/\/$/, '');
const apex = host.replace(/^www\./, '');

let failed = 0;
const out = (level, label, note = '') => {
  if (level === 'FAIL') failed++;
  console.log(`${level.padEnd(5)} ${label}${note ? '  ' + note : ''}`);
};
const ok = (cond, label, note) => out(cond ? 'PASS' : 'FAIL', label, cond ? '' : note);
const setting = (cond, label) => out(cond ? 'PASS' : real ? 'FAIL' : 'WARN', label, cond ? '' : real ? 'turn it on before launch' : 'not on yet');

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
setting(c.mail && c.mail !== 'none', 'mail provider configured (Brevo or Resend)');
setting(c.mailRecipients, 'enquiry recipients and sender configured (INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL)');
setting(c.turnstile, 'bot check keys configured (Turnstile)');
setting(c.revalidateSecret, 'revalidate secret configured (Sanity webhook)');
setting(c.previewToken, 'preview token configured (Studio preview)');
setting(c.deployHook, 'deploy hook configured (editor redirects)');
setting(c.gtm, 'NEXT_PUBLIC_GTM_ID set (Tag Manager)');
setting(c.indexNow, 'INDEXNOW_KEY set');
if (real) ok(c.aliasRedirect === true, 'REDIRECT_VERCEL_ALIAS=1 (vercel.app address redirects to the real domain)', 'set it as the last launch step (P10.11-3)');

// 2. Security headers
const home = await get(`${base}/en/`);
ok(home.status === 200, `/en/ answers 200`, `answered ${home.status}`);
const h = home.headers;
const hsts = h.get('strict-transport-security') ?? '';
if (base.startsWith('https')) {
  ok(/max-age=\d{7,}/.test(hsts), 'HSTS header present', 'missing');
  if (real) ok(!/includeSubDomains|preload/i.test(hsts), 'HSTS without includeSubDomains/preload (the mail server lives on a subdomain)', `got "${hsts}"`);
}
ok(/frame-ancestors/.test(h.get('content-security-policy') ?? ''), 'Content-Security-Policy with frame-ancestors', 'missing');
ok(!h.get('x-powered-by'), 'no X-Powered-By header', `got ${h.get('x-powered-by')}`);
ok(h.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff');

// 3. Crawling files
const robots = await get(`${base}/robots.txt`);
const robotsText = await robots.text();
ok(robots.status === 200, 'robots.txt answers 200');
ok(robotsText.includes(`Sitemap: ${publicOrigin}/sitemap.xml`), `robots.txt lists ${publicOrigin}/sitemap.xml`, 'sitemap line missing or on another host');
ok(!/Disallow:\s*\/\s*$/m.test(robotsText), 'robots.txt does not block the whole site');
const index = await get(`${base}/sitemap.xml`);
const indexText = await index.text();
ok(index.status === 200, 'sitemap.xml answers 200');
for (const loc of [...indexText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) {
  const res = await get(loc.replace(publicOrigin, base));
  ok(res.status === 200, `sitemap ${loc.replace(publicOrigin, '')}`, `answered ${res.status}`);
}
ok((await get(`${base}/llms.txt`)).status === 200, 'llms.txt answers 200');
for (const lang of ['en', 'cn', 'jp']) {
  ok((await get(`${base}/${lang}/`)).status === 200, `/${lang}/ answers 200`);
}
if (process.env.INDEXNOW_KEY) {
  const key = process.env.INDEXNOW_KEY;
  const res = await get(`${base}/${key}.txt`);
  ok(res.status === 200 && (await res.text()).trim() === key, 'IndexNow key file answers with the key');
}

// 4. Host and protocol policy (only meaningful on the real domain)
if (real) {
  const wantLocation = (location, wanted) => (location ?? '').replace(/\/$/, '') === wanted.replace(/\/$/, '');
  const viaHttp = await get(`http://${host}/en/`);
  ok([301, 308].includes(viaHttp.status) && (viaHttp.headers.get('location') ?? '').startsWith(`https://${host}`), 'http redirects to https in one step', `got ${viaHttp.status} ${viaHttp.headers.get('location')}`);
  if (host !== apex) {
    const bare = await get(`https://${apex}/en/`);
    ok([301, 308].includes(bare.status) && (bare.headers.get('location') ?? '').startsWith(base), `https://${apex}/ redirects to ${base}`, `got ${bare.status} ${bare.headers.get('location')}`);
  }
  const alias = await get('https://magnificenttravel.vercel.app/en/');
  ok([301, 308].includes(alias.status) && (alias.headers.get('location') ?? '').startsWith(base), 'magnificenttravel.vercel.app redirects to the real domain', `got ${alias.status} ${alias.headers.get('location')}`);
  void wantLocation;
}

// 5. Old domains (G7)
if (checkOld) {
  const oldJp = await get('https://torukoryoko.com/');
  ok([301, 308].includes(oldJp.status) && (oldJp.headers.get('location') ?? '').includes(apex), 'torukoryoko.com redirects to the new site', `got ${oldJp.status} ${oldJp.headers.get('location')}`);
  const oldCn = await get('https://www.eztravelturkey.com/');
  ok(oldCn.status !== 0, 'eztravelturkey.com answers (its redirects belong to the eztravel project)', 'no answer');
}

console.log(failed ? `\n${failed} FAILED` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
