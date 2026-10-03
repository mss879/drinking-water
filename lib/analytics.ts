/**
 * Conversion tracking. Events are pushed to `window.dataLayer`, so they flow into
 * Google Tag Manager / GA4 as soon as NEXT_PUBLIC_GTM_ID is set (see components/layout/analytics.tsx),
 * and to the site's own analytics (components/analytics/tracker.tsx), which the admin reports on.
 */
export type AnalyticsEvent =
  | "product_view"
  | "generate_lead"
  | "rental_quote_calculated"
  | "find_solution_completed"
  | "page_not_found";

export type LeadSource = "direct-purchase" | "rental" | "corporate-hydration" | "service";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    /** Events sent before the site's tracker has started (a page's first load); it picks them up when it starts. */
    __lusakoQueue?: [AnalyticsEvent, Params][];
  }
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer ??= [];
  window.dataLayer.push({ event, ...params });
  if (window.__lusakoTrack) window.__lusakoTrack(event, params);
  else if ((window.__lusakoQueue ??= []).length < 20) window.__lusakoQueue.push([event, params]);
}
