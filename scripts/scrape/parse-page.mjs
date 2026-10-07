// Generic parser for the old English content pages (country, category, combo, hubs, blog posts, static pages).
// It keeps the body as ordered sections (heading plus blocks) and pulls the tour cards and FAQ out separately.
import * as cheerio from 'cheerio';

const squash = (value) => value.replace(/\s+/g, ' ').trim();
const SKIP = '.package-card3, .faq-section, .faqWidget, .accordion, .breadcrumb-section, .banner3-section, .modal';

function parseDate(text) {
  const match = /Last Updated:\s*(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/i.exec(text);
  if (!match) {
    return null;
  }
  const date = new Date(`${match[1]} ${match[2]} ${match[3]} UTC`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function textWithBreaks($, el) {
  const clone = $(el).clone();
  clone.find('br').replaceWith('\n');
  return clone
    .text()
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

export function parsePage(html, sourceUrl, kind) {
  const $ = cheerio.load(html);
  const url = new URL(sourceUrl);
  const parts = url.pathname.split('/').filter(Boolean);
  const area = $('.page-content-area').first();
  const issues = [];
  if (area.length === 0) {
    issues.push('missing .page-content-area');
  }

  const sections = [{ level: 0, heading: '', blocks: [] }];
  const current = () => sections[sections.length - 1];
  area.find('h1,h2,h3,h4,p,ul,ol,table,img').each((_, node) => {
    const el = $(node);
    if (el.closest(SKIP).length > 0) {
      return;
    }
    const tag = node.tagName;
    if (/^h[1-4]$/.test(tag)) {
      const heading = squash(el.text());
      if (heading) {
        sections.push({ level: Number(tag[1]), heading, blocks: [] });
      }
      return;
    }
    // Nested content is part of its container: skip p/ul inside lists and tables, and anything inside a table.
    if (tag === 'p' && el.closest('li, table').length > 0) return;
    if ((tag === 'ul' || tag === 'ol') && el.parents('ul, ol, table').length > 0) return;
    if (tag === 'img' && el.closest('a.package-card-img, .gallery-img-wrap').length > 0) return;
    if (tag === 'p') {
      const text = textWithBreaks($, el);
      if (text) current().blocks.push({ type: 'p', text });
    } else if (tag === 'ul' || tag === 'ol') {
      const items = el
        .children('li')
        .map((_i, li) => squash($(li).text()))
        .get()
        .filter(Boolean);
      if (items.length) current().blocks.push({ type: 'list', ordered: tag === 'ol', items });
    } else if (tag === 'table') {
      const rows = el
        .find('tr')
        .map((_i, tr) =>
          [
            $(tr)
              .children('th,td')
              .map((_j, cell) => squash($(cell).text()))
              .get(),
          ],
        )
        .get();
      if (rows.length) current().blocks.push({ type: 'table', rows });
    } else if (tag === 'img') {
      const src = el.attr('src') ?? '';
      if (src && !/logo|icon/i.test(src)) current().blocks.push({ type: 'image', src, alt: squash(el.attr('alt') ?? '') });
    }
  });

  const cards = [];
  area.find('.package-card3').each((_, card) => {
    const link = $(card).find('a.package-card-img').first();
    const img = link.find('img').first();
    const number = (value) => (value && /^\d+$/.test(value) ? Number(value) : null);
    const text = squash($(card).text());
    const price = /([€$£]\s*[\d.,]+)/.exec(text)?.[1] ?? '';
    cards.push({
      title: squash(link.attr('title') ?? $(card).find('h3').first().text()),
      url: link.attr('href') ?? '',
      image: img.length
        ? { src: img.attr('src') ?? '', width: number(img.attr('width')), height: number(img.attr('height')), alt: squash(img.attr('alt') ?? '') }
        : null,
      meta: $(card)
        .find('.package-card-img-bottom li')
        .map((_i, li) => squash($(li).text()))
        .get()
        .filter(Boolean),
      price,
    });
  });

  const faqs = [];
  $('.faq-section .accordion-item, .faqWidget .accordion-item').each((_, item) => {
    const q = squash($(item).find('.accordion-button').first().text()).replace(/^Q\d+\.\s*/i, '');
    const body = $(item).find('.accordion-body').first();
    const answer = body
      .find('p')
      .map((_i, p) => textWithBreaks($, p))
      .get()
      .filter(Boolean)
      .join('\n\n');
    if (q) faqs.push({ q, a: answer || squash(body.text()) });
  });

  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      jsonLd.push(JSON.parse($(script).text()));
    } catch {
      issues.push('invalid JSON-LD block');
    }
  });

  const page = {
    locale: 'en',
    kind,
    sourceUrl,
    path: parts.slice(1).join('/'),
    metaTitle: squash($('title').first().text()),
    metaDescription: squash($('meta[name="description"]').attr('content') ?? ''),
    canonical: $('link[rel="canonical"]').attr('href') ?? '',
    robots: $('meta[name="robots"]').attr('content') ?? '',
    h1: squash($('h1').first().text()),
    lastUpdated: parseDate(squash($('.footer-meta').first().text())),
    breadcrumb: $('ul.breadcrumb-list li')
      .map((_, li) => squash($(li).text()))
      .get(),
    sections: sections.filter((s) => s.heading || s.blocks.length),
    cards,
    faqs,
    jsonLd,
  };
  if (!page.h1) issues.push('missing h1');
  if (page.sections.length === 0) issues.push('no sections');
  if (page.metaDescription.length < 70) issues.push('short meta description');
  return { page, issues };
}
