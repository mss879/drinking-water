/**
 * Supabase settings. The site runs without them: forms fall back to the lead webhook, the blog shows its empty
 * state, the tracker stays quiet and /admin explains how to connect. NEXT_PUBLIC_ values are inlined at build time.
 * The legacy anon / service_role keys are accepted too.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}
