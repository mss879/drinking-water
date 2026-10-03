import type { Metadata } from "next";
import { site } from "@/content/site";

export const ogImage = { url: "/og", width: 1200, height: 630, alt: "LUSAKO: Better Water. Better Way." };

export type OgImage = { url: string; width: number; height: number; alt: string };

/** The Organization's id in structured data, so services, products and articles can point at one LUSAKO. */
export const organizationId = `${new URL("/", site.url).toString()}#organization`;

/** A pointer to the Organization for other structured data, with the name in case a reader doesn't follow ids. */
export const organizationRef = {
  "@type": "Organization",
  "@id": organizationId,
  name: site.name,
  url: site.url,
  logo: new URL("/brand/lusako-logo.png", site.url).toString(),
};

/** The WebSite's id in structured data. */
export const websiteId = `${new URL("/", site.url).toString()}#website`;

/**
 * A deploy preview or branch deploy (Netlify's CONTEXT, Vercel's VERCEL_ENV) or a copy marked NEXT_PUBLIC_NOINDEX=1:
 * search engines are asked to stay away so a test copy never competes with drinkingwater.lk.
 */
export const isPreviewDeploy =
  (Boolean(process.env.CONTEXT) && process.env.CONTEXT !== "production") ||
  (Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production") ||
  process.env.NEXT_PUBLIC_NOINDEX === "1";

/** Search results cut titles at about 60 characters; past that the " | LUSAKO" suffix is the first thing to go. */
const TITLE_LIMIT = 60;

/**
 * Per-page metadata with canonical URL and social cards. Next merges metadata shallowly,
 * so every page passes its own complete openGraph object through here.
 */
export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
  image = ogImage,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
  image?: OgImage;
  type?: "website" | "article";
}): Metadata {
  const suffixed = `${title} | ${site.name}`;
  const standalone = absolute || suffixed.length > TITLE_LIMIT;
  const fullTitle = standalone ? title : suffixed;
  return {
    title: standalone ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      locale: "en_LK",
      url: path,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}
