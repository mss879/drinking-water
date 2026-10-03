import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type Admin = { id: string; email: string };

import { isMissingSchema } from "@/lib/supabase/errors";

export { isMissingSchema };

/**
 * The admin check every admin page, Server Action and download runs first (proxy.ts only does a quick cookie check).
 * It verifies the session token, then looks the user up in admin_users. Returns the admin and a Supabase client
 * acting as them. Memoised for the length of a request.
 */
export const requireAdmin = cache(async () => {
  if (!isSupabaseConfigured()) redirect("/admin/setup");

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/admin/login");

  const { data: row, error } = await supabase.from("admin_users").select("email").eq("user_id", userId).maybeSingle();
  if (error) {
    if (isMissingSchema(error)) redirect("/admin/setup?missing=tables");
    throw new Error(`Couldn't check admin access: ${error.message}`);
  }
  if (!row) redirect("/admin/no-access");

  const admin: Admin = { id: userId, email: row.email ?? String(data?.claims?.email ?? "") };
  return { admin, supabase };
});

/** Result shape every admin Server Action returns, so forms can show a message instead of crashing. */
export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/** Turns a Supabase error into a sentence an admin can act on. */
export function friendlyError(error: { code?: string; message: string } | null | undefined, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (isMissingSchema(error)) return "The database isn't set up yet. Run the migrations in supabase/migrations.";
  if (error.code === "23505") return "That already exists. Use a different value.";
  if (error.code === "23514" && error.message.includes("violates check constraint")) {
    return "One of the values isn't allowed. Check the fields and try again.";
  }
  // Our own triggers and functions raise readable messages with these codes.
  if (error.code === "23514" || error.code === "22023" || error.code === "P0002") return error.message;
  if (error.code === "42501") return "You don't have permission to do that.";
  return fallback;
}
