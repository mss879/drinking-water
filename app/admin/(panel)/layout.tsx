import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

/** Every signed-in admin screen: checks access, then draws the sidebar / tab bar around the page. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { admin, supabase } = await requireAdmin();
  const [{ count }, { count: chats }] = await Promise.all([
    supabase.from("inquiries").select("id", { count: "exact", head: true }).is("read_at", null).neq("status", "spam"),
    // Chats waiting for the team: a visitor asked for a person, or wrote in a chat someone took over.
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .or("handover_requested_at.not.is.null,and(ai_enabled.is.false,admin_unread.is.true)"),
  ]);

  return (
    <AdminShell email={admin.email} unread={count ?? 0} chats={chats ?? 0}>
      {children}
    </AdminShell>
  );
}
