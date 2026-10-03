"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect } from "react";
import { getVisit, getVisitor, send, trackingAllowed, type Landing } from "@/lib/analytics/client";

/**
 * First-party, cookie-free website analytics. Counts page views and visits, how long each page was actually on
 * screen and how far it was scrolled, clicks on phone / WhatsApp / email / outside links, the site's own events
 * (product views, the rental calculator, Find my solution, 404s) and Core Web Vitals, and sends them to /api/visit.
 * Form submissions are recorded by the server when they arrive. Skipped for admins, bots and local development.
 */

type Item = Record<string, unknown> & { type: string };
type Queued = { item: Item; sessionId: string; landing: Landing; isNewVisitor: boolean };
type PageView = {
  id: string;
  path: string;
  sessionId: string;
  landing: Landing;
  isNewVisitor: boolean;
  visibleMs: number;
  visibleSince: number | null;
  maxScroll: number;
  /** Events sent once per page view (e.g. the calculator, which fires on every change). */
  once: Set<string>;
};

let page: PageView | null = null;
let queue: Queued[] = [];
let timer: number | undefined;

function context() {
  return {
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touch: navigator.maxTouchPoints > 1,
  };
}

/** Sends what is queued, one beacon per visit. */
function flush() {
  window.clearTimeout(timer);
  if (queue.length === 0) return;
  const visitor = getVisitor();
  const groups = new Map<string, Queued[]>();
  for (const entry of queue) groups.set(entry.sessionId, [...(groups.get(entry.sessionId) ?? []), entry]);
  queue = [];
  for (const [sessionId, entries] of groups) {
    send({
      v: 1,
      visitor: { id: visitor.id, isNew: entries[0].isNewVisitor },
      session: { id: sessionId, landing: entries[0].landing },
      context: context(),
      items: entries.map((entry) => entry.item),
    });
  }
}

function enqueue(item: Item, soon = false) {
  const visit = page ?? (() => {
    const { visit: current } = getVisit();
    return { sessionId: current.id, landing: current.landing, isNewVisitor: current.isNewVisitor };
  })();
  queue.push({ item, sessionId: visit.sessionId, landing: visit.landing, isNewVisitor: visit.isNewVisitor });
  if (queue.length >= 15) flush();
  else if (soon) {
    window.clearTimeout(timer);
    timer = window.setTimeout(flush, 1500);
  }
}

function measureScroll() {
  if (!page) return;
  const doc = document.documentElement;
  const seen = ((window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1)) * 100;
  page.maxScroll = Math.max(page.maxScroll, Math.min(100, Math.round(seen)));
}

function visibleTime(view: PageView) {
  return view.visibleMs + (view.visibleSince ? Date.now() - view.visibleSince : 0);
}

/** Totals so far for the page on screen (the server keeps the largest it has seen). */
function queueEngagement() {
  if (!page) return;
  measureScroll();
  enqueue({ type: "engagement", id: page.id, engaged_ms: visibleTime(page), scroll_depth: page.maxScroll });
}

function startPageView(path: string) {
  if (page) queueEngagement();
  const { visit } = getVisit();
  page = {
    id: crypto.randomUUID(),
    path,
    sessionId: visit.id,
    landing: visit.landing,
    isNewVisitor: visit.isNewVisitor,
    visibleMs: 0,
    visibleSince: document.visibilityState === "visible" ? Date.now() : null,
    maxScroll: 0,
    once: new Set(),
  };
  enqueue({ type: "pageview", id: page.id, path, title: document.title });
  flush();
  window.setTimeout(measureScroll, 1000);
}

/** Events from the site's own code (lib/analytics.ts#track). The server records leads itself. */
const FORWARDED: Record<string, { once?: boolean; props: string[] }> = {
  product_view: { props: ["product_slug", "product_name"] },
  rental_quote_calculated: { once: true, props: ["province", "customer_type", "filtration", "units"] },
  find_solution_completed: { props: ["recommended_path", "filtration", "product"] },
  page_not_found: { props: ["path"] },
};

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  const rule = FORWARDED[name];
  if (!rule || !trackingAllowed()) return;
  if (rule.once && page) {
    if (page.once.has(name)) return;
    page.once.add(name);
  }
  const props = Object.fromEntries(rule.props.filter((key) => params[key] !== undefined).map((key) => [key, params[key]]));
  enqueue({ type: "event", name, path: window.location.pathname, props }, true);
}

