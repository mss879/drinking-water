import type { Metadata } from "next";
import { Download } from "lucide-react";
import { InquiriesView, type InquiryDetailData, type InquiryRow } from "@/components/admin/inquiries/inquiries-view";
import { adminCatalogue } from "@/lib/admin/catalogue";
import { PageHeader } from "@/components/admin/ui/panel";
import { buttonClasses } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { cleanSearch } from "@/lib/admin/inquiries";
import type { InquiryFormType, InquiryStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Inquiries" };

const PAGE_SIZE = 25;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS_FILTERS = ["all", "unread", "new", "in_progress", "resolved", "spam"] as const;
const TYPE_FILTERS = ["all", "buy", "rental", "corporate", "service"] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number];
export type TypeFilter = (typeof TYPE_FILTERS)[number];

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const status = (STATUS_FILTERS as readonly string[]).includes(one(params.status) ?? "") ? (one(params.status) as StatusFilter) : "all";
  const type = (TYPE_FILTERS as readonly string[]).includes(one(params.type) ?? "") ? (one(params.type) as TypeFilter) : "all";
  const q = cleanSearch(one(params.q));
  const page = Math.max(1, Math.floor(Number(one(params.page)) || 1));
  const openId = UUID.test(one(params.id) ?? "") ? one(params.id)! : null;

  let query = supabase
    .from("inquiries")
    .select("id, reference, form_type, status, read_at, name, email, phone, company, location, message, created_at, crm_leads(id)", {
      count: "exact",
    });
  if (status === "unread") query = query.is("read_at", null).neq("status", "spam");
  else if (status === "all") query = query.neq("status", "spam");
  else query = query.eq("status", status as InquiryStatus);
  if (type !== "all") query = query.eq("form_type", type as InquiryFormType);
  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `name.ilike.${like},email.ilike.${like},phone.ilike.${like},company.ilike.${like},reference.ilike.${like},location.ilike.${like}`,
    );
  }

  const base = () => supabase.from("inquiries").select("id", { count: "exact", head: true });
  const count = (build: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => build(base()).then((r) => r.count ?? 0);

  const [list, all, unread, fresh, progress, resolved, spam] = await Promise.all([
    query.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
    count((b) => b.neq("status", "spam")),
    count((b) => b.is("read_at", null).neq("status", "spam")),
    count((b) => b.eq("status", "new")),
    count((b) => b.eq("status", "in_progress")),
    count((b) => b.eq("status", "resolved")),
    count((b) => b.eq("status", "spam")),
  ]);
  if (list.error) throw new Error(list.error.message);

  const rows: InquiryRow[] = (list.data ?? []).map((row) => {
    const lead = Array.isArray(row.crm_leads) ? row.crm_leads[0] : row.crm_leads;
    return { ...row, lead_id: lead?.id ?? null };
  });

  let detail: InquiryDetailData | null = null;
  if (openId) {
    const { data: inquiry } = await supabase.from("inquiries").select("*").eq("id", openId).maybeSingle();
    if (inquiry) {
      const [{ data: lead }, { data: session }] = await Promise.all([
        supabase.from("crm_leads").select("id").eq("inquiry_id", inquiry.id).maybeSingle(),
        inquiry.session_id
          ? supabase
              .from("analytics_sessions")
              .select("channel, referrer_host, entry_path, device, browser, os, country, city, geo_source, pageviews, started_at")
              .eq("id", inquiry.session_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      detail = { inquiry, leadId: lead?.id ?? null, session: session ?? null, catalogue: await adminCatalogue(supabase) };
    }
  }

  const exportParams = new URLSearchParams();
  if (status !== "all") exportParams.set("status", status);
  if (type !== "all") exportParams.set("type", type);
  if (q) exportParams.set("q", q);

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Every request sent through the website’s forms. Open one to see the details, reply, or move it into the CRM."
        actions={
          <a href={`/admin/inquiries/export?${exportParams}`} download className={buttonClasses({ variant: "outline", size: "sm" })}>
            <Download aria-hidden className="size-4" />
            Export CSV
          </a>
        }
      />
      <InquiriesView
        rows={rows}
        total={list.count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ status, type, q }}
        counts={{ all, unread, new: fresh, in_progress: progress, resolved, spam }}
        detail={detail}
      />
    </>
  );
}
