// Tests the enquiry e-mail (src/lib/mail.ts, src/app/api/inquiry/route.ts) against stand-in servers: nothing leaves this computer.
//
//   node scripts/mail-test.mjs            transport level: mail.ts against fake SMTP / Brevo / Resend servers
//   node scripts/mail-test.mjs --route    also the real form route: starts `next dev` on port 3115 and posts a form
//
// Needs Node 22.18 or newer (it loads src/lib/mail.ts directly). Exits 1 when a check fails.
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const withRoute = process.argv.includes('--route');
let failed = 0;
const check = (ok, label, detail = '') => {
  if (!ok) {failed++;}
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && detail ? `   (${detail})` : ''}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------------------------- stand-in servers
const USER = 'no-reply@magnificenttravel.com';
const PASS = 'correct horse';
const inbox = []; // messages the fake SMTP server accepted
let smtpMode = { failAuth: false, refuse: [] };

function smtpServer({ secure, port }) {
  const server = new SMTPServer({
    secure,
    authOptional: false,
    allowInsecureAuth: true,
    disabledCommands: secure ? [] : [],
    logger: false,
    onAuth(auth, _session, done) {
      if (smtpMode.failAuth || auth.username !== USER || auth.password !== PASS) {return done(new Error('Invalid login'));}
      done(null, { user: auth.username });
    },
    onRcptTo(address, _session, done) {
      if (smtpMode.refuse.includes(address.address)) {return done(new Error('Mailbox unavailable'));}
      done();
    },
    onData(stream, session, done) {
      simpleParser(stream).then((mail) => {
        inbox.push({ mail, envelopeTo: session.envelope.rcptTo.map((r) => r.address), envelopeFrom: session.envelope.mailFrom.address, hello: session.hostNameAppearsAs, port });
        done();
      }, done);
    },
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

const calls = { brevo: [], resend: [] };
let backupStatus = { brevo: 200, resend: 200 };
function httpServer(name, port) {
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      calls[name].push(JSON.parse(body || '{}'));
      res.statusCode = backupStatus[name];
      res.end('{}');
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

// A server that accepts the connection and never says a word (a provider that hangs).
const hanging = () => new Promise((resolve) => {
  const server = net.createServer(() => {});
  server.listen(2599, '127.0.0.1', () => resolve(server));
});

const ssl = await smtpServer({ secure: true, port: 4465 }); // like port 465: encrypted from the first byte
const starttls = await smtpServer({ secure: false, port: 2587 }); // like port 587: plain, then STARTTLS
const brevo = await httpServer('brevo', 2601);
const resend = await httpServer('resend', 2602);
const hang = await hanging();

process.env.MAIL_BREVO_URL = 'http://127.0.0.1:2601';
process.env.MAIL_RESEND_URL = 'http://127.0.0.1:2602';
const { sendMail, mailProvider, recipients } = await import('../src/lib/mail.ts');

const env = (vars) => {
  for (const key of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_INSECURE_TLS', 'BREVO_API_KEY', 'RESEND_API_KEY']) {delete process.env[key];}
  Object.assign(process.env, vars);
};
const smtpEnv = (port, extra = {}) => ({ SMTP_HOST: '127.0.0.1', SMTP_PORT: String(port), SMTP_USER: USER, SMTP_PASS: PASS, SMTP_INSECURE_TLS: 'true', ...extra });
const reset = () => {
  inbox.length = 0;
  calls.brevo.length = 0;
  calls.resend.length = 0;
  smtpMode = { failAuth: false, refuse: [] };
  backupStatus = { brevo: 200, resend: 200 };
};

const TEAM = ['support@magnificenttravel.com', 'magnificenttravel@gmail.com', 'kenan@magnificenttravel.com', 'kenan.ungur@gmail.com'];
const job = (extra = {}) => ({
  fromName: 'Magnificent Travel',
  fromEmail: USER,
  to: TEAM,
  replyTo: 'visitor@example.com',
  subject: 'Magnificent Travel - Request a Quote',
  text: 'Tour: 7 Days Turkey\nName: Ayşe Yılmaz\nNotes: 日本語 中文 Türkçe ğüşiöç',
  html: '<p>HTML <b>part</b> 日本語 Türkçe</p>',
  ...extra,
});

// ------------------------------------------------------------------------------------------------------- the checks
console.log('--- which provider is first');
env({});
check(mailProvider() === 'none', 'nothing configured: none');
env({ RESEND_API_KEY: 'k' });
check(mailProvider() === 'resend', 'only Resend: resend');
env({ BREVO_API_KEY: 'k', RESEND_API_KEY: 'k' });
check(mailProvider() === 'brevo', 'Brevo and Resend: brevo first');
env(smtpEnv(4465, { BREVO_API_KEY: 'k' }));
check(mailProvider() === 'smtp', 'SMTP and Brevo: smtp first');
env({ SMTP_HOST: 'h', SMTP_USER: 'u' });
check(mailProvider() === 'none', 'SMTP without a password is not configured');
check(recipients('a@b.co, kenan.ungur@gmail.com ,bad, c@d.com,e@f.com,g@h.com,i@j.com').length === 5, 'at most five recipients, invalid ones dropped');

console.log('--- SMTP over an encrypted connection (like port 465)');
reset();
env(smtpEnv(4465, { SMTP_SECURE: 'true' }));
check((await sendMail(job())) === 'smtp', 'mail accepted by smtp');
{
  const got = inbox[0];
  check(inbox.length === 1, 'exactly one message arrived', `${inbox.length}`);
  check(got?.mail.from?.value[0].address === USER && got?.mail.from?.value[0].name === 'Magnificent Travel', 'From: Magnificent Travel <no-reply@…>', JSON.stringify(got?.mail.from?.value));
  check(TEAM.every((a) => got?.envelopeTo.includes(a)) && got?.envelopeTo.length === 4, 'all four recipients are in the envelope', JSON.stringify(got?.envelopeTo));
  check(got?.mail.replyTo?.value[0].address === 'visitor@example.com', 'Reply-To is the visitor', JSON.stringify(got?.mail.replyTo?.value));
  check(got?.mail.subject === 'Magnificent Travel - Request a Quote', 'subject');
  check(got?.mail.text?.includes('Ayşe Yılmaz') && got.mail.text.includes('日本語 中文 Türkçe ğüşiöç'), 'Turkish, Chinese and Japanese characters arrive intact', JSON.stringify(got?.mail.text));
  check(got?.mail.html?.includes('<b>part</b>') && got.mail.html.includes('日本語 Türkçe'), 'the HTML part arrives next to the plain text', JSON.stringify(got?.mail.html));
  check(got?.hello === 'magnificenttravel.com', 'the server introduces itself with the sender\'s domain, not the machine name', String(got?.hello));
  check(calls.brevo.length === 0 && calls.resend.length === 0, 'the backups were not used');
}

console.log('--- SMTP with STARTTLS (like port 587)');
reset();
env(smtpEnv(2587));
check((await sendMail(job())) === 'smtp', 'mail accepted by smtp on a STARTTLS port');
check(inbox.length === 1 && inbox[0].port === 2587, 'message arrived');

console.log('--- failures fall through to the backups');
reset();
smtpMode.failAuth = true;
env(smtpEnv(4465, { SMTP_SECURE: 'true', BREVO_API_KEY: 'bk', RESEND_API_KEY: 'rk' }));
check((await sendMail(job())) === 'brevo', 'a refused login goes to Brevo');
check(inbox.length === 0 && calls.brevo.length === 1, 'nothing in the SMTP inbox, one Brevo request');
check(calls.brevo[0]?.to?.length === 4 && calls.brevo[0]?.sender?.email === USER, 'the same four recipients and sender reach Brevo');
check(calls.brevo[0]?.htmlContent?.includes('<b>part</b>') && calls.brevo[0]?.textContent?.includes('Ayşe'), 'Brevo gets the HTML and the plain text');

reset();
smtpMode.failAuth = true;
backupStatus.brevo = 500;
env(smtpEnv(4465, { SMTP_SECURE: 'true', BREVO_API_KEY: 'bk', RESEND_API_KEY: 'rk' }));
check((await sendMail(job())) === 'resend', 'SMTP and Brevo failing go to Resend');
check(calls.resend[0]?.html?.includes('<b>part</b>') && calls.resend[0]?.text?.includes('Ayşe'), 'Resend gets the HTML and the plain text');

reset();
smtpMode.failAuth = true;
env(smtpEnv(4465, { SMTP_SECURE: 'true' }));
check((await sendMail(job())) === null, 'a refused login with no backup answers null (the form then offers WhatsApp)');

reset();
env(smtpEnv(2555, { BREVO_API_KEY: 'bk' })); // nothing listens on this port
check((await sendMail(job())) === 'brevo', 'a refused connection goes to Brevo');

reset();
env(smtpEnv(2599, { SMTP_SECURE: 'false', BREVO_API_KEY: 'bk' })); // a server that never answers
{
  const started = Date.now();
  const result = await sendMail(job());
  const seconds = (Date.now() - started) / 1000;
  check(result === 'brevo', 'a server that never answers goes to Brevo');
  check(seconds < 14, 'and gives up in time', `${seconds.toFixed(1)} s`);
}

console.log('--- partly refused recipients');
reset();
smtpMode.refuse = ['kenan.ungur@gmail.com'];
env(smtpEnv(4465, { SMTP_SECURE: 'true' }));
check((await sendMail(job())) === 'smtp', 'one refused recipient: the mail still counts as sent');
check(inbox[0]?.envelopeTo.length === 3, 'the other three received it', JSON.stringify(inbox[0]?.envelopeTo));

console.log('--- header injection');
reset();
env(smtpEnv(4465, { SMTP_SECURE: 'true' }));
await sendMail(job({ replyTo: 'visitor@example.com\r\nBcc: evil@example.com', subject: 'Request\r\nBcc: evil2@example.com' }));
check(!inbox.some((m) => m.envelopeTo.some((a) => a.includes('evil'))), 'no extra recipient can be injected through Reply-To or the subject');
check(!inbox.some((m) => m.mail.headers.has('bcc')), 'no Bcc header appears');

console.log('--- with SMTP and the backups all configured and healthy, only SMTP is used');
reset();
env(smtpEnv(4465, { SMTP_SECURE: 'true', BREVO_API_KEY: 'bk', RESEND_API_KEY: 'rk' }));
check((await sendMail(job())) === 'smtp' && calls.brevo.length === 0 && calls.resend.length === 0, 'one mail, no duplicate through a backup');

// --------------------------------------------------------------------------------------------- the real form route
if (withRoute) {
  console.log('--- the real form: /api/inquiry/ on a local site');
  reset();
  env({}); // nothing left over from the transport checks (a stray SMTP_SECURE broke the STARTTLS port here once)
  const port = 3115;
  // A site left over from an earlier run would answer instead of the new one, with its old settings: refuse to start then.
  const inUse = await new Promise((resolve) => net.connect(port, '127.0.0.1').once('connect', function () { this.destroy(); resolve(true); }).once('error', () => resolve(false)));
  if (inUse) {
    check(false, `port ${port} is already in use; stop that site first`);
    process.exit(1);
  }
  // Started without a shell, so that its process can be ended; `taskkill /T` also ends what it started.
  const site = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--turbopack', '-p', String(port)], {
    env: {
      ...process.env,
      ...smtpEnv(2587),
      INQUIRY_TO_EMAIL: TEAM.join(','),
      INQUIRY_FROM_EMAIL: USER,
      TURNSTILE_SECRET_KEY: '',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      BREVO_API_KEY: 'bk',
      MAIL_BREVO_URL: 'http://127.0.0.1:2601',
    },
    stdio: 'ignore',
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(`${base}/api/health/`)).status > 0) {break;}
      } catch {
        await sleep(1000);
      }
    }
    const health = await (await fetch(`${base}/api/health/`)).json();
    check(health.config.mail === 'smtp' && health.config.mailRecipients === true, 'health check reports mail: smtp', JSON.stringify(health.config));
    const post = (body) => fetch(`${base}/api/inquiry/`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
    const form = { type: 'quote', tour: '7 Days Turkey', name: 'Ayşe Yılmaz', email: 'visitor@example.com', phoneCode: '+90', phone: '5324935198', nationality: 'Türkiye', adults: '2', children: '0', startDate: '2026-10-31', endDate: '2026-11-08', style: 'Private tour', hotelClass: '4 stars', budget: '1000', currency: 'EUR', message: '日本語 Türkçe\nSecond line <script>alert(1)</script> & "quotes"', source: '/en/destinations/turkey-tours/' };
    const answer = await post(form);
    check(answer.ok === true && answer.delivered === true, 'a filled form is answered delivered:true', JSON.stringify(answer));
    const got = inbox.find((m) => m.mail.subject === 'Magnificent Travel - Request a Quote');
    check(Boolean(got) && inbox.length === 1, 'one mail arrived through SMTP', `smtp inbox ${inbox.length}, brevo ${calls.brevo.length}`);
    check(got?.envelopeTo.length === 4, 'to the four recipients', JSON.stringify(got?.envelopeTo));
    check(got?.mail.text?.includes('Tour: 7 Days Turkey') && got.mail.text.includes('Name: Ayşe Yılmaz') && got.mail.text.includes('日本語 Türkçe'), 'the form fields are in the text', got?.mail.text);
    check(got?.mail.replyTo?.value[0].address === 'visitor@example.com', 'Reply-To is the visitor');
    const html = got?.mail.html || '';
    if (process.env.MAIL_HTML_OUT) {fs.writeFileSync(process.env.MAIL_HTML_OUT, html);}
    check(html.includes('<strong style="font-size:16px;">7 Days Turkey</strong>') && html.includes('Ayşe Yılmaz') && html.includes('日本語 Türkçe'), 'the HTML part has the tour, the name and the non-Latin text');
    check(html.includes('href="mailto:visitor@example.com"') && html.includes('href="tel:+905324935198"') && html.includes('href="https://wa.me/905324935198"'), 'mail, phone and WhatsApp are links');
    check(html.includes('href="https://www.magnificenttravel.com/en/destinations/turkey-tours/"'), 'the page the form was sent from is a link');
    check(!html.includes('<script') && html.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && html.includes('&amp; &quot;quotes&quot;'), 'what the visitor typed is escaped (no script, no raw markup)');
    check(html.includes('Second line') && html.includes('<br>'), 'line breaks in the notes are kept');
    check(html.includes('1000 EUR') && html.includes('Private tour') && html.includes('4 stars'), 'budget with currency, travel style and hotel category are there');
    check(Boolean(got?.mail.text?.includes('Budget per Person: 1000')) && got.mail.text.includes('Second line <script>'), 'the plain-text version keeps every field');
    check(calls.brevo.length === 0, 'Brevo was not used');
    const honey = await post({ ...form, website: 'http://spam.example' });
    check(honey.delivered === true && inbox.length === 1, 'the hidden trap field sends nothing');
    smtpMode.failAuth = true;
    const fallback = await post(form);
    check(fallback.delivered === true && calls.brevo.length === 1, 'a refused SMTP login: the form still goes out through Brevo');
    calls.brevo.length = 0;
    backupStatus.brevo = 500;
    const lost = await post(form);
    check(lost.ok === true && lost.delivered === false, 'everything failing answers delivered:false (WhatsApp handoff), not an error');
    check((await post({ ...form, email: 'not-an-email' })).ok === false, 'an invalid visitor address is refused');
  } finally {
    if (process.platform === 'win32') {spawn('taskkill', ['/pid', String(site.pid), '/T', '/F'], { stdio: 'ignore' });}
    else {site.kill('SIGKILL');}
  }
}

for (const server of [ssl, starttls, brevo, resend, hang]) {server.close?.();}
console.log(failed ? `\n${failed} check(s) FAILED` : '\nall checks passed');
process.exit(failed ? 1 : 0);
