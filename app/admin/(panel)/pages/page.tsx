import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { copyPages } from "@/content/copy";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Page text" };

/** Every page whose text can be changed, with how many of its sections have been edited. */
export default async function PageTextIndex() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("cms_copy").select("key");
  if (error && isMissingSchema(error)) {
    return (
      <>
        <PageHeader title="Page text" />
        <MigrationNotice migration="20261009120000_editable_website.sql" />
      </>
    );
  }
  if (error) throw new Error(error.message);
  const edited = new Set(data.map((row) => row.key));

  return (
    <>
      <PageHeader
        title="Page text"
        description="The wording on every page: headings, paragraphs, lists, button labels, and the title and description Google shows. Anything you haven’t changed keeps the website’s own wording."
      />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {copyPages
          .filter((page) => page.blocks.length > 0)
          .map((page) => {
            const changed = page.blocks.filter((block) => edited.has(block.key)).length;
            return (
              <li key={page.id}>
                <Link href={`/admin/pages/${page.id}`} className="group card-line flex h-full flex-col gap-3 p-5 transition-colors hover:border-brand hover:bg-tint sm:p-6">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-display text-lg font-bold text-ink">{page.label}</span>
                    <ArrowUpRight aria-hidden className="size-4 shrink-0 text-deep transition-transform group-hover:rotate-45" />
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{page.description}</span>
                  <span className="mt-auto text-[13px] font-semibold text-deep">
                    {page.blocks.length} {page.blocks.length === 1 ? "section" : "sections"}
                    {changed > 0 && ` · ${changed} edited`}
                  </span>
                </Link>
              </li>
            );
          })}
      </ul>
    </>
  );
}
