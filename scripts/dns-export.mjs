// Exports the DNS records of a Cloudflare zone to data/backups (docs/project-plan.md P9.5, launch step G1). A copy of the
// records is what makes the DNS move reversible: the old values can be typed back if something goes wrong (P10.7).
//
//   CLOUDFLARE_API_TOKEN=<token> node scripts/dns-export.mjs [zone-name ...]     default: magnificenttravel.com
//
// The token needs one permission only: Zone > DNS > Read (create it at dash.cloudflare.com > My Profile > API Tokens, limited
// to the zones). Nothing is changed in Cloudflare; the script only reads.
import { mkdirSync, writeFileSync } from 'node:fs';

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error('Set CLOUDFLARE_API_TOKEN (permission: Zone > DNS > Read) first.');
  process.exit(1);
}
const zones = process.argv.slice(2).length ? process.argv.slice(2) : ['magnificenttravel.com'];
const api = 'https://api.cloudflare.com/client/v4';

async function cf(path) {
  const res = await fetch(`${api}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  if (!body.success) {
    throw new Error(`${path}: ${JSON.stringify(body.errors)}`);
  }
  return body;
}

mkdirSync('data/backups', { recursive: true });
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
for (const name of zones) {
  const zone = (await cf(`/zones?name=${encodeURIComponent(name)}`)).result[0];
  if (!zone) {
    console.error(`${name}: no zone with this name is visible to the token`);
    continue;
  }
  const records = [];
  for (let page = 1; ; page++) {
    const body = await cf(`/zones/${zone.id}/dns_records?per_page=100&page=${page}`);
    records.push(...body.result);
    if (page >= body.result_info.total_pages) break;
  }
  const file = `data/backups/dns-${name}-${stamp}`;
  writeFileSync(`${file}.json`, JSON.stringify(records, null, 1));
  // A readable list: type, name, content, TTL, whether Cloudflare proxies it.
  const lines = records
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
    .map((r) => `${r.type.padEnd(6)} ${r.name.padEnd(42)} ${String(r.content).slice(0, 70).padEnd(72)} ttl=${r.ttl === 1 ? 'auto' : r.ttl} ${r.proxied ? 'PROXIED' : 'dns-only'}${r.priority != null ? ` prio=${r.priority}` : ''}`);
  writeFileSync(`${file}.txt`, lines.join('\n') + '\n');
  console.log(`${name}: ${records.length} records -> ${file}.json and ${file}.txt`);
}
