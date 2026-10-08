import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { BlockEditor } from "@/components/admin/website/block-editor";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { buttonClasses } from "@/components/ui/button";
import { findPage } from "@/content/copy";
import { copyFrom } from "@/content/copy/schema";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findPage((await params).page);
  return { title: page ? `${page.label} · Page text` : "Page text" };
}

/** One page's text, section by section, in the order the page shows them. */
export default async function PageTextEditor({ params }: Props) {
  const page = findPage((await params).page);
  if (!page || page.blocks.length === 0) notFound();
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("cms_copy")
    .select("key, value")
    .in(
      "key",
      page.blocks.map((block) => block.key),
    );
  if (error && !isMissingSchema(error)) throw new Error(error.message);
  const saved = new Map((data ?? []).map((row) => [row.key, row.value]));

  return (
    <>
      <Link href="/admin/pages" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-deep">
        <ArrowLeft aria-hidden className="size-4" /> All pages
      </Link>
      <PageHeader
        title={page.label}
        description={page.description}
        actions={
          <a href={page.path} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
            <ExternalLink aria-hidden className="size-4" /> View page
          </a>
        }
      />
      {error ? (
        <MigrationNotice migration="20261009120000_editable_website.sql" />
      ) : (
        <div className="grid gap-5">
          {page.blocks.map((block) => (
            <BlockEditor key={block.key} block={block} initial={copyFrom(block, saved.get(block.key))} edited={saved.has(block.key)} />
          ))}
        </div>
      )}
    </>
  );
}
