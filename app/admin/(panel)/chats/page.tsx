import type { Metadata } from "next";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { ChatsInbox, type ChatCounts, type ChatRow, type ChatView, type OpenChat } from "@/components/admin/chats/chats-inbox";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { buttonClasses } from "@/components/ui/button";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { cleanSearch } from "@/lib/admin/inquiries";
import { chatSettingsFrom } from "@/lib/chat/config";
import { hasAssistantKey } from "@/lib/chat/settings";

export const metadata: Metadata = { title: "Chats" };

const PAGE_SIZE = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VIEWS: ChatView[] = ["open", "attention", "live", "leads", "closed", "all"];
const LIST_COLUMNS =
  "id, status, ai_enabled, handover_requested_at, agent_name, visitor_name, phone, email, company, location, lead_id, qualified_at, message_count, last_message_at, last_message_preview, admin_unread, context, created_at";
/** Waiting for the team: asked for a person, or a team member is answering and the visitor wrote. */
const ATTENTION = "handover_requested_at.not.is.null,and(ai_enabled.is.false,admin_unread.is.true)";

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

type Filterable<T> = { filter(column: string, operator: string, value: unknown): T; or(filters: string): T };

export default async function ChatsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { admin, supabase } = await requireAdmin();
  const params = await searchParams;
  const view = (VIEWS as string[]).includes(one(params.view) ?? "") ? (one(params.view) as ChatView) : "open";
  const q = cleanSearch(one(params.q));
  const page = Math.max(1, Math.floor(Number(one(params.page)) || 1));
  const openId = UUID.test(one(params.id) ?? "") ? one(params.id)! : null;

  // Each view's filter, applied to the list and to its count.
  const scope = <T extends Filterable<T>>(query: T, which: ChatView): T => {
    if (which === "open") return query.filter("status", "eq", "open");
    if (which === "attention") return query.filter("status", "eq", "open").or(ATTENTION);
    if (which === "live") return query.filter("status", "eq", "open").filter("ai_enabled", "is", false);
    if (which === "leads") return query.filter("lead_id", "not.is", null);
    if (which === "closed") return query.filter("status", "eq", "closed");
    return query;
  };

  let list = scope(supabase.from("chat_sessions").select(LIST_COLUMNS, { count: "exact" }), view);
  if (q) {
    const like = `%${q}%`;
    list = list.or(
      `visitor_name.ilike.${like},phone.ilike.${like},email.ilike.${like},company.ilike.${like},location.ilike.${like},last_message_preview.ilike.${like},summary.ilike.${like}`,
    );
  }
  const count = (which: ChatView) =>
    scope(supabase.from("chat_sessions").select("id", { count: "exact", head: true }), which).then((result) => result.count ?? 0);

  const [rows, settingsRow, ...counted] = await Promise.all([
    list.order("last_message_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
    supabase.from("chat_settings").select("*").maybeSingle(),
    ...VIEWS.map(count),
  ]);

  const header = (
    <PageHeader
      title="Chats"
      description="Every conversation with the website’s chat assistant, as it happens. Take a chat over to answer it yourself: the assistant goes quiet in that chat until you hand it back."
      actions={
        <Link href="/admin/chats/settings" className={buttonClasses({ variant: "outline", size: "sm" })}>
          <Settings2 aria-hidden className="size-4" />
          Assistant settings
        </Link>
      }
    />
  );

  if (rows.error && isMissingSchema(rows.error)) {
    return (
      <>
        {header}
        <MigrationNotice migration="20261009180000_ai_chat_agent.sql" />
      </>
    );
  }
  if (rows.error) throw new Error(rows.error.message);

  let open: OpenChat | null = null;
  if (openId) {
    const { data: session } = await supabase.from("chat_sessions").select("*").eq("id", openId).maybeSingle();
    if (session) {
      const [{ data: messages }, { data: lead }] = await Promise.all([
        supabase.from("chat_messages").select("*").eq("session_id", session.id).order("created_at", { ascending: true }).limit(500),
        session.lead_id
          ? supabase.from("crm_leads").select("id, name, crm_stages(name)").eq("id", session.lead_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      const stage = lead ? (Array.isArray(lead.crm_stages) ? lead.crm_stages[0] : lead.crm_stages) : null;
      open = {
        session,
        messages: messages ?? [],
        lead: lead ? { id: lead.id, name: lead.name, stage: stage?.name ?? null } : null,
      };
    }
  }

  const settings = chatSettingsFrom(settingsRow.data);
  const counts = Object.fromEntries(VIEWS.map((which, i) => [which, counted[i] as number])) as ChatCounts;

  return (
    <>
      {header}
      <ChatsInbox
        rows={(rows.data ?? []) as ChatRow[]}
        total={rows.count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ view, q }}
        counts={counts}
        open={open}
        assistant={{ on: settings.aiEnabled && hasAssistantKey(), widget: settings.widgetEnabled, keyMissing: settings.aiEnabled && !hasAssistantKey() }}
        me={{ email: admin.email }}
      />
    </>
  );
}
