// Helpers for the Chinese and Japanese sites (same CMS theme, both written by hand in a word processor and pasted in).
// The text of these pages is kept as the old site wrote it (principle 2); the helpers only turn markup into plain blocks.

/** Collapses white space the way a reader sees it: no-break spaces, tabs and runs of blanks become one space. */
export const squash = (text) =>
  (text ?? '')
    .replace(/[ ​　]/g, ' ')
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .trim();

/** Text of an element with line breaks kept as new lines. */
export function textOf($, el) {
  const clone = $(el).clone();
  clone.find('br').replaceWith('\n');
  clone.find('script,style,noscript').remove();
  clone.find('p,div,li,tr,h1,h2,h3,h4,h5,h6').each((_, node) => {
    $(node).append('\n');
  });
  return squash(clone.text()).replace(/\n{2,}/g, '\n');
}

/** One line of text, for titles, labels and list items. */
export const lineOf = ($, el) => squash(textOf($, el).replace(/\n+/g, ' '));

const absolute = (src, base) => {
  try {
    return new URL(src, base).href;
  } catch {
    return '';
  }
};

/** Picture of an `<img>`, as an absolute address. Icons, logos and the theme's own pictures are not content. */
export function imageOf($, el, base, alt = '') {
  const src = absolute($(el).attr('src') ?? '', base);
  if (!src || /logo|icon|favicon|flaticon|tripadvisor|\/_assets\//i.test(src)) return null;
  return { src, width: null, height: null, alt: squash($(el).attr('alt') ?? alt) };
}

/**
 * Turns a block of rich text into ordered blocks: paragraphs, lists, tables, pictures and headings.
 * A heading is returned as `{ type: 'heading', level, text }` and is later folded into sections.
 */
export function blocksOf($, root, base) {
  const out = [];
  const push = (block) => {
    if (block) out.push(block);
  };
  const flushText = (text) => {
    for (const part of text.split(/\n+/)) {
      const t = squash(part);
      if (t) push({ type: 'p', text: t });
    }
  };
  const walkInline = (el) => {
    $(el)
      .contents()
      .each((_, node) => {
        if (node.type === 'text') {
          const t = squash(node.data);
          if (t) flushText(t);
        } else if (node.type === 'tag') {
          if (node.tagName.toLowerCase() === 'img') {
            const image = imageOf($, node, base);
            if (image) push({ type: 'image', src: image.src, alt: image.alt });
          } else if ($(node).find('img').length > 0) {
            walkInline(node);
          } else {
            flushText(textOf($, node));
          }
        }
      });
  };
  const walk = (el) => {
    $(el)
      .contents()
      .each((_, node) => {
        if (node.type === 'text') {
          const t = squash(node.data);
          if (t) flushText(t);
          return;
        }
        if (node.type !== 'tag') return;
        const tag = node.tagName.toLowerCase();
        const $n = $(node);
        if (['script', 'style', 'noscript', 'form', 'select', 'iframe'].includes(tag)) return;
        if (/^h[1-6]$/.test(tag)) {
          const text = lineOf($, node);
          if (text) push({ type: 'heading', level: Number(tag[1]), text });
        } else if (tag === 'ul' || tag === 'ol') {
          // Lists are sometimes nested inside each other with the items in the inner one: take the innermost items.
          const items = $n
            .find('li')
            .filter((__, li) => $(li).find('li').length === 0)
            .map((__, li) => lineOf($, li))
            .get()
            .filter(Boolean);
          if (items.length > 0) push({ type: 'list', ordered: tag === 'ol', items });
        } else if (tag === 'table') {
          const rows = $n
            .find('tr')
            .map((__, tr) => [
              $(tr)
                .children('td,th')
                .map((___, td) => textOf($, td))
                .get(),
            ])
            .get()
            .filter((row) => row.some((cell) => cell.trim() !== ''));
          if (rows.length > 0) push({ type: 'table', rows });
        } else if (tag === 'img') {
          const image = imageOf($, node, base);
          if (image) push({ type: 'image', src: image.src, alt: image.alt });
        } else if (tag === 'p' || tag === 'blockquote') {
          if ($n.find('img').length > 0) walkInline(node);
          else flushText(textOf($, node));
        } else if (tag === 'br') {
          // the text of the parent carries the line break
        } else if (['div', 'section', 'article', 'span', 'center', 'font', 'strong', 'b', 'em', 'i', 'u', 'a', 'main'].includes(tag)) {
          if ($n.find('p,ul,ol,table,h1,h2,h3,h4,h5,h6,img,div').length > 0) walk(node);
          else flushText(textOf($, node));
        } else {
          flushText(textOf($, node));
        }
      });
  };
  walk(root);
  return out;
}

/** Groups blocks into sections: a heading starts a section; the text before the first heading is level 0. */
export function sectionsOf(blocks) {
  const sections = [];
  let current = { level: 0, heading: '', blocks: [] };
  for (const block of blocks) {
    if (block.type === 'heading') {
      if (current.heading || current.blocks.length > 0) sections.push(current);
      current = { level: Math.min(4, Math.max(1, block.level)), heading: block.text, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  }
  if (current.heading || current.blocks.length > 0) sections.push(current);
  return sections;
}

/** Plain text of blocks, for looking in a section for words. */
export const flat = (blocks) =>
  blocks
    .map((b) => (b.type === 'p' ? b.text : b.type === 'list' ? b.items.join(' ') : b.type === 'table' ? b.rows.flat().join(' ') : ''))
    .join('\n');

/** Israel is not on the site (docs/project-plan.md D4): nothing that mentions it is carried over, in any language. */
// Only the country's name counts: a Jordan itinerary mentions the 6th-century Madaba mosaic map of Jerusalem, which is Jordan content.
export const mentionsIsrael = (text) => /israel|以色列|イスラエル/i.test(text ?? '');
