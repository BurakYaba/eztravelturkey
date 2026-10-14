// Parses an archived English tour page into the normalized shape of src/lib/schema/tour.ts (docs/project-plan.md P1.5).
// The old tour template is regular, so selectors are explicit and every miss is reported instead of guessed.
import * as cheerio from 'cheerio';
import { stripRollingDates } from './lib/jsonld.mjs';
import { EN_CATEGORIES } from './lib/classify.mjs';

const squash = (value) => value.replace(/\s+/g, ' ').trim();
const CURRENCIES = { '€': 'EUR', $: 'USD', '£': 'GBP' };

/** Text of the <p> blocks (or the whole element when there are none): blocks split by a blank line, <br> as newline. */
function paragraphs($, root) {
  const blocks = $(root).is('p') ? $(root) : $(root).find('p');
  const parts = blocks.length
    ? blocks
        .map((_, p) => {
          const clone = $(p).clone();
          clone.find('br').replaceWith('\n');
          return clone
            .text()
            .split('\n')
            .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
            .filter(Boolean)
            .join('\n');
        })
        .get()
    : [squash($(root).text())];
  return parts.filter(Boolean).join('\n\n');
}

const listItems = ($, root) =>
  $(root)
    .find('li')
    .map((_, li) => squash($(li).text()))
    .get()
    .filter(Boolean);

function imageOf($, img) {
  if (!img || img.length === 0) {
    return null;
  }
  const number = (value) => (value && /^\d+$/.test(value) ? Number(value) : null);
  return {
    src: img.attr('src') ?? '',
    width: number(img.attr('width')),
    height: number(img.attr('height')),
    alt: squash(img.attr('alt') ?? ''),
  };
}

