// Polite HTTP client for the migration scrape: one start per interval, a small concurrency limit, retries with
// backoff on 403/429/5xx and timeouts, and a longer cooldown after repeated blocks. Redirects are never followed:
// the status and Location are recorded so the redirect map can be built from what the old site really does.

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createFetcher({ intervalMs = 1000, concurrency = 2, retries = 4, timeoutMs = 30000 } = {}) {
  let lastStart = 0;
  let active = 0;
  let blockedInARow = 0;
  const waiting = [];

  async function acquire() {
    if (active >= concurrency) {
      await new Promise((resolve) => waiting.push(resolve));
    }
    active += 1;
    const wait = lastStart + intervalMs - Date.now();
    lastStart = Math.max(Date.now(), lastStart + intervalMs);
    if (wait > 0) {
      await sleep(wait);
    }
  }

  function release() {
    active -= 1;
    const next = waiting.shift();
    if (next) {
      next();
    }
  }

  async function attempt(url, accept) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT, accept, 'accept-language': 'en-US,en;q=0.8' },
      });
      const buffer = Buffer.from(await res.arrayBuffer());
      return {
        url,
        status: res.status,
        location: res.headers.get('location') ?? '',
        contentType: res.headers.get('content-type') ?? '',
        headers: Object.fromEntries(res.headers.entries()),
        buffer,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /** Fetches one URL. Never throws: failures come back as { status: 0, error }. */
  async function get(url, { accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } = {}) {
    let last = { url, status: 0, error: 'not attempted', buffer: Buffer.alloc(0), headers: {}, location: '' };
    for (let i = 0; i <= retries; i += 1) {
      await acquire();
      try {
        last = await attempt(url, accept);
      } catch (error) {
        last = { ...last, status: 0, error: String(error?.cause?.code ?? error?.name ?? error) };
      } finally {
        release();
      }
      const blocked = last.status === 403 || last.status === 429;
      const retryable = blocked || last.status === 0 || last.status >= 500;
      if (!retryable) {
        blockedInARow = 0;
        return last;
      }
      blockedInARow = blocked ? blockedInARow + 1 : blockedInARow;
      if (blockedInARow >= 3) {
        // Several blocks in a row: stop and wait before the next request instead of hammering the site.
        await sleep(60000);
        blockedInARow = 0;
      } else if (i < retries) {
        await sleep(2000 * 2 ** i + Math.floor(Math.random() * 500));
      }
    }
    return last;
  }

  return { get };
}

/** Decodes a response body. Uses the charset from the Content-Type header, then <meta charset>, then UTF-8. */
export function decodeBody(buffer, contentType = '') {
  const header = /charset=([\w-]+)/i.exec(contentType)?.[1];
  const head = buffer.subarray(0, 4096).toString('latin1');
  const meta = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1];
  const label = (header ?? meta ?? 'utf-8').toLowerCase();
  try {
    return { text: new TextDecoder(label).decode(buffer), charset: label };
  } catch {
    return { text: new TextDecoder('utf-8').decode(buffer), charset: 'utf-8' };
  }
}
