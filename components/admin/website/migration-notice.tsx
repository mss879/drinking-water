import { DatabaseZap } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/panel";

const what: Record<string, string> = {
  "20261003120000_website_content.sql": "It adds the products, parts, logos and settings, starting from what the website shows today.",
  "20261009120000_editable_website.sql": "It adds the prices, page text, questions and client stories, starting from what the website shows today.",
};

/** Shown in the Website section until the migration a screen needs has been run. */
export function MigrationNotice({ migration = "20261003120000_website_content.sql" }: { migration?: string }) {
  return (
    <div className="card-line">
      <EmptyState icon={<DatabaseZap aria-hidden />} title="One more database step">
        Run <code className="rounded bg-tint px-1.5 py-0.5 text-[13px] text-deep">supabase/migrations/{migration}</code> in the Supabase SQL
        editor. {what[migration]}
      </EmptyState>
    </div>
  );
}
