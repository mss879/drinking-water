"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { adminCatalogue } from "@/lib/admin/catalogue";
import { inquiryInterest } from "@/lib/admin/inquiries";
import type { InquiryStatus } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES: InquiryStatus[] = ["new", "in_progress", "resolved", "spam"];

function cleanIds(ids: unknown) {
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && UUID.test(id)).slice(0, 200) : [];
}

function refresh() {
  // The unread badge lives in the admin layout.
  revalidatePath("/admin", "layout");
}

export async function markInquiriesRead(ids: string[], read = true): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const clean = cleanIds(ids);
  if (!clean.length) return { ok: false, error: "Nothing selected." };
  const { error } = await supabase
    .from("inquiries")
    .update({ read_at: read ? new Date().toISOString() : null })
    .in("id", clean);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true };
}

export async function setInquiryStatus(ids: string[], status: InquiryStatus): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const clean = cleanIds(ids);
  if (!clean.length) return { ok: false, error: "Nothing selected." };
  if (!STATUSES.includes(status)) return { ok: false, error: "Unknown status." };
  const { error } = await supabase.from("inquiries").update({ status }).in("id", clean);
  if (error) return { ok: false, error: friendlyError(error) };
  // Changing the status means someone has looked at it.
  await supabase.from("inquiries").update({ read_at: new Date().toISOString() }).in("id", clean).is("read_at", null);
  refresh();
  return { ok: true };
}

export async function saveInquiryNotes(id: string, notes: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown inquiry." };
  const { error } = await supabase
    .from("inquiries")
    .update({ admin_notes: notes.trim().slice(0, 5000) || null })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Notes saved." };
}

/** Puts inquiries on the CRM board, in New Leads. Already-converted ones are left as they are. */
export async function moveInquiriesToCrm(ids: string[]): Promise<ActionResult<{ leadIds: string[] }>> {
  const { supabase } = await requireAdmin();
  const clean = cleanIds(ids);
  if (!clean.length) return { ok: false, error: "Nothing selected." };

  const { data: rows, error: readError } = await supabase.from("inquiries").select("id, form_type, details").in("id", clean);
  if (readError) return { ok: false, error: friendlyError(readError) };
  const byId = new Map((rows ?? []).map((row) => [row.id, row]));
  const ordered = clean.filter((id) => byId.has(id));
  const catalogue = await adminCatalogue(supabase);
  const interests = ordered.map((id) => inquiryInterest(byId.get(id)!, catalogue) || null);

  const { data, error } = await supabase.rpc("crm_convert_inquiries", { p_inquiry_ids: ordered, p_interests: interests });
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  revalidatePath("/admin/crm");
  const leadIds = (data ?? []).map((row) => row.lead_id);
  return { ok: true, data: { leadIds }, message: leadIds.length === 1 ? "Moved to the CRM." : `${leadIds.length} moved to the CRM.` };
}

export async function deleteInquiries(ids: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const clean = cleanIds(ids);
  if (!clean.length) return { ok: false, error: "Nothing selected." };
  const { error } = await supabase.from("inquiries").delete().in("id", clean);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: clean.length === 1 ? "Inquiry deleted." : `${clean.length} inquiries deleted.` };
}
