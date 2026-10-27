import { site } from '@/data/site';

/**
 * The enquiry e-mail the team receives (docs/project-plan.md P9.3): a plain-text version and an HTML version of the same fields.
 * The HTML is written for mail programs, not browsers: tables, inline styles, no pictures and no scripts, so Gmail, Outlook and phones
 * draw it the same way. Everything the visitor typed is escaped before it goes into the HTML, and the links (mail, phone, WhatsApp, the
 * page the form was sent from) are built only from values that pass a check.
 */

export type InquiryField = { key: string; label: string; value: string };

const NAVY = '#0f2d4a';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';
const SOFT = '#f4f6f9';
const GOLD = '#b8893a';

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Line breaks the visitor typed in the notes stay line breaks. */
const multiline = (value: string) => escape(value).replace(/\r?\n/g, '<br>');

/** `keepTogether` keeps a phone number on one line (its spaces become non-breaking). */
const link = (href: string, text: string, keepTogether = false) =>
  `<a href="${escape(href)}" style="color:${NAVY};text-decoration:underline;">${keepTogether ? escape(text).replace(/ /g, '&nbsp;') : escape(text)}</a>`;

const emailOk = (value: string) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value);

/** A page address on this site (`/en/plan-my-trip/`), nothing else: the form sends the page the visitor was on. */
function pageLink(value: string): string | null {
  return /^\/[A-Za-z0-9\-._~%/]*$/.test(value) && !value.includes('//') ? `${site.url.replace(/\/$/, '')}${value}` : null;
}

export function buildInquiryEmail(subject: string, fields: InquiryField[], replyTo: string): { text: string; html: string } {
  const text = [subject, '', ...fields.map(({ label, value }) => `${label}: ${value}`)].join('\n');

  const value = (key: string) => fields.find((field) => field.key === key)?.value ?? '';
  const phoneDigits = `${value('phoneCode')}${value('phone')}`.replace(/\D/g, '');
  const name = value('name');
  const tour = value('tour');

  type Row = { label: string; html: string };
  const rows = (list: (Row | null)[]) => list.filter((row): row is Row => row !== null);
  const row = (label: string, key: string, render: (text: string) => string = escape): Row | null => {
    const text = value(key);
    return text ? { label, html: render(text) } : null;
  };

  const trip = rows([
    row('Tour', 'tour', (text) => `<strong style="font-size:16px;">${escape(text)}</strong>`),
    row('Start date', 'startDate'),
    row('End date', 'endDate'),
    row('Destinations', 'destinations'),
    row('Adults', 'adults'),
    row('Children', 'children'),
    row('Ages of the children', 'childrenAges'),
    row('Travel style', 'style'),
    row('Hotel category', 'hotelClass'),
    value('budget') ? { label: 'Budget per person', html: escape([value('budget'), value('currency')].filter(Boolean).join(' ')) } : null,
  ]);
  const traveller = rows([
    row('Name', 'name', (text) => `<strong>${escape(text)}</strong>`),
    row('Nationality', 'nationality'),
    row('E-mail', 'email', (text) => (emailOk(text) ? link(`mailto:${text}`, text) : escape(text))),
    phoneDigits.length >= 7
      ? {
          label: 'Phone',
          html: `${link(`tel:+${phoneDigits}`, `+${value('phoneCode').replace(/\D/g, '')} ${value('phone')}`.trim(), true)}&nbsp;&nbsp;·&nbsp;&nbsp;${link(`https://wa.me/${phoneDigits}`, 'WhatsApp')}`,
        }
      : row('Phone', 'phone'),
  ]);
  const notes = value('message');
  const source = value('source');
  const sourceLink = pageLink(source);

  const section = (title: string, list: Row[]) =>
    list.length === 0
      ? ''
      : `<tr><td style="padding:22px 28px 6px;font:600 11px Arial,Helvetica,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:${GOLD};">${escape(title)}</td></tr>
<tr><td style="padding:0 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${list
          .map(
            (item) =>
              `<tr><td width="120" valign="top" style="padding:10px 12px 9px 0;border-bottom:1px solid ${LINE};font:13px Arial,Helvetica,sans-serif;color:${MUTED};">${escape(item.label)}</td><td valign="top" style="padding:9px 0;border-bottom:1px solid ${LINE};font:14px/1.5 Arial,Helvetica,sans-serif;color:#111827;">${item.html}</td></tr>`,
          )
          .join('')}</table></td></tr>`;

  const preheader = [name, tour].filter(Boolean).join(' · ');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(subject)}</title></head>
<body style="margin:0;padding:0;background:${SOFT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;border-collapse:separate;overflow:hidden;">
<tr><td style="background:${NAVY};padding:22px 28px;"><div style="font:600 12px Arial,Helvetica,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#d9c08a;">${escape(site.name)}</div><div style="margin-top:6px;font:600 20px/1.3 Arial,Helvetica,sans-serif;color:#ffffff;">${escape(subject.replace(`${site.name} - `, ''))}</div></td></tr>
${section('Trip', trip)}
${section('Traveller', traveller)}
${
  notes
    ? `<tr><td style="padding:22px 28px 6px;font:600 11px Arial,Helvetica,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:${GOLD};">Notes</td></tr>
<tr><td style="padding:0 28px;"><div style="padding:14px 16px;background:${SOFT};border-left:3px solid ${GOLD};font:14px/1.6 Arial,Helvetica,sans-serif;color:#111827;">${multiline(notes)}</div></td></tr>`
    : ''
}
<tr><td style="padding:24px 28px 26px;font:12px/1.6 Arial,Helvetica,sans-serif;color:${MUTED};">${
    source ? `Sent from ${sourceLink ? link(sourceLink, source) : escape(source)}<br>` : ''
  }Reply to this e-mail to answer ${emailOk(replyTo) ? escape(replyTo) : 'the sender'} directly.</td></tr>
</table></td></tr></table></body></html>`;

  return { text, html };
}
