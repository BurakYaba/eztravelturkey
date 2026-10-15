'use client';

import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle, WarningCircle, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { whatsappLink } from '@/data/site';
import type { Dictionary } from '@/i18n/dictionaries';
import { format } from '@/i18n/template';
import { cn } from '@/lib/utils';
import { Button, ButtonAnchor } from './Button';

type Variant = 'sidebar' | 'page' | 'contact';

type Props = {
  variant?: Variant;
  tour?: { slug: string; title: string };
  defaultDestinations?: string[];
  className?: string;
  text: Dictionary['form'];
  destinations: { id: string; name: string }[];
};

type Status = 'idle' | 'sending' | 'done' | 'error';

const fieldBase =
  'w-full rounded-lg border border-navy-900/30 bg-white px-3.5 text-[0.97rem] text-ink placeholder:text-muted/80 transition focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500/50';

/** Dialing codes of the markets the old forms served; any other code can still be typed. */
const dialCodes = ['+1', '+44', '+61', '+49', '+33', '+34', '+39', '+31', '+55', '+52', '+886', '+852', '+81', '+82', '+65', '+60', '+66', '+64', '+353', '+41', '+46', '+47', '+45', '+48', '+420', '+30', '+20', '+27', '+90', '+91', '+212', '+962', '+966', '+971'];

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="text-navy-900 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="text-muted text-sm">{hint}</p>}
    </div>
  );
}

const count = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