/** Phone, WhatsApp, email, outside links and downloads, wherever they are on the page. */
function onClick(event: MouseEvent) {
  const target = event.target as Element | null;
  const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
  const tagged = target?.closest?.("[data-track]") as HTMLElement | null;
  const where = window.location.pathname;

  if (tagged?.dataset.track === "cta_click") {
    enqueue({ type: "event", name: "cta_click", path: where, props: { label: (tagged.dataset.trackLabel ?? tagged.textContent ?? "").trim().slice(0, 80) } }, true);
  }
  if (!link) return;
  const href = link.getAttribute("href") ?? "";
  const label = (link.getAttribute("aria-label") ?? link.textContent ?? "").trim().slice(0, 80);

  if (href.startsWith("tel:")) return enqueue({ type: "event", name: "phone_click", path: where, props: { label } }, true);
  if (href.startsWith("mailto:")) return enqueue({ type: "event", name: "email_click", path: where, props: { label } }, true);
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return;
  }
  if (/(^|\.)(wa\.me|whatsapp\.com)$/.test(url.hostname)) {
    return enqueue({ type: "event", name: "whatsapp_click", path: where, props: { label } }, true);
  }
  if (/\.(pdf|docx?|xlsx?|pptx?|zip)$/i.test(url.pathname)) {
    return enqueue({ type: "event", name: "file_download", path: where, props: { file: url.pathname.split("/").pop() ?? "" } }, true);
  }
  if (url.host !== window.location.host && /^https?:$/.test(url.protocol)) {
    enqueue({ type: "event", name: "outbound_click", path: where, props: { host: url.hostname } }, true);
  }
}

// Core Web Vitals from real visitors. Module level, so the callback never changes; each reading (by its id) is sent
// once even if the listener is attached twice.
const reportedVitals = new Set<string>();
function reportVital(metric: { id: string; name: string; value: number; rating?: string }) {
  if (!["LCP", "INP", "CLS", "FCP", "TTFB"].includes(metric.name) || !trackingAllowed()) return;
  const key = `${metric.id}:${metric.value}`;
  if (reportedVitals.has(key)) return;
  reportedVitals.add(key);
  enqueue({ type: "vital", name: metric.name, value: metric.value, rating: metric.rating, path: window.location.pathname }, true);
}

declare global {
  interface Window {
    __lusakoTrack?: typeof trackEvent;
  }
}

export function Tracker() {
  const pathname = usePathname();
  useReportWebVitals(reportVital);

  // One page view per route; development's double effects and repeat renders of the same page are ignored.
  useEffect(() => {
    if (!trackingAllowed() || page?.path === pathname) return;
    startPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!trackingAllowed()) return;
    window.__lusakoTrack = trackEvent;
    // Events from components that mounted before the tracker (e.g. a product view on a page's first load).
    const queued = window.__lusakoQueue ?? [];
    window.__lusakoQueue = undefined;
    queued.forEach(([name, params]) => trackEvent(name, params));

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        measureScroll();
        ticking = false;
      });
    };
    const onVisibility = () => {
      if (!page) return;
      if (document.visibilityState === "hidden") {
        page.visibleMs = visibleTime(page);
        page.visibleSince = null;
        queueEngagement();
        flush();
      } else {
        page.visibleSince = Date.now();
        getVisit();
      }
    };
    const onPageHide = () => {
      queueEngagement();
      flush();
    };
    // Back/forward cache: the page comes back without reloading, which counts as a new view.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) startPageView(window.location.pathname);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("click", onClick, { capture: true });
      if (window.__lusakoTrack === trackEvent) delete window.__lusakoTrack;
    };
  }, []);

  return null;
}
