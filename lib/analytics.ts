/**
 * Conversion tracking. Events are pushed to `window.dataLayer`, so they flow into
 * Google Tag Manager / GA4 as soon as NEXT_PUBLIC_GTM_ID is set (see components/layout/analytics.tsx).
 */
export type AnalyticsEvent =
  | "product_view"
  | "generate_lead"
  | "rental_quote_calculated"
  | "find_solution_completed";

export type LeadSource = "direct-purchase" | "rental" | "corporate-hydration" | "service";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer ??= [];
  window.dataLayer.push({ event, ...params });
}
