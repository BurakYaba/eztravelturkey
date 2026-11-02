// Tells Bing, Yandex and the other IndexNow search engines about every address in the sitemaps (docs/project-plan.md P8.6).
// Google does not use IndexNow. Run once on launch day, and again after a big change.
// Usage: node --env-file=.env.local scripts/indexnow-submit.mjs [base]     (default base: https://www.eztravelturkey.com)
//        or INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs [base]
// The same key must be set as INDEXNOW_KEY on Vercel, so that <base>/<key>.txt answers with the key (src/app/api/indexnow-key).
const base = (process.argv[2] ?? 'https://www.eztravelturkey.com').replace(/\/$/, '');
const key = process.env.INDEXNOW_KEY;
if (!key) {
  console.error('Set INDEXNOW_KEY first (8 to 128 letters, digits or dashes; for example 32 random hex characters).');
  process.exit(1);
}

const text = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} answered ${res.status}`);
  }
  return res.text();
};

const keyFile = await fetch(`${base}/${key}.txt`);
if (!keyFile.ok || (await keyFile.text()).trim() !== key) {
  console.error(`${base}/${key}.txt does not answer with the key. Set INDEXNOW_KEY on Vercel and deploy first.`);
  process.exit(1);
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replaceAll('&amp;', '&'));
const sitemaps = locs(await text(`${base}/sitemap.xml`));
const urls = [];
for (const sitemap of sitemaps) {
  urls.push(...locs(await text(sitemap)));
}
console.log(`${urls.length} addresses in ${sitemaps.length} sitemaps`);

const host = new URL(base).host;
for (let i = 0; i < urls.length; i += 5000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${base}/${key}.txt`, urlList: urls.slice(i, i + 5000) }),
  });
  // 200 and 202 both mean the list was received; 422 means the addresses do not belong to the host, 403 that the key was not found.
  console.log(`batch ${i / 5000 + 1}: ${res.status} ${res.statusText}`);
  if (!res.ok && res.status !== 202) {
    process.exit(1);
  }
}
