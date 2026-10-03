import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { isPreviewDeploy } from "@/lib/seo";

/**
 * Production allows everything public and keeps crawlers out of the admin and the API. Deploy previews and branch
 * deploys ask crawlers to stay away entirely (`isPreviewDeploy`).
 */
export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeploy) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
    host: new URL(site.url).host,
  };
}
