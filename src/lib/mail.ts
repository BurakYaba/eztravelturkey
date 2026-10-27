/**
 * Sends the enquiry e-mail (docs/project-plan.md P9.3, D41): the mailbox's own SMTP first, then Brevo, then Resend. When none is
 * configured nothing is sent and the form offers the WhatsApp handoff instead.
 *
 * - SMTP is used when `SMTP_HOST`, `SMTP_USER` and `SMTP_PASS` are set (`SMTP_PORT`, default 465, which is the encrypted port;
 *   any other port uses STARTTLS; `SMTP_SECURE=true|false` overrides). It is the mailbox the client already pays for (Hostinger
 *   Business Email: smtp.hostinger.com, port 465 or 587, the full address as the user name), so no further service is needed.
 *   The sender address must be that mailbox (or an alias the server lets it send as): SMTP servers refuse other senders.
 * - If SMTP fails (a refused login, a timeout, no connection) the same mail goes to Brevo when `BREVO_API_KEY` is set, and if that
 *   fails to Resend when `RESEND_API_KEY` is set. With only one provider configured, only that one is tried.
 * - One idempotency key per request goes to Resend, so a retry of the same request cannot create a second mail there.
 *   SMTP and Brevo have no such key; the only way to get two mails is a provider accepting the mail but its answer getting lost,
 *   which is rare and harmless (the team gets the enquiry twice).
 * - With Brevo and Resend the sender address must belong to a domain verified at the provider (SPF, DKIM, DMARC: P9.12). With
 *   SMTP the mailbox's own provider signs the mail, once the domain's mail records point to it.
 *
 * `MAIL_BREVO_URL` and `MAIL_RESEND_URL` replace the provider addresses; they exist so the delivery can be tested against
 * a local stand-in server (scripts/mail-test.mjs) and are never set in production.
 */

const brevoUrl = process.env.MAIL_BREVO_URL ?? 'https://api.brevo.com/v3/smtp/email';
const resendUrl = process.env.MAIL_RESEND_URL ?? 'https://api.resend.com/emails';
const TIMEOUT_MS = 6000;
/** Opening the connection, the login and the message take longer than one API call. */
const SMTP_TIMEOUT_MS = 8000;

export type MailJob = {
  fromName: string;
  fromEmail: string;
  /** One or more recipients, separated by commas in the `INQUIRY_TO_EMAIL` setting. */
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
};

export type MailProvider = 'smtp' | 'brevo' | 'resend';

/** The first configured provider (the one tried first), or 'none': for the form's answer and the health check. */
export function mailProvider(): MailProvider | 'none' {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return 'smtp';
  }
  return process.env.BREVO_API_KEY ? 'brevo' : process.env.RESEND_API_KEY ? 'resend' : 'none';
}

/** The recipients of `INQUIRY_TO_EMAIL`: a comma-separated list, at most five valid addresses. */
export function recipients(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
    .slice(0, 5);
}

async function viaSmtp(job: MailJob): Promise<boolean> {
  // Loaded when needed: the Brevo and Resend paths, and every page, do not carry it.
  const { createTransport } = await import('nodemailer');
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    // Tests only (a local stand-in server without a certificate); never set in production.
    ...(process.env.SMTP_INSECURE_TLS === 'true' ? { tls: { rejectUnauthorized: false } } : {}),
  });
  try {
    const result = await transport.sendMail({
      from: { name: job.fromName, address: job.fromEmail },
      to: job.to,
      replyTo: job.replyTo,
      subject: job.subject,
      text: job.text,
    });
    // `rejected` lists recipients the server refused; the mail counts as sent when at least one recipient took it.
    return result.accepted.length > 0;
  } finally {
    transport.close();
  }
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

  if (mailProvider() === 'smtp') {
    try {
      if (await viaSmtp(job)) {
        return 'smtp';
      }
    } catch {
      // Fall through to the backups.
    }
  }
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
      // All failed.
    }
  }
  return null;
}
