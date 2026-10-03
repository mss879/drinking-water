import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { LogosManager } from "@/components/admin/website/logos-manager";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { buttonClasses } from "@/components/ui/button";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Client logos" };

export default async function LogosAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: logos, error } = await supabase.from("cms_client_logos").select("*").order("position").order("name");

  return (
    <>
      <PageHeader
        title="Client logos"
        description="Add, replace, reorder or remove the logos on the Our clients page. There’s no limit: the grid simply grows."
        actions={
          <a href="/clients" target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
            <ExternalLink aria-hidden className="size-4" /> View page
          </a>
        }
      />
      {error ? isMissingSchema(error) ? <MigrationNotice /> : <p className="card-line p-6 text-muted">The logos couldn’t be loaded: {error.message}</p> : <LogosManager logos={logos} />}
    </>
  );
}
