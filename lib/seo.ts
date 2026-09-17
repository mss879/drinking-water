import type { Metadata } from "next";
import { site } from "@/content/site";

export const ogImage = { url: "/og", width: 1200, height: 630, alt: "LUSAKO: Better Water. Better Way." };

/**
 * Per-page metadata with canonical URL and social cards. Next merges metadata shallowly,
 * so every page passes its own complete openGraph object through here.
 */
export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
}: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
}): Metadata {
  const fullTitle = absolute ? title : `${title} | ${site.name}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_LK",
      url: path,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [ogImage.url] },
  };
}
