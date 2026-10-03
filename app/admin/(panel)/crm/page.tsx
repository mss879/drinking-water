import type { Metadata } from "next";
import { createHash } from "node:crypto";
import { CrmBoard, type CrmSummary } from "@/components/admin/crm/crm-board";
import { requireAdmin } from "@/lib/admin/auth";
import { todayInColombo } from "@/lib/admin/format";

export const metadata: Metadata = { title: "CRM pipeline" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = 86_400_000;

/** The board's data: stages, the leads to show, and the numbers above it. */
async function loadBoard(showAll: boolean, openLeadId: string | null) {
  const { supabase } = await requireAdmin();
  const [stagesResult, leadsResult] = await Promise.all([
    supabase.from("crm_stages").select("*").order("position").order("created_at"),
    supabase.from("crm_leads").select("*").order("position").order("created_at"),
  ]);
  if (stagesResult.error) throw new Error(stagesResult.error.message);
  if (leadsResult.error) throw new Error(leadsResult.error.message);
  const stages = stagesResult.data ?? [];
  const allLeads = leadsResult.data ?? [];

  // Won and lost columns only keep the last 90 days on the board, unless asked for everything.
  const outcome = new Map(stages.map((stage) => [stage.id, stage.outcome]));
  const since = Date.now() - 90 * DAY;
  const recent = (iso: string | null) => !iso || new Date(iso).getTime() >= since;
  const leads = showAll
    ? allLeads
    : allLeads.filter((lead) => outcome.get(lead.stage_id) === "open" || recent(lead.closed_at) || lead.id === openLeadId);

  // Month start in Sri Lanka time (UTC+5:30, no daylight saving).
  const today = todayInColombo();
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00+05:30`).getTime();
  const open = allLeads.filter((lead) => outcome.get(lead.stage_id) === "open");
  const wonMonth = allLeads.filter((lead) => outcome.get(lead.stage_id) === "won" && lead.closed_at && new Date(lead.closed_at).getTime() >= monthStart);
  const closed90 = allLeads.filter((lead) => outcome.get(lead.stage_id) !== "open" && lead.closed_at && new Date(lead.closed_at).getTime() >= since);
  const won90 = closed90.filter((lead) => outcome.get(lead.stage_id) === "won").length;

  const summary: CrmSummary = {
    openLeads: open.length,
    pipelineValue: open.reduce((sum, lead) => sum + (lead.value ?? 0), 0),
    wonThisMonth: wonMonth.length,
    wonValue: wonMonth.reduce((sum, lead) => sum + (lead.value ?? 0), 0),
    winRate: closed90.length ? won90 / closed90.length : null,
  };
  return { stages, leads, summary, today, hiddenClosed: allLeads.length - leads.length };
}

export default async function CrmPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const showAll = params.all === "1";
  const openLeadId = typeof params.lead === "string" && UUID.test(params.lead) ? params.lead : null;
  const { stages, leads, summary, today, hiddenClosed } = await loadBoard(showAll, openLeadId);

  // The board keeps its own order while dragging; when the saved data changes it starts again from the server's.
  const version = createHash("sha1")
    .update(JSON.stringify([stages.map((s) => [s.id, s.position, s.name, s.outcome]), leads.map((l) => [l.id, l.stage_id, l.position, l.updated_at])]))
    .digest("hex");

  return (
    <CrmBoard
      key={version}
      stages={stages}
      leads={leads}
      summary={summary}
      today={today}
      openLeadId={openLeadId}
      hiddenClosed={hiddenClosed}
      showAll={showAll}
    />
  );
}
