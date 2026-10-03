import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

/** Every signed-in admin screen: checks access, then draws the sidebar / tab bar around the page. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { admin, supabase } = await requireAdmin();
  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .neq("status", "spam");

  return (
    <AdminShell email={admin.email} unread={count ?? 0}>
      {children}
    </AdminShell>
  );
}
