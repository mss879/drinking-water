import { supabaseUrl } from "@/lib/supabase/env";

export const BLOG_BUCKET = "blog-images";

/** Public URL prefix of the blog's storage bucket. */
export const blogImagePrefix = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BLOG_BUCKET}/` : null;

/** Article and cover images may only come from the blog's own bucket. */
export function isBlogImage(src: unknown): src is string {
  return typeof src === "string" && blogImagePrefix !== null && src.startsWith(blogImagePrefix) && !src.includes("..");
}
