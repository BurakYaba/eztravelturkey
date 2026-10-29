// Walks every document of a dataset against the Studio's schema and lists what the Studio would complain about or hide:
// fields the schema does not know ("unknown field" warnings), wrong value types, values outside a list of allowed values,
// array items without `_key` (the Studio cannot edit them), references to documents or pictures that do not exist, and
// two pages with the same address in one language. It does not replace `sanity documents validate` (the required fields and
// custom rules); run both before a launch.
//
//   npm run check:sanity            (extracts the schema, then checks)
//   node --env-file-if-exists=.env.local scripts/sanity/check-data.mjs [studio/schema-extract.json]
//
// SANITY_DATASET picks the dataset (default production). Reads only; SANITY_WRITE_TOKEN (or a read token) is needed to see drafts.
import { createClient } from '@sanity/client';
import fs from 'node:fs';

const schemaPath = process.argv[2] ?? 'studio/schema-extract.json';
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const named = new Map(schema.map((entry) => [entry.name, entry]));

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID ?? '91izz3mt',
  dataset: process.env.SANITY_DATASET ?? 'production',
  token: process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_API_KEY,
  apiVersion: '2025-01-01',
  useCdn: false,
  perspective: 'raw',
});

const docs = await client.fetch('*[!(_type match "system.*")]');
// CHECK_SELFTEST=1 adds deliberately broken documents, to prove the checks catch what they claim to.
if (process.env.CHECK_SELFTEST) {
  docs.push({
    _id: 'selftest-1', _type: 'destinationPage', language: 'xx', title: 5, surprise: 'x', noindex: 'yes',
    sections: [{ _type: 'section', _key: 'a', level: 1, blocks: [{ _type: 'paragraph', text: 'x' }, { _type: 'video', _key: 'b' }] }, { _type: 'section', level: 2 }],
    faqs: [{ _type: 'faq', _key: 'c', q: 'q', extra: 1 }],
    mainImage: { _type: 'picture', asset: { _type: 'reference', _ref: 'image-doesnotexist-1x1-png' }, alt: 'x' },
  }, { _id: 'selftest-2', _type: 'blogPost', language: 'en', author: { _type: 'reference', _ref: 'nobody' } }, { _id: 'selftest-3', _type: 'mystery' });
}
const ids = new Set(docs.map((doc) => doc._id));
const assetIds = new Set(docs.filter((doc) => doc._type.startsWith('sanity.')).map((doc) => doc._id));

const problems = new Map(); // message -> [document ids]
const report = (doc, path, message) => {
  const key = `${doc._type}: ${message}`;
  const list = problems.get(key) ?? [];
  list.push(`${doc._id} @ ${path}`);
  problems.set(key, list);
};

const typeOf = (value) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

