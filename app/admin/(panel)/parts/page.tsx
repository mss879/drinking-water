import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { PartsManager } from "@/components/admin/website/parts-manager";
import { buttonClasses } from "@/components/ui/button";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Parts & accessories" };

export default async function PartsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: parts, error } = await supabase.from("cms_parts").select("*").order("position").order("name");

  return (
    <>
      <PageHeader
        title="Parts & accessories"
        description="The filter cartridges, spare parts and accessories on the website’s Filters, parts & accessories page."
        actions={
          <a href="/service-support/parts" target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
            <ExternalLink aria-hidden className="size-4" /> View page
          </a>
        }
      />
      {error ? isMissingSchema(error) ? <MigrationNotice /> : <p className="card-line p-6 text-muted">The parts couldn’t be loaded: {error.message}</p> : <PartsManager parts={parts} />}
    </>
  );
}
