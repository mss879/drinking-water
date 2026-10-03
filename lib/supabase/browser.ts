"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** The admin's client in the browser (sign-in, image uploads, live inquiry updates). One per tab. */
export function createClient() {
  client ??= createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
  return client;
}
