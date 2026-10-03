import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { SiteSettingsForm } from "@/components/admin/website/site-settings-form";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { contactFrom, socialFrom } from "@/lib/cms/map";

export const metadata: Metadata = { title: "Contact & social" };

export default async function SiteSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: rows, error } = await supabase.from("cms_settings").select("key, value").in("key", ["contact", "social"]);

  return (
    <>
      <PageHeader
        title="Contact & social"
        description="How customers reach LUSAKO. Changes appear across the whole website as soon as they’re saved."
      />
      {error ? (
        isMissingSchema(error) ? (
          <MigrationNotice />
        ) : (
          <p className="card-line p-6 text-muted">The settings couldn’t be loaded: {error.message}</p>
        )
      ) : (
        <SiteSettingsForm
          contact={contactFrom(rows.find((row) => row.key === "contact")?.value)}
          social={socialFrom(rows.find((row) => row.key === "social")?.value)}
        />
      )}
    </>
  );
}