export function QuoteFormClient({ variant = 'page', tour, defaultDestinations = [], className, text, destinations }: Props) {
  const uid = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [delivered, setDelivered] = useState(false);
  const [summary, setSummary] = useState('');
  const [children, setChildren] = useState('0');

  const id = (name: string) => `${uid}-${name}`;
  const isContact = variant === 'contact';
  const compact = variant === 'sidebar';
  const wide = variant === 'page';
  const phoneRequired = compact;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (name: string) => String(data.get(name) ?? '');
    const payload: Record<string, string> = {
      type: isContact ? 'contact' : 'quote',
      tour: tour?.title ?? '',
      name: get('name'),
      nationality: get('nationality'),
      email: get('email'),
      phoneCode: get('phoneCode'),
      phone: get('phone'),
      adults: get('adults'),
      children: get('children'),
      childrenAges: get('childrenAges'),
      startDate: get('startDate'),
      endDate: get('endDate'),
      style: get('style'),
      hotelClass: get('hotelClass'),
      budget: get('budget'),
      currency: get('currency'),
      destinations: data.getAll('destinations').join(', '),
      message: get('message'),
      website: get('website'),
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
        setError(result.error ?? text.errorGeneric);
        setStatus('error');
        return;
      }
      const lines = [
        format(text.whatsappHello, { name: payload.name }),
        tour ? format(text.whatsappTour, { tour: tour.title }) : '',
        payload.destinations ? format(text.whatsappDestinations, { destinations: payload.destinations }) : '',
        payload.adults ? format(text.whatsappAdults, { adults: payload.adults }) : '',
        payload.startDate ? format(text.whatsappStart, { date: payload.startDate }) : '',
        payload.message,
      ].filter(Boolean);
      setSummary(lines.join(' '));
      setDelivered(Boolean(result.delivered));
      setStatus('done');
    } catch {
      setError(text.errorNetwork);
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className={cn('border-gold-500/40 shadow-card rounded-lg border bg-white p-6', className)}>
        <CheckCircle size={36} weight="fill" className="text-gold-600" aria-hidden />
        <h3 className="mt-3 text-2xl">{delivered ? text.doneTitle : text.doneTitleLocal}</h3>
        <p className="text-muted mt-2">{delivered ? text.doneText : text.doneTextLocal}</p>
        <ButtonAnchor
          href={whatsappLink(summary)}
          target="_blank"
          rel="noopener noreferrer"
          variant={delivered ? 'secondary' : 'primary'}
          className="mt-5 w-full">
          <WhatsappLogo size={20} weight="fill" aria-hidden />
          {delivered ? text.whatsappAlso : text.whatsappSend}
        </ButtonAnchor>
      </div>
    );
  }

  const grid = cn('grid gap-4', !compact && 'sm:grid-cols-2');
  // Short fields sit side by side even in the narrow sidebar, which keeps the form short.
  const pair = cn('grid gap-4', compact ? 'grid-cols-2 gap-3' : 'sm:grid-cols-2');

  return (
    <form
      onSubmit={onSubmit}
      className={cn('border-cream-200 shadow-card space-y-4 rounded-lg border bg-white p-5 md:p-6', className)}>
      {/* Honeypot, hidden from people */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={id('website')}>Website</label>
        <input id={id('website')} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {compact && (
        <div>
          <h2 className="text-2xl">{text.sidebarTitle}</h2>
          <p className="text-muted mt-1 text-sm">{text.sidebarText}</p>
        </div>
      )}

      {tour && (
        <div className="bg-cream-50 border-cream-200 rounded-lg border px-3.5 py-3">
          <p className="text-muted text-xs font-semibold tracking-wide uppercase">{text.tour}</p>
          <p className="text-navy-900 font-semibold">{tour.title}</p>
        </div>
      )}

      {wide && (
        <fieldset className="space-y-2">
          <legend className="text-navy-900 text-sm font-semibold">{text.destinations}</legend>
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

      <div className={grid}>
        <Field label={text.name} htmlFor={id('name')}>
          <input id={id('name')} name="name" required minLength={2} autoComplete="name" className={cn(fieldBase, 'h-12')} />
        </Field>
        <Field label={text.email} htmlFor={id('email')}>
          <input id={id('email')} name="email" type="email" required autoComplete="email" className={cn(fieldBase, 'h-12')} />
        </Field>
      </div>

      {!isContact && (
        <Field label={text.nationality} htmlFor={id('nationality')}>
          <input
            id={id('nationality')}
            name="nationality"
            autoComplete="country-name"
            className={cn(fieldBase, 'h-12')}
          />
        </Field>
      )}

      <div className="grid grid-cols-[6.5rem_1fr] gap-3">
        <Field label={text.phoneCode} htmlFor={id('phoneCode')}>
          <input
            id={id('phoneCode')}
            name="phoneCode"
            list={id('codes')}
            inputMode="tel"
            placeholder="+1"
            pattern="\+?[0-9]{1,4}"
            required={phoneRequired}
            autoComplete="tel-country-code"
            className={cn(fieldBase, 'h-12')}
          />
          <datalist id={id('codes')}>
            {dialCodes.map((code) => (
              <option key={code} value={code} />
            ))}
          </datalist>
        </Field>
        <Field label={phoneRequired ? text.phone : text.phoneOptional} htmlFor={id('phone')}>
          <input
            id={id('phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required={phoneRequired}
            minLength={phoneRequired ? 6 : undefined}
            className={cn(fieldBase, 'h-12')}
          />
        </Field>
      </div>

      {!isContact && (
        <>
          <div className={pair}>
            <Field label={text.adults} htmlFor={id('adults')}>
              <select id={id('adults')} name="adults" defaultValue="2" className={cn(fieldBase, 'h-12')}>
                {[...count(1, 10), '11+'].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={text.children} htmlFor={id('children')}>
              <select
                id={id('children')}
                name="children"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className={cn(fieldBase, 'h-12')}>
                {count(0, 8).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {children !== '0' && (
            <Field label={text.childrenAges} htmlFor={id('childrenAges')}>
              <input id={id('childrenAges')} name="childrenAges" placeholder="4, 7" className={cn(fieldBase, 'h-12')} />
            </Field>
          )}

          <div className={pair}>
            <Field label={text.startDate} htmlFor={id('startDate')}>
              <input id={id('startDate')} name="startDate" type="date" className={cn(fieldBase, 'h-12')} />
            </Field>
            {wide && (
              <Field label={text.endDate} htmlFor={id('endDate')}>
                <input id={id('endDate')} name="endDate" type="date" className={cn(fieldBase, 'h-12')} />
              </Field>
            )}
            <Field label={text.currency} htmlFor={id('currency')}>
              <select id={id('currency')} name="currency" defaultValue="EUR" className={cn(fieldBase, 'h-12')}>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </Field>
          </div>

          {wide && (
            <div className={grid}>
              <Field label={text.style} htmlFor={id('style')}>
                <select id={id('style')} name="style" defaultValue={text.styleOptions.unsure} className={cn(fieldBase, 'h-12')}>
                  <option value={text.styleOptions.private}>{text.styleOptions.private}</option>
                  <option value={text.styleOptions.smallGroup}>{text.styleOptions.smallGroup}</option>
                  <option value={text.styleOptions.unsure}>{text.styleOptions.unsure}</option>
                </select>
              </Field>
              <Field label={text.hotelClass} htmlFor={id('hotelClass')}>
                <select id={id('hotelClass')} name="hotelClass" defaultValue="" className={cn(fieldBase, 'h-12')}>
                  <option value="">{text.hotelOptions.any}</option>
                  <option value={text.hotelOptions.three}>{text.hotelOptions.three}</option>
                  <option value={text.hotelOptions.four}>{text.hotelOptions.four}</option>
                  <option value={text.hotelOptions.five}>{text.hotelOptions.five}</option>
                </select>
              </Field>
              <Field label={text.budget} htmlFor={id('budget')} className="sm:col-span-2">
                <input id={id('budget')} name="budget" inputMode="numeric" className={cn(fieldBase, 'h-12')} />
              </Field>
            </div>
          )}
        </>
      )}

      <Field
        label={isContact ? text.contactMessage : text.notes}
        htmlFor={id('message')}
        hint={!isContact ? text.notesHint : undefined}>
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
          <span>{text.consent}</span>
        </label>
      )}

      {status === 'error' && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <WarningCircle size={20} className="mt-px shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? text.sending : isContact ? text.sendMessage : text.send}
      </Button>
      {!isContact && <p className="text-muted text-center text-sm">{text.noObligation}</p>}
    </form>
  );
}
