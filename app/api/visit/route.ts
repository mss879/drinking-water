import { isbot } from "isbot";
import { after, type NextRequest } from "next/server";
import { classifyChannel } from "@/lib/analytics/channel";
import { readGeo } from "@/lib/analytics/geo";
import { readUserAgent } from "@/lib/analytics/ua";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/supabase/types";

/**
 * Receives the website tracker's beacons (components/analytics/tracker.tsx), checks them, adds what only the
 * server knows (traffic channel, device, location) and hands them to public.analytics_ingest(). It always answers
 * 204 straight away; the database write happens after the response. No IP address or user agent is stored.
 */

const MAX_BODY = 8192;
const MAX_ITEMS = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENTS = new Set([
  "whatsapp_click",
  "phone_click",
  "email_click",
  "outbound_click",
  "cta_click",
  "file_download",
  "product_view",
  "rental_quote_calculated",
  "find_solution_completed",
  "page_not_found",
]);
const VITALS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
const RATINGS = new Set(["good", "needs-improvement", "poor"]);
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Best effort only (per server instance): enough to stop one browser flooding the table. */
const hits = new Map<string, { count: number; reset: number }>();
function limited(key: string) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(key, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 120;
}

type Obj = Record<string, unknown>;
const isObj = (value: unknown): value is Obj => typeof value === "object" && value !== null && !Array.isArray(value);
const str = (value: unknown, max: number) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);
const path = (value: unknown) => {
  const clean = str(value, 300);
  return clean?.startsWith("/") ? clean.split(/[?#]/)[0] : null;
};
const int = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(Math.round(value), min), max) : null;

function cleanProps(value: unknown) {
  const props: Record<string, string | number | boolean> = {};
  if (!isObj(value)) return props;
  for (const [key, raw] of Object.entries(value).slice(0, 10)) {
    if (!/^[a-z_]{1,40}$/.test(key)) continue;
    if (typeof raw === "string") props[key] = raw.slice(0, 200);
    else if (typeof raw === "number" && Number.isFinite(raw)) props[key] = raw;
    else if (typeof raw === "boolean") props[key] = raw;
  }
  return props;
}

function cleanItem(item: unknown): Obj | null {
  if (!isObj(item)) return null;
  switch (item.type) {
    case "pageview": {
      const id = typeof item.id === "string" && UUID.test(item.id) ? item.id : null;
      const at = path(item.path);
      return id && at ? { type: "pageview", id, path: at, title: str(item.title, 200) } : null;
    }
    case "engagement": {
      const id = typeof item.id === "string" && UUID.test(item.id) ? item.id : null;
      return id
        ? { type: "engagement", id, engaged_ms: int(item.engaged_ms, 0, 21_600_000) ?? 0, scroll_depth: int(item.scroll_depth, 0, 100) ?? 0 }
        : null;
    }
    case "event": {
      const name = typeof item.name === "string" && EVENTS.has(item.name) ? item.name : null;
      return name ? { type: "event", name, path: path(item.path), props: cleanProps(item.props) } : null;
    }
    case "vital": {
      const name = typeof item.name === "string" && VITALS.has(item.name) ? item.name : null;
      const value = typeof item.value === "number" && Number.isFinite(item.value) && item.value >= 0 ? item.value : null;
      const rating = typeof item.rating === "string" && RATINGS.has(item.rating) ? item.rating : null;
      return name && value !== null ? { type: "vital", name, value, rating, path: path(item.path) } : null;
    }
    default:
      return null;
  }
}

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  // Same-site beacons only.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response(null, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && hostOf(origin) !== request.nextUrl.hostname) return new Response(null, { status: 403 });

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || isbot(ua)) return done();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (limited(ip)) return new Response(null, { status: 429 });

  const text = await request.text();
  if (text.length > MAX_BODY) return new Response(null, { status: 413 });

  const supabase = createServiceClient();
  if (!supabase) return done();

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!isObj(body) || !isObj(body.visitor) || !isObj(body.session) || !Array.isArray(body.items)) {
    return new Response(null, { status: 400 });
  }

  const visitorId = typeof body.visitor.id === "string" && UUID.test(body.visitor.id) ? body.visitor.id : null;
  const sessionId = typeof body.session.id === "string" && UUID.test(body.session.id) ? body.session.id : null;
  if (!visitorId || !sessionId) return new Response(null, { status: 400 });

  const items = body.items.slice(0, MAX_ITEMS).map(cleanItem).filter((item): item is Obj => item !== null);
  if (items.length === 0) return done();

  const landing = isObj(body.session.landing) ? body.session.landing : {};
  const context = isObj(body.context) ? body.context : {};
  const utm = isObj(landing.utm) ? landing.utm : {};
  const referrer = str(landing.referrer, 500);
  const referrerHost = hostOf(referrer);
  const timeZone = str(context.timeZone, 64);
  const geo = readGeo(request.headers, timeZone);
  const agent = readUserAgent(ua, {
    mobile: request.headers.get("sec-ch-ua-mobile"),
    platform: request.headers.get("sec-ch-ua-platform"),
    touch: context.touch === true,
  });

  const session: Record<string, Json> = {
    id: sessionId,
    visitor_id: visitorId,
    is_new_visitor: body.visitor.isNew === true,
    referrer,
    referrer_host: referrerHost,
    channel: classifyChannel({
      referrerHost,
      utmSource: str(utm.utm_source, 100) ?? undefined,
      utmMedium: str(utm.utm_medium, 100) ?? undefined,
      paid: landing.paid === true,
    }),
    country: geo.country,
    region: geo.region,
    city: geo.city,
    geo_source: geo.source,
    device: agent.device,
    browser: agent.browser,
    os: agent.os,
    language: str(context.language, 35),
    screen: typeof context.screen === "string" && /^\d{2,5}x\d{2,5}$/.test(context.screen) ? context.screen : null,
    timezone: timeZone,
  };
  for (const key of UTM_KEYS) session[key] = str(utm[key], 150);

  after(async () => {
    const { error } = await supabase.rpc("analytics_ingest", { p: { session, items } as Json });
    if (error) console.error("[analytics] ingest failed", error.code, error.message);
  });
  return done();
}
