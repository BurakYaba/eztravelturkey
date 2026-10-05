'use client';

import { useId, useState, type FormEvent } from 'react';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr';
import { Button } from './Button';

export function Newsletter() {
  const uid = useId();
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus('sending');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'newsletter', email: data.get('email'), website: data.get('website') }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="bg-navy-900 text-white">
      <div className="container-x grid items-center gap-8 py-12 md:grid-cols-[auto_1fr] md:py-14 lg:grid-cols-[auto_1fr_1fr]">
        <EnvelopeSimple size={44} className="text-gold-500 hidden md:block" aria-hidden />
        <div>
          <h2 className="font-display text-3xl text-white">Get travel inspiration in your inbox</h2>
          <p className="mt-2 text-white/80">New travel guides, destination ideas and our best monthly deals.</p>
        </div>
        {status === 'done' ? (
          <p role="status" className="text-gold-100 text-lg md:col-span-2 lg:col-span-1">
            Thank you for subscribing.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row md:col-span-2 lg:col-span-1">
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <label htmlFor={`${uid}-email`} className="sr-only">
              Email address
            </label>
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Your email address"
              className="text-ink placeholder:text-muted focus:ring-gold-500 h-12 flex-1 rounded-lg border border-white/30 bg-white px-4 focus:ring-2 focus:outline-none"
            />
            <Button type="submit" size="lg" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Subscribe'}
            </Button>
            {status === 'error' && (
              <p role="alert" className="text-gold-100 text-sm sm:basis-full">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
