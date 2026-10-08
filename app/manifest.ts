import type { MetadataRoute } from "next";
import { chromeSite } from "@/content/copy/chrome";
import { site } from "@/content/site";
import { getCopy } from "@/lib/cms/content";

/**
 * Lets phones save the site to the home screen with the LUSAKO mark and colours. The description is the website
 * description from Page text; the read is cached, so the manifest stays static.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { description } = await getCopy(chromeSite);
  return {
    name: `${site.name} | ${site.descriptor}`,
    short_name: site.name,
    description,
    start_url: "/",
    display: "browser",
    background_color: "#f6fafe",
    theme_color: "#f6fafe",
    lang: "en-LK",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
