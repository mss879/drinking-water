import { requireAdmin } from "@/lib/admin/auth";
import { adminCatalogue } from "@/lib/admin/catalogue";
import { csvDate, csvResponse, toCsv } from "@/lib/admin/csv";
import { cleanSearch, detailRows, formTypeLabels } from "@/lib/admin/inquiries";
import { inquiryStatuses } from "@/components/admin/ui/badge";
import type { InquiryFormType, InquiryStatus } from "@/lib/supabase/types";

/** Downloads the inquiries matching the list's current filters (up to 5,000) as a spreadsheet. */
export async function GET(request: Request) {
  const { supabase } = await requireAdmin();
  const params = new URL(request.url).searchParams;
  const status = params.get("status") ?? "all";
  const type = params.get("type") ?? "all";
  const q = cleanSearch(params.get("q") ?? "");

  let query = supabase.from("inquiries").select("*");
  if (status === "unread") query = query.is("read_at", null).neq("status", "spam");
  else if (["new", "in_progress", "resolved", "spam"].includes(status)) query = query.eq("status", status as InquiryStatus);
  else query = query.neq("status", "spam");
  if (["buy", "rental", "corporate", "service"].includes(type)) query = query.eq("form_type", type as InquiryFormType);
  if (q) {
    const like = `%${q}%`;
    query = query.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like},company.ilike.${like},reference.ilike.${like},location.ilike.${like}`);
  }
  const { data, error } = await query.order("created_at", { ascending: false }).limit(5000);
  if (error) return new Response("Couldn't export the inquiries.", { status: 500 });
  const catalogue = await adminCatalogue(supabase);

  const rows = [
    ["Reference", "Received", "Form", "Status", "Name", "Phone", "Email", "Company", "Location", "Message", "Details", "Sent from", "Notes"],
    ...(data ?? []).map((row) => [
      row.reference,
      csvDate(row.created_at),
      formTypeLabels[row.form_type],
      inquiryStatuses[row.status].label,
      row.name,
      row.phone,
      row.email,
      row.company,
      row.location,
      row.message,
      detailRows(row, catalogue)
        .map((detail) => `${detail.label}: ${detail.value}`)
        .join("; "),
      row.page_path,
      row.admin_notes,
    ]),
  ];
  const day = new Date().toISOString().slice(0, 10);
  return csvResponse(`lusako-inquiries-${day}.csv`, toCsv(rows));
}
