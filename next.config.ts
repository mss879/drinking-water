import type { NextConfig } from "next";

/**
 * Blog images and the images uploaded in the admin's Website section are served from the Supabase project's public
 * storage buckets. Only that exact host and those buckets are allowed through the image optimiser (never a wildcard
 * *.supabase.co, which would let anyone use it). The host comes from NEXT_PUBLIC_SUPABASE_URL at build time.
 */
function supabaseHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

const host = supabaseHost();
const buckets = ["blog-images", "site-media"];
const isDev = process.env.NODE_ENV === "development";
const gtm = Boolean(process.env.NEXT_PUBLIC_GTM_ID);

/**
 * Content Security Policy: the website only loads its own files, plus the Supabase project (uploaded images, the
 * admin's sign-in, data and live updates) and, when NEXT_PUBLIC_GTM_ID is set, Google Tag Manager and Analytics.
 * Inline scripts stay allowed: Next.js inlines the page data, and nonces would make every page render per request
 * instead of being served from the CDN. Nothing may frame the site, and forms only post back to it.
 */
function contentSecurityPolicy() {
  const supabase = host ? [host.origin, `${host.protocol === "https:" ? "wss" : "ws"}://${host.host}`] : [];
  const google = gtm
    ? {
        script: ["https://www.googletagmanager.com", "https://*.googletagmanager.com"],
        connect: ["https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com"],
        img: ["https://*.google-analytics.com", "https://*.googletagmanager.com"],
        frame: ["https://www.googletagmanager.com"],
      }
    : { script: [], connect: [], img: [], frame: [] };

  const directives: Record<string, (string | false)[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", isDev && "'unsafe-eval'", ...google.script],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", host?.origin ?? false, ...google.img],
    "media-src": ["'self'", "blob:", host?.origin ?? false],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...supabase, ...google.connect],
    "frame-src": ["'self'", ...google.frame],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => [name, ...values.filter(Boolean)].join(" "));
  if (!isDev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  // HTTPS only for a year. includeSubDomains/preload are left out until every drinkingwater.lk subdomain is on HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

/** Films, photos and icons in /public keep their names when they change, so they're cached for a week, not forever. */
const mediaCache = { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: host
      ? buckets.map((bucket) => ({
          protocol: host.protocol.replace(":", "") as "http" | "https",
          hostname: host.hostname,
          port: host.port,
          pathname: `/storage/v1/object/public/${bucket}/**`,
        }))
      : [],
    // A local Supabase (`supabase start`) serves its storage from 127.0.0.1, which the optimiser refuses by default.
    dangerouslyAllowLocalIP: host !== null && ["127.0.0.1", "localhost"].includes(host.hostname),
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...["/video/:path*", "/images/:path*", "/brand/:path*", "/icons/:path*"].map((source) => ({ source, headers: [mediaCache] })),
    ];
  },
};

export default nextConfig;
