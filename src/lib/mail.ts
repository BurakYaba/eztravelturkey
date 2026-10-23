/**
 * Sends the enquiry e-mail (docs/project-plan.md P9.3, D41): Brevo first, Resend as the backup. When neither is
 * configured nothing is sent and the form offers the WhatsApp handoff instead.
 *
 * - Brevo is used when `BREVO_API_KEY` is set; if it fails (an error answer, a timeout or no connection) the same mail goes to
 *   Resend when `RESEND_API_KEY` is set. With only one provider configured, only that one is tried.
 * - One idempotency key per request goes to Resend, so a retry of the same request cannot create a second mail there.
 *   Brevo has no such key; the only way to get two mails is Brevo accepting the mail but its answer getting lost, which
 *   is rare and harmless (the team gets the enquiry twice).
 * - The sender address must belong to a domain verified at both providers (SPF, DKIM, DMARC: P9.12).
 *
 * `MAIL_BREVO_URL` and `MAIL_RESEND_URL` replace the provider addresses; they exist so the delivery can be tested against
 * a local stand-in server and are never set in production.
 */

const brevoUrl = process.env.MAIL_BREVO_URL ?? 'https://api.brevo.com/v3/smtp/email';
const resendUrl = process.env.MAIL_RESEND_URL ?? 'https://api.resend.com/emails';
const TIMEOUT_MS = 6000;

export type MailJob = {
  fromName: string;
  fromEmail: string;
  /** One or more recipients, separated by commas in the `INQUIRY_TO_EMAIL` setting. */
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
};

export type MailProvider = 'brevo' | 'resend';

/** The recipients of `INQUIRY_TO_EMAIL`: a comma-separated list, at most five valid addresses. */
export function recipients(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
    .slice(0, 5);
}

async function viaBrevo(job: MailJob, apiKey: string): Promise<boolean> {
  const res = await fetch(brevoUrl, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: job.fromName, email: job.fromEmail },
      to: job.to.map((email) => ({ email })),
      replyTo: { email: job.replyTo },
      subject: job.subject,
      textContent: job.text,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return res.ok;
}

async function viaResend(job: MailJob, apiKey: string, idempotencyKey: string): Promise<boolean> {
  const res = await fetch(resendUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      from: `${job.fromName} <${job.fromEmail}>`,
      to: job.to,
      reply_to: job.replyTo,
      subject: job.subject,
      text: job.text,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return res.ok;
}

/** Returns the provider that accepted the mail, or null when none did (or none is configured). */
export async function sendMail(job: MailJob): Promise<MailProvider | null> {
  const brevoKey = process.env.BREVO_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const idempotencyKey = crypto.randomUUID();

  if (brevoKey) {
    try {
      if (await viaBrevo(job, brevoKey)) {
        return 'brevo';
      }
    } catch {
      // Fall through to the backup.
    }
  }
  if (resendKey) {
    try {
      if (await viaResend(job, resendKey, idempotencyKey)) {
        return 'resend';
      }
    } catch {
      // Both failed.
    }
  }
  return null;
}
