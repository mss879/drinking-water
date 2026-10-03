import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { AmcForm } from "@/components/admin/website/amc-form";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { buttonClasses } from "@/components/ui/button";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { amcFrom } from "@/lib/cms/map";

export const metadata: Metadata = { title: "AMC plans" };

export default async function AmcSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: row, error } = await supabase.from("cms_settings").select("value").eq("key", "amc").maybeSingle();

  return (
    <>
      <PageHeader
        title="AMC plans"
        description="Prices, visits and discounts for Essential Maintenance, Complete Annual Care and Maximum Protection. The AMC page, the plan cards, the comparison tables and the AMC questions all follow when you save."
        actions={
          <a href="/service-support/amc" target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
            <ExternalLink aria-hidden className="size-4" /> View AMC page
          </a>
        }
      />
      {error ? (
        isMissingSchema(error) ? (
          <MigrationNotice />
        ) : (
          <p className="card-line p-6 text-muted">The AMC plans couldn’t be loaded: {error.message}</p>
        )
      ) : (
        <AmcForm initial={amcFrom(row?.value)} />
      )}
    </>
  );
}
