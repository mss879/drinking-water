import { DatabaseZap } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/panel";

/** Shown in the Website section until the website content migration has been run. */
export function MigrationNotice() {
  return (
    <div className="card-line">
      <EmptyState icon={<DatabaseZap aria-hidden />} title="One more database step">
        Run <code className="rounded bg-tint px-1.5 py-0.5 text-[13px] text-deep">supabase/migrations/20261003120000_website_content.sql</code> in
        the Supabase SQL editor. It adds the products, parts, logos and settings, starting from what the website shows today.
      </EmptyState>
    </div>
  );
}
