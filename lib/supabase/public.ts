import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/** Cache tag for the blog; admin saves of a post expire it. */
export const BLOG_TAG = "blog";
/** Cache tag for the website content the admin edits (products, parts, logos, photos, contact details). */
export const CMS_TAG = "cms";

/**
 * A cookie-less client for public reads (published blog posts, website content). It never touches cookies, so pages
 * that use it stay static; its requests are cached under the given tag for an hour and refreshed on demand when an
 * admin saves. Null when Supabase isn't set up.
 */
export function createPublicClient(tag: string = BLOG_TAG) {
  if (!isSupabaseConfigured()) return null;
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "force-cache", next: { tags: [tag], revalidate: 3600 } }),
    },
  });
}
