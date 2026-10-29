import { getDictionary } from '@/i18n/dictionaries';
import { localePath } from '@/i18n/paths';
import { allTours, blogCategories, comboCards } from '@/lib/data';
import { getSiteSettings } from '@/lib/data/settings';
import { absoluteUrl } from '@/lib/seo';
import type { CountryId } from '@/data/types';

export const revalidate = 86400;

const countryOrder: CountryId[] = ['turkey', 'greece', 'egypt', 'jordan', 'morocco'];

/**
 * `/llms.txt`: a plain Markdown summary of the site for AI assistants (docs/project-plan.md P8.3, decision 2026-10-21: made and
 * kept up to date). Built from the CMS on every revalidation, so a new tour appears here without anyone editing a file. Written in
 * Traditional Chinese, the language of the site. Google says this file does not change how it ranks pages; it costs nothing to
 * keep and some assistants read it.
 */
export async function GET() {
  const lang = 'zh';
  const { countries, meta } = getDictionary(lang);
  const s = await getSiteSettings(lang);
  const [tours, combos, categories] = await Promise.all([allTours(lang), comboCards(lang), blogCategories(lang)]);
  const link = (title: string, href: string, note?: string) =>
    `- [${title}](${absoluteUrl(localePath(lang, href))})${note ? `：${note}` : ''}`;
  const price = (eur: number | null, usd: number | null) =>
    [eur === null ? '' : `€${eur} 起`, usd === null ? '' : `US$${usd} 起`].filter(Boolean).join(' / ');

  const lines: string[] = [
    '# Eztravel Turkey（土耳其易遊網）',
    '',
    `> ${meta.defaultDescription} 持有土耳其旅行社協會（TÜRSAB）執照（執照號碼 ${s.licenseNo}），總部位於伊斯坦堡，自 ${s.founded} 年起營運。`,
    '',
    '行程價格為每人起價，實際價格依日期、飯店與團體人數而定。每個行程頁面都有詢價表單。',
    '',
    '## 公司',
    '',
    link('關於我們', '/about', '公司介紹、執照、團隊'),
    link('聯繫我們', '/contact', [s.phone, s.email].filter(Boolean).join('、')),
    link('規劃我的旅程', '/plan-my-trip', '索取客製化報價'),
    link('常見問題', '/faq'),
    '',
    '## 多國組合行程',
    '',
    ...combos.map((c) => link(c.title, c.href, c.price || undefined)),
    '',
  ];

  for (const id of countryOrder) {
    const list = tours
      .filter((t) => t.countries.length === 1 && t.countries[0] === id)
      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));
    if (list.length === 0) {
      continue;
    }
    lines.push(
      `## ${countries[id].name}行程`,
      '',
      link(`所有${countries[id].name}行程`, `/destinations/${id}-tours`),
    );
    lines.push(
      ...list.map((t) => link(t.title, t.href, [t.duration, price(t.priceEUR, t.priceUSD)].filter(Boolean).join('，'))),
      '',
    );
  }

  const multi = tours.filter((t) => t.countries.length > 1).sort((a, b) => (a.days ?? 0) - (b.days ?? 0));
  if (multi.length > 0) {
    lines.push(
      '## 多國串連行程',
      '',
      ...multi.map((t) =>
        link(t.title, t.href, [t.duration, price(t.priceEUR, t.priceUSD)].filter(Boolean).join('，')),
      ),
      '',
    );
  }

  if (categories.length > 0) {
    lines.push('## 旅遊指南（部落格）', '', ...categories.map((c) => link(c.title, c.href)), '');
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
