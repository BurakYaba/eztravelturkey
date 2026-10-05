'use client';

import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle, WarningCircle, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { destinations } from '@/data/destinations';
import { whatsappLink } from '@/data/site';
import { cn } from '@/lib/utils';
import { Button, ButtonAnchor } from './Button';

type Variant = 'sidebar' | 'page' | 'contact';

type Props = {
  variant?: Variant;
  tour?: { slug: string; title: string };
  defaultDestinations?: string[];
  className?: string;
};

type Status = 'idle' | 'sending' | 'done' | 'error';

const fieldBase =
  'w-full rounded-lg border border-navy-900/30 bg-white px-3.5 text-[0.97rem] text-ink placeholder:text-muted/80 transition focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500/50';

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-navy-900 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="text-muted text-sm">{hint}</p>}
    </div>
  );
}

export function QuoteForm({ variant = 'page', tour, defaultDestinations = [], className }: Props) {
  const uid = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [delivered, setDelivered] = useState(false);
  const [summary, setSummary] = useState('');

  const id = (name: string) => `${uid}-${name}`;
  const isContact = variant === 'contact';
  const compact = variant === 'sidebar';

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload: Record<string, string> = {
      type: isContact ? 'contact' : 'quote',
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      travelers: String(data.get('travelers') ?? ''),
      startDate: String(data.get('startDate') ?? ''),
      style: String(data.get('style') ?? ''),
      destinations: data.getAll('destinations').join(', '),
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''),
      tour: tour?.title ?? '',
      source: typeof window === 'undefined' ? '' : window.location.pathname,
    };

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as { ok: boolean; delivered?: boolean; error?: string };
      if (!res.ok || !result.ok) {
        setError(result.error ?? 'Something went wrong. Please try again or message us on WhatsApp.');
        setStatus('error');
        return;
      }
      const lines = [
        `Hello Magnificent Travel, my name is ${payload.name}.`,
        tour ? `I am interested in: ${tour.title}.` : '',
        payload.destinations ? `Destinations: ${payload.destinations}.` : '',
        payload.travelers ? `Travelers: ${payload.travelers}.` : '',
        payload.startDate ? `Preferred start date: ${payload.startDate}.` : '',
        payload.message,
      ].filter(Boolean);
      setSummary(lines.join(' '));
      setDelivered(Boolean(result.delivered));
      setStatus('done');
    } catch {
      setError('We could not send your request. Please check your connection or message us on WhatsApp.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className={cn('border-gold-500/40 shadow-card rounded-lg border bg-white p-6', className)}>
        <CheckCircle size={36} weight="fill" className="text-gold-600" aria-hidden />
        <h3 className="mt-3 text-2xl">
          {delivered ? 'Thank you, your request is on its way' : 'Your request is ready'}
        </h3>
        <p className="text-muted mt-2">
          {delivered
            ? 'A travel specialist will reply to the email address you gave us with ideas and a personalized quote.'
            : 'To make sure it reaches our team straight away, send it to us on WhatsApp. Your details are filled in for you.'}
        </p>
        <ButtonAnchor
          href={whatsappLink(summary)}
          target="_blank"
          rel="noopener noreferrer"
          variant={delivered ? 'secondary' : 'primary'}
          className="mt-5 w-full">
          <WhatsappLogo size={20} weight="fill" aria-hidden />
          {delivered ? 'Also chat on WhatsApp' : 'Send on WhatsApp'}
        </ButtonAnchor>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate={false}
      className={cn('border-cream-200 shadow-card space-y-4 rounded-lg border bg-white p-5 md:p-6', className)}>
      {/* Honeypot, hidden from people */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={id('website')}>Website</label>
        <input id={id('website')} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {variant !== 'sidebar' && !isContact && (
        <fieldset className="space-y-2">
          <legend className="text-navy-900 text-sm font-semibold">Where would you like to go?</legend>
          <div className="flex flex-wrap gap-2">
            {destinations.map((d) => (
              <label key={d.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="destinations"
                  value={d.name}
                  defaultChecked={defaultDestinations.includes(d.id)}
                  className="peer sr-only"
                />
                <span className="border-navy-900/30 text-navy-900 peer-checked:border-navy-900 peer-checked:bg-navy-900 peer-focus-visible:ring-gold-500 inline-block rounded-full border bg-white px-4 py-2 text-sm font-medium transition peer-checked:text-white peer-focus-visible:ring-2">
                  {d.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        <Field label="Full name" htmlFor={id('name')}>
          <input
            id={id('name')}
            name="name"
            required
            minLength={2}
            autoComplete="name"
            className={cn(fieldBase, 'h-12')}
          />
        </Field>
        <Field label="Email" htmlFor={id('email')}>
          <input
            id={id('email')}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={cn(fieldBase, 'h-12')}
          />
        </Field>
      </div>

      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        {!compact && (
          <Field label="Phone or WhatsApp (optional)" htmlFor={id('phone')}>
            <input id={id('phone')} name="phone" type="tel" autoComplete="tel" className={cn(fieldBase, 'h-12')} />
          </Field>
        )}
        {!isContact && (
          <Field label="Number of travelers" htmlFor={id('travelers')}>
            <select id={id('travelers')} name="travelers" defaultValue="2" className={cn(fieldBase, 'h-12')}>
              {['1', '2', '3', '4', '5', '6', '7 to 10', '11 or more'].map((n) => (
                <option key={n} value={n}>
                  {n} {n === '1' ? 'traveler' : 'travelers'}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {!isContact && (
        <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
          <Field label="Preferred travel dates (optional)" htmlFor={id('startDate')}>
            <input id={id('startDate')} name="startDate" type="date" className={cn(fieldBase, 'h-12')} />
          </Field>
          {variant === 'page' && (
            <Field label="Travel style" htmlFor={id('style')}>
              <select id={id('style')} name="style" defaultValue="Not sure yet" className={cn(fieldBase, 'h-12')}>
                <option>Private tour</option>
                <option>Small group tour</option>
                <option>Not sure yet</option>
              </select>
            </Field>
          )}
        </div>
      )}

      <Field
        label={isContact ? 'How can we help?' : 'Anything we should know? (optional)'}
        htmlFor={id('message')}
        hint={!isContact ? 'Interests, pace, special occasions, mobility needs.' : undefined}>
        <textarea
          id={id('message')}
          name="message"
          rows={compact ? 3 : 5}
          required={isContact}
          className={cn(fieldBase, 'py-3')}
        />
      </Field>

      {isContact && (
        <label className="text-muted flex items-start gap-3 text-sm">
          <input type="checkbox" required className="accent-navy-900 mt-1 size-4" />
          <span>
            I agree that Magnificent Travel may use my details to reply to this message, as described in the privacy
            policy.
          </span>
        </label>
      )}

      {status === 'error' && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <WarningCircle size={20} className="mt-px shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : isContact ? 'Send Message' : 'Send My Request'}
      </Button>
      {!isContact && (
        <p className="text-muted text-center text-sm">
          No obligation. Our travel experts will create a tailored itinerary.
        </p>
      )}
    </form>
  );
}
