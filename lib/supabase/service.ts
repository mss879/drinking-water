import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * The server's own client, with the secret key: it bypasses row level security, so it only does the website's
 * writes (form inquiries, analytics) and never reads data back out for a visitor. Null when Supabase isn't set up.
 */
export function createServiceClient() {
  if (!isSupabaseConfigured() || !secretKey) return null;
  return createClient<Database>(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
