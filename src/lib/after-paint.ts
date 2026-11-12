/**
 * Runs `run` once the page has loaded and the largest paint has settled: `delayMs` after the last largest-contentful-paint candidate
 * (the headline text, then the hero picture, each pushes the call back), and at the latest `latestMs` after the page has loaded
 * whatever the paint events do. Without paint events (Safari) the load event alone decides. Returns a function that cancels it.
 *
 * Why: PageSpeed Insights models a slow phone and counts every request that starts before the largest paint as part of the wait for it.
 * Work that does not decide what the visitor sees first (the heading font, Tag Manager) starts here instead of at hydration.
 */
export function afterLargestPaint(run: () => void, delayMs = 2000, latestMs = 8000): () => void {
  let done = false;
  let loaded = document.readyState === 'complete';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latest: ReturnType<typeof setTimeout> | undefined;
  let observer: PerformanceObserver | undefined;

  const stop = () => {
    done = true;
    observer?.disconnect();
    window.removeEventListener('load', onLoad);
    clearTimeout(timer);
    clearTimeout(latest);
  };
  const fire = () => {
    if (done) {
      return;
    }
    stop();
    run();
  };
  const whenIdle = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fire, { timeout: 4000 });
    } else {
      fire();
    }
  };
  const arm = () => {
    if (!loaded || done) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(whenIdle, delayMs);
  };
  function onLoad() {
    loaded = true;
    arm();
    latest = setTimeout(fire, latestMs);
  }

  try {
    observer = new PerformanceObserver(arm);
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // No such entries: the load event alone decides.
  }
  if (loaded) {
    onLoad();
  } else {
    window.addEventListener('load', onLoad, { once: true });
  }
  return stop;
}