function parseDate(text) {
  const match = /Last Updated:\s*(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/i.exec(text);
  if (!match) {
    return null;
  }
  const date = new Date(`${match[1]} ${match[2]} ${match[3]} UTC`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

const FACT_KEYS = {
  'tour duration': 'duration',
  'guide languages': 'guideLanguages',
  'group type': 'groupType',
  'flights included?': 'flights',
  'starting price': 'startingPrice',
  'cancellation policy': 'cancellation',
  'physical difficulty': 'difficulty',
  season: 'season',
};

export function parseTour(html, sourceUrl) {
  const $ = cheerio.load(html);
  const issues = [];
  const col = $('.col-xl-8').first();
  const url = new URL(sourceUrl);
  const parts = url.pathname.split('/').filter(Boolean); // en, destinations, parent, [category], slug
  const [, , parent, ...rest] = parts;
  const slug = rest[rest.length - 1];
  const category = rest.length > 1 && EN_CATEGORIES.has(rest[0]) ? rest[0] : null;

  const facts = Object.fromEntries(Object.values(FACT_KEYS).map((key) => [key, '']));
  const extraFacts = {};
  col.find('table.table-sm tr').each((_, tr) => {
    const label = squash($(tr).find('th,td').first().text());
    const value = squash($(tr).find('td').last().text());
    const key = FACT_KEYS[label.toLowerCase()];
    if (key) {
      facts[key] = value;
    } else if (label) {
      extraFacts[label] = value;
    }
  });

  const durationMatch = /(\d+)\s*Nights?\s*\/\s*(\d+)\s*Days?/i.exec(facts.duration);
  const priceRaw = squash(col.find('.tour-price').first().text());
  const priceMatch = /([€$£])\s*([\d.,]+)\s*(?:\/\s*([^.]*?))?(?:\s{2,}|$|Prices)/i.exec(priceRaw);
  const amountText = priceMatch?.[2]?.replace(/,/g, '') ?? '';
  const noteMatch = /(Prices[^.]*\.?)/i.exec(priceRaw);

  const metaList = col
    .find('.tour-info-metalist li')
    .map((_, li) => squash($(li).text()))
    .get();
  // The route is the second item of the meta list; some tours only list the duration there and keep the route in
  // the highlights as "Ephesus • Priene • Pamukkale".
  const routeText = metaList[1] ?? listItems($, col.find('.highlight-tour').first()).find((item) => item.includes('•')) ?? '';
  const route = routeText
    .split(/[,•]/)
    .map((stop) => stop.trim())
    .filter(Boolean);

  const mapLink = col.find('a[data-fancybox="roadmap"]').first();
  const mapHeading = col
    .find('h3')
    .filter((_, h) => /route map/i.test($(h).text()))
    .first();
  const mapIntro = squash(mapHeading.nextAll('p').first().text());

  const itinerary = col
    .find('#tourPlan .accordion-item')
    .map((_, item) => {
      const heading = squash($(item).find('.accordion-button').first().text());
      const split = heading.indexOf(':');
      const body = $(item).find('.accordion-body').first();
      const meals = body
        .find('ul li')
        .map((_i, li) => squash($(li).text()).replace(/^\(?\s*Meals?:\s*/i, '').replace(/\)\s*$/, ''))
        .get()
        .join(', ');
      const clone = body.clone();
      clone.find('ul').remove();
      return {
        dayLabel: split > -1 ? heading.slice(0, split).trim() : heading,
        title: split > -1 ? heading.slice(split + 1).trim() : '',
        text: paragraphs($, clone),
        meals,
      };
    })
    .get();

  const included = listItems($, col.find('h3').filter((_, h) => squash($(h).text()) === 'Included').first().nextAll('.includ-and-exclud-area').first());
  const excluded = listItems($, col.find('h3').filter((_, h) => squash($(h).text()) === 'Excluded').first().nextAll('.includ-and-exclud-area').first());

  const accordion = (title) =>
    listItems(
      $,
      col
        .find('#accordionTravel .accordion-item')
        .filter((_, item) => squash($(item).find('.accordion-button').first().text()).toLowerCase() === title)
        .first()
        .find('.accordion-body'),
    );

  const gallery = [];
  const seen = new Set();
  $('.gallery-img-wrap img').each((_, img) => {
    const image = imageOf($, $(img));
    if (image && !seen.has(image.src)) {
      seen.add(image.src);
      gallery.push(image);
    }
  });

  const related = [];
  $('.package-wrapper a.package-card-img').each((_, a) => {
    related.push({ title: squash($(a).attr('title') ?? ''), url: $(a).attr('href') ?? '' });
  });

  const faqs = [];
  $('#accordionExample .accordion-item').each((_, item) => {
    const q = squash($(item).find('.accordion-button').first().text()).replace(/^Q\d+\.\s*/i, '');
    const a = paragraphs($, $(item).find('.accordion-body').first());
    if (q) {
      faqs.push({ q, a });
    }
  });

  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      jsonLd.push(stripRollingDates(JSON.parse($(script).text())));
    } catch {
      issues.push('invalid JSON-LD block');
    }
  });

  const tour = {
    locale: 'en',
    sourceUrl,
    path: parts.slice(1).join('/'),
    slug,
    parent,
    category,
    title: squash($('h1').first().text()) || squash(col.children('h2').first().text()),
    metaTitle: squash($('title').first().text()),
    metaDescription: squash($('meta[name="description"]').attr('content') ?? ''),
    canonical: $('link[rel="canonical"]').attr('href') ?? '',
    lastUpdated: parseDate(squash($('.footer-meta').first().text())),
    breadcrumb: $('ul.breadcrumb-list li')
      .map((_, li) => squash($(li).text()))
      .get(),
    summary: paragraphs($, col.find('p.excerpt').first()),
    facts,
    extraFacts,
    nights: durationMatch ? Number(durationMatch[1]) : null,
    days: durationMatch ? Number(durationMatch[2]) : null,
    price: {
      amount: amountText && !Number.isNaN(Number(amountText)) ? Number(amountText) : null,
      currency: priceMatch ? (CURRENCIES[priceMatch[1]] ?? priceMatch[1]) : '',
      unit: squash(priceMatch?.[3] ?? ''),
      note: squash(noteMatch?.[1] ?? ''),
      raw: priceRaw,
    },
    route,
    routeMap: { image: imageOf($, mapLink.find('img').first()) && { ...imageOf($, mapLink.find('img').first()), src: mapLink.attr('href') ?? '' }, intro: mapIntro },
    highlights: listItems($, col.find('.highlight-tour').first()),
    itinerary,
    included,
    excluded,
    importantNotes: accordion('important notes'),
    cancellationPolicy: accordion('trip cancellation policy'),
    gallery,
    related,
    faqs,
    jsonLd,
  };

  for (const [field, empty] of [
    ['title', !tour.title],
    ['summary', !tour.summary],
    ['duration', !tour.facts.duration],
    ['price', tour.price.amount === null],
    ['route', tour.route.length === 0],
    ['routeMap', !tour.routeMap.image],
    ['highlights', tour.highlights.length === 0],
    ['itinerary', tour.itinerary.length === 0],
    ['included', tour.included.length === 0],
    ['excluded', tour.excluded.length === 0],
    ['gallery', tour.gallery.length === 0],
    ['faqs', tour.faqs.length === 0],
    ['lastUpdated', !tour.lastUpdated],
    ['metaDescription', tour.metaDescription.length < 70],
  ]) {
    if (empty) {
      issues.push(`missing ${field}`);
    }
  }
  return { tour, issues };
}
