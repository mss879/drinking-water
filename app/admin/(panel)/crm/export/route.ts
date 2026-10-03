import { requireAdmin } from "@/lib/admin/auth";
import { priorityLabels, sourceLabels } from "@/lib/admin/crm";
import { csvDate, csvResponse, toCsv } from "@/lib/admin/csv";

/** Downloads every lead on the board, with its stage, as a spreadsheet. */
export async function GET() {
  const { supabase } = await requireAdmin();
  const [{ data: stages, error: stageError }, { data: leads, error: leadError }] = await Promise.all([
    supabase.from("crm_stages").select("id, name, outcome, position"),
    supabase.from("crm_leads").select("*").order("created_at", { ascending: false }).limit(10000),
  ]);
  if (stageError || leadError) return new Response("Couldn't export the leads.", { status: 500 });

  const stageById = new Map((stages ?? []).map((stage) => [stage.id, stage]));
  const rows = [
    ["Name", "Stage", "Outcome", "Company", "Phone", "Email", "Location", "Interested in", "Value (LKR)", "Priority", "Follow up on", "Source", "Notes", "Added", "Closed"],
    ...(leads ?? []).map((lead) => {
      const stage = stageById.get(lead.stage_id);
      return [
        lead.name,
        stage?.name,
        stage?.outcome === "won" ? "Won" : stage?.outcome === "lost" ? "Lost" : "Open",
        lead.company,
        lead.phone,
        lead.email,
        lead.location,
        lead.interest,
        lead.value,
        priorityLabels[lead.priority],
        lead.follow_up_on,
        sourceLabels[lead.source],
        lead.notes,
        csvDate(lead.created_at),
        csvDate(lead.closed_at),
      ];
    }),
  ];
  const day = new Date().toISOString().slice(0, 10);
  return csvResponse(`lusako-leads-${day}.csv`, toCsv(rows));
}
