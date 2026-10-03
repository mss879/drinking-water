"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import type { Activity, ActivityKind, LeadPriority, LeadSourceKind, StageOutcome } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SOURCES: LeadSourceKind[] = ["website", "manual", "phone", "whatsapp", "referral", "walk_in", "event", "other"];
const PRIORITIES: LeadPriority[] = ["low", "medium", "high"];
const OUTCOMES: StageOutcome[] = ["open", "won", "lost"];
const NOTE_KINDS: ActivityKind[] = ["note", "call", "email", "whatsapp", "meeting"];

const isId = (value: unknown): value is string => typeof value === "string" && UUID.test(value);
const text = (value: unknown, max: number) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);

function refresh() {
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

export type LeadInput = {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  location?: string;
  interest?: string;
  source?: LeadSourceKind;
  value?: number | null;
  priority?: LeadPriority;
  follow_up_on?: string | null;
  notes?: string;
  stage_id?: string;
};

/** Checks and tidies a lead form. Returns an error message or the clean values. */
function cleanLead(input: LeadInput) {
  const name = text(input.name, 200);
  if (!name) return { error: "Add a name." } as const;
  const email = text(input.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "That email address doesn’t look right." } as const;
  const value = input.value === null || input.value === undefined || Number.isNaN(input.value) ? null : Number(input.value);
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 9_999_999_999)) return { error: "Enter the value as a positive amount." } as const;
  const follow = text(input.follow_up_on, 10);
  if (follow && !/^\d{4}-\d{2}-\d{2}$/.test(follow)) return { error: "Pick a follow-up date." } as const;
  return {
    lead: {
      name,
      email,
      phone: text(input.phone, 40),
      company: text(input.company, 200),
      location: text(input.location, 200),
      interest: text(input.interest, 200),
      source: input.source && SOURCES.includes(input.source) ? input.source : undefined,
      value,
      priority: input.priority && PRIORITIES.includes(input.priority) ? input.priority : undefined,
      follow_up_on: follow,
      notes: text(input.notes, 5000),
    },
  } as const;
}

export async function createLead(input: LeadInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const clean = cleanLead(input);
  if ("error" in clean) return { ok: false, error: clean.error! };

  let stageId = isId(input.stage_id) ? input.stage_id : null;
  if (!stageId) {
    const { data } = await supabase.from("crm_stages").select("id").eq("is_locked", true).maybeSingle();
    stageId = data?.id ?? null;
  }
  if (!stageId) return { ok: false, error: "Run the CRM migration first: the New Leads stage is missing." };

  // New cards go on top of their column.
  const { data: top } = await supabase.from("crm_leads").select("position").eq("stage_id", stageId).order("position").limit(1).maybeSingle();
  const { data, error } = await supabase
    .from("crm_leads")
    .insert({ ...clean.lead, source: clean.lead.source ?? "manual", stage_id: stageId, position: (top?.position ?? 1) - 1 })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, data: { id: data.id }, message: "Lead added." };
}

export async function updateLead(id: string, input: LeadInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Unknown lead." };
  const clean = cleanLead(input);
  if ("error" in clean) return { ok: false, error: clean.error! };
  const { error } = await supabase.from("crm_leads").update(clean.lead).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Lead saved." };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Unknown lead." };
  const { error } = await supabase.from("crm_leads").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Lead deleted." };
}

/** Drops a lead into a stage, before another lead (or at the end of the column). */
export async function moveLead(leadId: string, stageId: string, beforeId: string | null): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(leadId) || !isId(stageId) || (beforeId !== null && !isId(beforeId))) return { ok: false, error: "Couldn’t move that card." };
  const { error } = await supabase.rpc("crm_move_lead", { p_lead_id: leadId, p_stage_id: stageId, p_before_id: beforeId });
  if (error) return { ok: false, error: friendlyError(error, "Couldn’t move that card. Refresh the board and try again.") };
  refresh();
  return { ok: true };
}

export async function setStageOrder(stageIds: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const ids = Array.isArray(stageIds) ? stageIds.filter(isId).slice(0, 50) : [];
  const { error } = await supabase.rpc("crm_set_stage_order", { p_stage_ids: ids });
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true };
}

export async function addStage(name: string, outcome: StageOutcome = "open"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const clean = text(name, 40);
  if (!clean) return { ok: false, error: "Give the stage a name." };
  const { data: last } = await supabase.from("crm_stages").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase
    .from("crm_stages")
    .insert({ name: clean, outcome: OUTCOMES.includes(outcome) ? outcome : "open", position: Math.max(1, (last?.position ?? 0) + 1) });
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: `“${clean}” added.` };
}

export async function updateStage(id: string, changes: { name?: string; outcome?: StageOutcome }): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Unknown stage." };
  const update: { name?: string; outcome?: StageOutcome } = {};
  if (changes.name !== undefined) {
    const clean = text(changes.name, 40);
    if (!clean) return { ok: false, error: "Give the stage a name." };
    update.name = clean;
  }
  if (changes.outcome !== undefined) {
    if (!OUTCOMES.includes(changes.outcome)) return { ok: false, error: "Unknown outcome." };
    update.outcome = changes.outcome;
  }
  const { error } = await supabase.from("crm_stages").update(update).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Stage saved." };
}

export async function deleteStage(id: string, moveTo: string | null): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id) || (moveTo !== null && !isId(moveTo))) return { ok: false, error: "Unknown stage." };
  const { error } = await supabase.rpc("crm_delete_stage", { p_stage_id: id, p_move_to: moveTo });
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Stage deleted." };
}

export async function getLeadActivities(leadId: string): Promise<ActionResult<Activity[]>> {
  const { supabase } = await requireAdmin();
  if (!isId(leadId)) return { ok: false, error: "Unknown lead." };
  const { data, error } = await supabase
    .from("crm_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { ok: false, error: friendlyError(error) };
  return { ok: true, data: data ?? [] };
}

export async function addActivity(leadId: string, kind: ActivityKind, body: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(leadId)) return { ok: false, error: "Unknown lead." };
  if (!NOTE_KINDS.includes(kind)) return { ok: false, error: "Unknown activity." };
  const clean = text(body, 5000);
  if (!clean) return { ok: false, error: "Write something first." };
  const { error } = await supabase.from("crm_activities").insert({ lead_id: leadId, kind, body: clean });
  if (error) return { ok: false, error: friendlyError(error) };
  return { ok: true, message: "Added to the timeline." };
}
