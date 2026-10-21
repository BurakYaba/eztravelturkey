'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics/track';

/** Sends one event when the page it sits on is opened, for example `tour_view` on a tour page. */
export function TrackView({ event, params }: { event: AnalyticsEvent; params: Record<string, string> }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, JSON.parse(key) as Record<string, string>);
  }, [event, key]);
  return null;
}
