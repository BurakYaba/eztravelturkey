/**
 * Receives Content-Security-Policy violation reports from the browsers (see `src/lib/security-headers.ts`). Each report
 * becomes one short `[csp]` line in the Vercel logs, so what the full policy would block can be reviewed before it is
 * enforced. The body is capped, nothing is stored, and the answer is always 204.
 */
export async function POST(request: Request) {
  try {
    const text = (await request.text()).slice(0, 8000);
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const report = (parsed['csp-report'] ?? parsed) as Record<string, unknown>;
    const pick = (key: string) => String(report[key] ?? '').slice(0, 160);
    // eslint-disable-next-line no-console
    console.warn(
      '[csp]',
      JSON.stringify({
        directive: pick('violated-directive') || pick('effective-directive'),
        blocked: pick('blocked-uri'),
        page: pick('document-uri'),
      }),
    );
  } catch {
    // A malformed report is ignored.
  }
  return new Response(null, { status: 204 });
}
