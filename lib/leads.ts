import "server-only";
import type { LeadSource } from "@/lib/analytics";
import { fieldValueLabel, leadFieldMap, type LeadFormType } from "@/content/forms";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/supabase/types";

export type Lead = {
  reference: string;
  form: string;
  source: LeadSource;
  destination: string;
  submittedAt: string;
  values: Record<string, string>;
};

/** Where the visitor came from, read from the tracker's storage when they sent the form. */
export type Attribution = {
  visitorId: string | null;
  sessionId: string | null;
  pagePath: string | null;
  landingPath: string | null;
  referrer: string | null;
  utm: Record<string, string>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UTM_KEYS = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]);

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

/** Reads the hidden attribution field defensively: anything malformed is simply dropped. */
export function parseAttribution(raw: FormDataEntryValue | null): Attribution {
  const empty: Attribution = { visitorId: null, sessionId: null, pagePath: null, landingPath: null, referrer: null, utm: {} };
  if (typeof raw !== "string" || !raw || raw.length > 4000) return empty;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const utm: Record<string, string> = {};
    if (data.utm && typeof data.utm === "object") {
      for (const [key, value] of Object.entries(data.utm as Record<string, unknown>)) {
        const clean = text(value, 150);
        if (UTM_KEYS.has(key) && clean) utm[key] = clean;
      }
    }
    const id = (value: unknown) => (typeof value === "string" && UUID.test(value) ? value : null);
    const path = (value: unknown) => {
      const clean = text(value, 300);
      return clean?.startsWith("/") ? clean : null;
    };
    const referrer = text(data.referrer, 500);
    return {
      visitorId: id(data.visitor_id),
      sessionId: id(data.session_id),
      pagePath: path(data.page_path),
      landingPath: path(data.landing_path),
      referrer: referrer && /^https?:\/\//.test(referrer) ? referrer : null,
      utm,
    };
  } catch {
    return empty;
  }
}

/** A new inquiry reference, e.g. LSK-4F9A2C. */
export function newReference() {
  return `LSK-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;
}

/**
 * Saves a form submission as an inquiry in Supabase. Returns the reference it was saved under (a new one is
 * drawn if the first is taken), or null when Supabase isn't set up or the insert failed.
 */
export async function saveInquiry(lead: Lead, type: LeadFormType, attribution: Attribution): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const map = leadFieldMap[type];
  const shared = new Set([map.name, map.company, map.message, ...map.location, "phone", "email"].filter(Boolean));
  const location = map.locationOf
    ? map.locationOf(lead.values)
    : map.location
        .map((name) => lead.values[name] && fieldValueLabel(type, name, lead.values[name]))
        .filter(Boolean)
        .join(", ");
  const details = Object.fromEntries(Object.entries(lead.values).filter(([name, value]) => value && !shared.has(name)));
  // Campaign tags plus the page the visit started on.
  const source = { ...attribution.utm, ...(attribution.landingPath ? { landing_path: attribution.landingPath } : {}) };

  let reference = lead.reference;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from("inquiries").insert({
      reference,
      form_type: type,
      name: lead.values[map.name] || "Unknown",
      email: lead.values.email || null,
      phone: lead.values.phone || null,
      company: (map.company && lead.values[map.company]) || null,
      location: location || null,
      message: (map.message && lead.values[map.message]) || null,
      details: details as Json,
      page_path: attribution.pagePath,
      referrer: attribution.referrer,
      utm: Object.keys(source).length ? source : null,
      visitor_id: attribution.visitorId,
      session_id: attribution.sessionId,
    });
    if (!error) return reference;
    if (error.code !== "23505") {
      console.error("[lead] couldn't save the inquiry", error.code, error.message);
      return null;
    }
    reference = newReference();
  }
  return null;
}

/** Records the conversion in the first-party analytics (server side, so ad blockers can't hide it). */
export async function recordLeadEvent(type: LeadFormType, attribution: Attribution) {
  const supabase = createServiceClient();
  if (!supabase || !attribution.visitorId || !attribution.sessionId) return;
  const { error } = await supabase.rpc("analytics_ingest", {
    p: {
      session: { id: attribution.sessionId, visitor_id: attribution.visitorId },
      items: [{ type: "event", name: "generate_lead", path: attribution.pagePath, props: { form_type: type } }],
    },
  });
  if (error) console.error("[lead] couldn't record the conversion", error.message);
}

/**
 * Hands a lead to the sales or service team. Set LEAD_WEBHOOK_URL to forward every lead
 * as JSON to a CRM, email service or automation tool (HubSpot, Zapier, Make and so on).
 * Without it, leads are written to the server log.
 */
export async function deliverLead(lead: Lead) {
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    console.info("[lead]", JSON.stringify(lead));
    return;
  }
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Lead webhook responded with ${response.status}`);
}

export function hasLeadWebhook() {
  return Boolean(process.env.LEAD_WEBHOOK_URL);
}

/** True when inquiries are saved to Supabase (URL, publishable and secret keys all set). */
export function hasInquiryStore() {
  return createServiceClient() !== null;
}
