import { NextResponse } from 'next/server';
import { site } from '@/data/site';

type Payload = Record<string, unknown>;

const clean = (value: unknown, max = 2000) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * Lines of the message in the order the client asked for (2026-10-12): the tour first, then name, nationality, email,
 * code, mobile phone, adults, start date and notes. Fields the old form also had follow.
 */
const labels: [key: string, label: string][] = [
  ['tour', 'Tour'],
  ['name', 'Name'],
  ['nationality', 'Nationality'],
  ['email', 'E-Mail'],
  ['phoneCode', 'Code'],
  ['phone', 'Mobile Phone'],
  ['adults', 'Number of Adults'],
  ['children', 'Number of Children'],
  ['childrenAges', 'Ages of the Children'],
  ['startDate', 'Preferred Tour Start Date'],
  ['endDate', 'Preferred End Date'],
  ['destinations', 'Destinations'],
  ['style', 'Travel Style'],
  ['hotelClass', 'Hotel Category'],
  ['budget', 'Budget per Person'],
  ['currency', 'Currency'],
  ['message', 'Notes'],
  ['source', 'Sent from'],
];

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body.website)) {
    return NextResponse.json({ ok: true, delivered: true });
  }

  const type = clean(body.type, 20);
  const email = clean(body.email, 200);

  if (!['quote', 'contact'].includes(type)) {
    return NextResponse.json({ ok: false, error: 'Unknown form type.' }, { status: 400 });
  }
  if (!emailOk(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
  }
  // Requests sent from a tour page must include a phone number the team can call or message.
  if (type === 'quote' && clean(body.tour, 200) && clean(body.phone, 40).replace(/\D/g, '').length < 6) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a mobile phone number we can reach you on.' },
      { status: 400 },
    );
  }
  if (clean(body.name, 120).length < 2) {
    return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 });
  }

  const fields = labels
    .map(([key, label]) => [label, clean(body[key])] as const)
    .filter(([, value]) => value);

  const subject = type === 'contact' ? 'Magnificent Travel - Contact Message' : 'Magnificent Travel - Request a Quote';

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL;

  // Without an email provider configured, nothing is stored. The client then offers a WhatsApp handoff.
  if (!apiKey || !to || !from) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const text = [subject, '', ...fields.map(([label, value]) => `${label}: ${value}`)].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${site.name} <${from}>`,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: true, delivered: false });
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch {
    return NextResponse.json({ ok: true, delivered: false });
  }
}
