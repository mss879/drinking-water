import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { StoriesManager } from "@/components/admin/website/stories-manager";
import { buttonClasses } from "@/components/ui/button";
import { clientsStories } from "@/content/copy/clients";
import { copyFrom } from "@/content/copy/schema";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Client stories" };

export default async function StoriesAdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data: stories, error }, saved] = await Promise.all([
    supabase.from("cms_case_studies").select("*").order("position").order("slug"),
    supabase.from("cms_copy").select("value").eq("key", clientsStories.key).maybeSingle(),
  ]);
  // The step names and the sample tag as the Our clients page shows them (Page text can rename them).
  const { steps, samplePill } = copyFrom(clientsStories, saved.data?.value);

  return (
    <>
      <PageHeader
        title="Client stories"
        description="The success stories on the Our clients page, in their order there. Name a client only with their written approval."
        actions={
          <a href="/clients" target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
            <ExternalLink aria-hidden className="size-4" /> View page
          </a>
        }
      />
      {error ? (
        isMissingSchema(error) ? (
          <MigrationNotice migration="20261009120000_editable_website.sql" />
        ) : (
          <p className="card-line p-6 text-muted">The stories couldn’t be loaded: {error.message}</p>
        )
      ) : (
        <StoriesManager stories={stories} steps={steps} samplePill={samplePill} />
      )}
    </>
  );
}
