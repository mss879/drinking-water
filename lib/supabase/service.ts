import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * The server's own client, with the secret key: it bypasses row level security, so it only does the website's
 * writes (form inquiries, analytics, chats) and never reads data back out for a visitor beyond their own chat. Null
 * when Supabase isn't set up.
 *
 * With `cacheTag`, its reads are cached like the public client's (for an hour, refreshed when the admin saves), for
 * data only the server may see: the hidden prices and the chat assistant's settings. The cache stays on the server.
 */
export function createServiceClient({ cacheTag }: { cacheTag?: string } = {}) {
  if (!isSupabaseConfigured() || !secretKey) return null;
  return createClient<Database>(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(cacheTag && {
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "force-cache", next: { tags: [cacheTag], revalidate: 3600 } }),
      },
    }),
  });
}
