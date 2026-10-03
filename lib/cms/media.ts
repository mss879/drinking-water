import { supabaseUrl } from "@/lib/supabase/env";

/** The public storage bucket for images uploaded in the admin's Website section. */
export const SITE_MEDIA_BUCKET = "site-media";

/** Public URL prefix of that bucket. */
export const siteMediaPrefix = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${SITE_MEDIA_BUCKET}/` : null;

/** Folders inside the bucket, one per kind of image. */
export type MediaFolder = "products" | "parts" | "logos" | "photos";

/**
 * Images the website may show from the admin: anything uploaded to the site-media bucket, or one of the website's
 * own files under /images or /brand (the built-in product photos, for example). Never an outside address.
 */
export function isSiteImage(src: unknown): src is string {
  if (typeof src !== "string" || src.length > 500 || src.includes("..")) return false;
  if (siteMediaPrefix && src.startsWith(siteMediaPrefix)) return true;
  return /^\/(images|brand)\/[\w./-]+\.(webp|png|jpe?g|avif|svg)$/.test(src);
}

/** The storage path of an uploaded image ("products/<id>/<file>.webp"), or null for anything else. */
export function siteMediaPath(src: string) {
  return siteMediaPrefix && src.startsWith(siteMediaPrefix) ? src.slice(siteMediaPrefix.length) : null;
}
