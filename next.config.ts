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

const nextConfig: NextConfig = {
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
};

export default nextConfig;
