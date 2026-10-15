import type { NextRequest } from "next/server";
import { site } from "@/content/site";

/** Checks shared by the endpoints the site's own pages call (app/api/chat, app/api/visit). */

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * The site's own host names: the one this request came to (as the host or its proxy reports it) and the live site's.
 * `request.nextUrl` alone isn't enough: behind a proxy (`next start`, Netlify) it can name the server, not the domain.
 */
function ownHosts(request: NextRequest) {
  const hosts = new Set([request.nextUrl.hostname]);
  for (const header of ["host", "x-forwarded-host"]) {
    const value = request.headers.get(header)?.split(",")[0]?.trim().split(":")[0]?.toLowerCase();
    if (value) hosts.add(value);
  }
  const live = hostOf(site.url);
  if (live) hosts.add(live).add(live.startsWith("www.") ? live.slice(4) : `www.${live}`);
  return hosts;
}

/** Only this website's own pages may call (browsers always say where a request comes from). */
export function fromThisSite(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  const origin = request.headers.get("origin");
  if (origin && !ownHosts(request).has(hostOf(origin) ?? "")) return false;
  return true;
}

/** The visitor's address as the host saw it: Netlify's own header first (a visitor can't set it), then the usual proxy headers. */
export function clientAddress(request: NextRequest) {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}