/** Checks `value` against one node of the extracted schema. `path` is for the report only. */
function check(doc, node, value, path) {
  if (value === undefined || value === null) {return;}
  switch (node.type) {
    case 'string':
      if (typeof value !== 'string') {report(doc, path, `expected text, found ${typeOf(value)}`);}
      else if (node.value !== undefined && value !== node.value) {report(doc, path, `value "${value}" is not "${node.value}"`);}
      return;
    case 'number':
      if (typeof value !== 'number') {report(doc, path, `expected number, found ${typeOf(value)}`);}
      return;
    case 'boolean':
      if (typeof value !== 'boolean') {report(doc, path, `expected true/false, found ${typeOf(value)}`);}
      return;
    case 'union': {
      const literals = node.of.filter((option) => option.value !== undefined && (option.type === 'string' || option.type === 'number'));
      if (literals.length === node.of.length) {
        if (!literals.some((option) => option.value === value)) {report(doc, path, `value ${JSON.stringify(value)} is not one of the allowed values`);}
        return;
      }
      // A union of object types: pick the member by `_type`.
      const member = node.of.find((option) => option.type === 'object' && memberType(option) === value?._type);
      if (member) {check(doc, member, value, path);}
      else if (typeof value === 'object') {report(doc, path, `block of type "${value?._type}" is not allowed here`);}
      return;
    }
    case 'array': {
      if (!Array.isArray(value)) {report(doc, path, `expected a list, found ${typeOf(value)}`); return;}
      value.forEach((item, index) => {
        if (item && typeof item === 'object' && !item._key) {report(doc, `${path}[${index}]`, 'list item without _key');}
        check(doc, node.of, item, `${path}[${index}]`);
      });
      return;
    }
    case 'inline': {
      const target = named.get(node.name);
      if (!target) {return;}
      // The Studio's own reference types: {_type:'reference', _ref}
      if (node.name.endsWith('.reference')) {return checkReference(doc, value, path);}
      check(doc, target.type === 'type' ? target.value : target, value, path);
      return;
    }
    case 'document':
    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) {report(doc, path, `expected an object, found ${typeOf(value)}`); return;}
      const attributes = { ...(node.attributes ?? {}) };
      if (node.rest) {
        const rest = node.rest.type === 'inline' ? named.get(node.rest.name) : node.rest;
        const restNode = rest?.type === 'type' ? rest.value : rest;
        Object.assign(attributes, restNode?.attributes ?? {});
        if (restNode?.type === 'object' || restNode?.attributes) {node.__rest = restNode;}
      }
      for (const key of Object.keys(value)) {
        if (key.startsWith('_')) {continue;}
        if (!(key in attributes)) {report(doc, `${path}.${key}`, `unknown field "${key}"`);}
      }
      for (const [key, attribute] of Object.entries(attributes)) {
        if (key.startsWith('_')) {continue;}
        check(doc, attribute.value, value[key], `${path}.${key}`);
      }
      return;
    }
    default:
  }
}

const memberType = (option) => {
  const rest = option.rest?.type === 'inline' ? named.get(option.rest.name) : null;
  return rest?.value?.attributes?._type?.value?.value ?? rest?.name;
};

function checkReference(doc, value, path) {
  if (typeof value !== 'object') {return;}
  if (value._type === 'reference') {
    if (!value._ref) {report(doc, path, 'reference without _ref');}
    else if (!value._weak && !ids.has(value._ref) && !ids.has(`drafts.${value._ref}`)) {report(doc, path, `reference to a missing document ${value._ref}`);}
  } else if (value._type !== undefined && value._type !== 'sanity.imageAsset') {
    report(doc, path, `unexpected reference type ${value._type}`);
  }
  if (value._ref?.startsWith('image-') && !assetIds.has(value._ref)) {report(doc, path, `picture file ${value._ref} does not exist`);}
}

let checked = 0;
for (const doc of docs) {
  const definition = named.get(doc._type);
  if (!definition) {
    if (!doc._type.startsWith('sanity.')) {report(doc, '', `document type "${doc._type}" is not in the schema (the Studio shows it as unknown)`);}
    continue;
  }
  checked++;
  check(doc, definition, doc, '');
}

// two pages, one address, one language (drafts of the same page do not count twice)
const seen = new Map();
for (const doc of docs) {
  if (!doc.path || !doc.language || !doc._type || ['tourTexts', 'siteSettings', 'teamMember'].includes(doc._type)) {continue;}
  const key = `${doc.language} ${doc.path.toLowerCase()}`;
  const base = doc._id.replace(/^drafts\./, '');
  const list = seen.get(key) ?? new Set();
  list.add(base);
  seen.set(key, list);
}
for (const [key, list] of seen) {
  if (list.size > 1) {
    const list2 = [...list];
    problems.set(`address used by ${list.size} documents: ${key}`, list2);
  }
}

console.log(`${checked} documents checked in ${process.env.SANITY_DATASET ?? 'production'}`);
if (problems.size === 0) {
  console.log('Nothing found.');
} else {
  for (const [message, list] of [...problems].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${list.length} x ${message}`);
    for (const item of list.slice(0, 3)) {console.log(`    ${item}`);}
  }
  process.exitCode = 1;
}
