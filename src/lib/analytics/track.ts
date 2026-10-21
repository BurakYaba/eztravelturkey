/**
 * Events for Google Tag Manager (docs/project-plan.md P8.5). Everything goes through the `dataLayer`; the tags that send it to
 * Google Analytics are set up in the Tag Manager container (docs/gtm-ga4-kurulum.md). No names, emails or phone numbers are sent.
 *
 *   page_context  every page and every client-side navigation: lang, content_group, page_path
 *   tour_view     a tour page was opened: tour_title, tour_path, country
 *   form_submit   the quote or contact form was sent: form_type, tour_title
 *   whatsapp_click, phone_click, email_click   a link to WhatsApp, a phone number or an email address was used
 *   cta_click     the "Plan my trip" button was used
 */
export type AnalyticsEvent =
  'page_context' | 'tour_view' | 'form_submit' | 'whatsapp_click' | 'phone_click' | 'email_click' | 'cta_click';

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean | undefined> = {}): void {
  if (typeof window === 'undefined') {
    return;
  }
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
}
