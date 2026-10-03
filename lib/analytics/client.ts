"use client";

import { NO_TRACK_KEY, SESSION_KEY, SESSION_TIMEOUT_MS, TRACK_ENDPOINT, VISITOR_KEY } from "@/lib/analytics/config";

/**
 * Browser side of the first-party analytics. No cookies: a random visitor id and the current visit live in
 * localStorage (so a visit carries across tabs), and nothing personal is recorded. If storage is blocked the
 * page still counts, as a one-off visit.
 */

export type Landing = {
  path: string;
  referrer: string | null;
  utm: Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content", string>>;
  /** Ad click ids (gclid, fbclid, msclkid) only tell us the visit was paid. */
  paid: boolean;
};

export type Visit = { id: string; startedAt: number; lastSeen: number; landing: Landing; isNewVisitor: boolean };

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function storage() {
  try {
    const store = window.localStorage;
    store.getItem(VISITOR_KEY);
    return store;
  } catch {
    return null;
  }
}

function uuid() {
  return crypto.randomUUID();
}

/** False for admins' browsers, automated browsers and local development (unless NEXT_PUBLIC_ANALYTICS_DEV=1). */
export function trackingAllowed() {
  if (typeof window === "undefined") return false;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return false;
  if (window.location.pathname.startsWith("/admin")) return false;
  const local = /^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost|.+\.test)$/.test(window.location.hostname);
  if (local && process.env.NEXT_PUBLIC_ANALYTICS_DEV !== "1") return false;
  return storage()?.getItem(NO_TRACK_KEY) !== "1";
}

/** Where this visit came from: the first page, an outside referrer and any campaign tags. */
function readLanding(): Landing {
  const url = new URL(window.location.href);
  const utm: Landing["utm"] = {};
  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key);
    if (value) utm[key] = value.slice(0, 150);
  }
  let referrer: string | null = null;
  try {
    if (document.referrer) {
      const from = new URL(document.referrer);
      if (from.host !== window.location.host) referrer = `${from.origin}${from.pathname}`.slice(0, 500);
    }
  } catch {}
  const paid = ["gclid", "fbclid", "msclkid", "gbraid", "wbraid"].some((key) => url.searchParams.has(key));
  return { path: url.pathname, referrer, utm, paid };
}

let memoryVisit: Visit | null = null;
let memoryVisitor: string | null = null;

/** The visitor id; `isNew` is true the first time this browser is seen. */
export function getVisitor(): { id: string; isNew: boolean } {
  const store = storage();
  const saved = store?.getItem(VISITOR_KEY) ?? memoryVisitor;
  if (saved) return { id: saved, isNew: false };
  const id = uuid();
  memoryVisitor = id;
  store?.setItem(VISITOR_KEY, id);
  return { id, isNew: true };
}

/** The current visit, starting a new one after 30 minutes without activity. `fresh` tells the caller it just began. */
export function getVisit(): { visit: Visit; fresh: boolean } {
  const store = storage();
  const now = Date.now();
  let visit: Visit | null = memoryVisit;
  try {
    const raw = store?.getItem(SESSION_KEY);
    if (raw) visit = JSON.parse(raw) as Visit;
  } catch {}

  if (visit && typeof visit.id === "string" && now - visit.lastSeen < SESSION_TIMEOUT_MS) {
    visit.lastSeen = now;
    memoryVisit = visit;
    store?.setItem(SESSION_KEY, JSON.stringify(visit));
    return { visit, fresh: false };
  }

  const visitor = getVisitor();
  const next: Visit = { id: uuid(), startedAt: now, lastSeen: now, landing: readLanding(), isNewVisitor: visitor.isNew };
  memoryVisit = next;
  store?.setItem(SESSION_KEY, JSON.stringify(next));
  return { visit: next, fresh: true };
}

/** Attribution sent along with a form: who, from which visit, and how that visit arrived. */
export function readAttribution() {
  if (typeof window === "undefined") return null;
  const store = storage();
  let visit: Visit | null = memoryVisit;
  try {
    const raw = store?.getItem(SESSION_KEY);
    if (raw) visit = JSON.parse(raw) as Visit;
  } catch {}
  return {
    visitor_id: store?.getItem(VISITOR_KEY) ?? memoryVisitor ?? null,
    session_id: visit?.id ?? null,
    landing_path: visit?.landing.path ?? null,
    referrer: visit?.landing.referrer ?? null,
    utm: visit?.landing.utm ?? {},
    page_path: window.location.pathname,
  };
}

/** Sends a beacon to /api/visit. sendBeacon survives the page closing; fetch keepalive is the fallback. */
export function send(payload: unknown) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.(TRACK_ENDPOINT, body)) return;
  } catch {}
  void fetch(TRACK_ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}
