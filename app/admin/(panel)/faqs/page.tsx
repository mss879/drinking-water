import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { FaqsManager } from "@/components/admin/website/faqs-manager";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { buttonClasses } from "@/components/ui/button";
import { faqTopicsCopy } from "@/content/copy/faq";
import { copyFrom } from "@/content/copy/schema";
import { faqTopics } from "@/content/faqs";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsAdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data: faqs, error }, saved] = await Promise.all([
    supabase.from("cms_faqs").select("*").order("position").order("question"),
    supabase.from("cms_copy").select("value").eq("key", faqTopicsCopy.key).maybeSingle(),
  ]);
  // The topic names as the FAQ page shows them (Page text can rename them).
  const names = copyFrom(faqTopicsCopy, saved.data?.value).topics;
  const labels = Object.fromEntries(faqTopics.map((topic, i) => [topic.id, names[i] || topic.label]));

  return (
    <>
      <PageHeader
        title="FAQs"
        description="The questions and answers on the FAQ page, in their order there. Tick a question to show it on the home page or Corporate hydration too, hide one with the eye, or change the order with the arrows."
        actions={
          <a href="/faq" target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
            <ExternalLink aria-hidden className="size-4" /> View page
          </a>
        }
      />
      {error ? (
        isMissingSchema(error) ? (
          <MigrationNotice migration="20261009120000_editable_website.sql" />
        ) : (
          <p className="card-line p-6 text-muted">The questions couldn’t be loaded: {error.message}</p>
        )
      ) : (
        <FaqsManager faqs={faqs} labels={labels} />
      )}
    </>
  );
}
