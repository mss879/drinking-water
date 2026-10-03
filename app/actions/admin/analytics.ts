"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";

export type Live = { visitors: number; pages: { path: string; visitors: number }[] };

/** Who is on the website right now (active in the last five minutes). */
export async function getLiveVisitors(): Promise<ActionResult<Live>> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("analytics_live");
  if (error) return { ok: false, error: friendlyError(error) };
  const live = (data ?? { visitors: 0, pages: [] }) as Live;
  return { ok: true, data: { visitors: Number(live.visitors) || 0, pages: Array.isArray(live.pages) ? live.pages : [] } };
}

/** Deletes analytics older than the given number of months (keeps the database small). */
export async function purgeAnalytics(months: number): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (![6, 12, 13, 24].includes(months)) return { ok: false, error: "Choose how much history to keep." };
  const before = new Date();
  before.setMonth(before.getMonth() - months);
  const { data, error } = await supabase.rpc("analytics_purge", { p_before: before.toISOString() });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/admin/analytics");
  return { ok: true, message: `Removed ${data ?? 0} old ${data === 1 ? "visit" : "visits"}.` };
}
