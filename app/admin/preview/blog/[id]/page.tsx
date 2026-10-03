import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { ArticleView } from "@/components/blog/article-view";
import { SiteChrome } from "@/components/layout/site-chrome";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Preview" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A post exactly as it will look on the website, drafts included, for admins only. */
export default async function PreviewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();

  const state = post.status === "draft" ? "Draft" : post.published_at && new Date(post.published_at) > new Date() ? "Scheduled" : "Published";
  return (
    <SiteChrome>
      <div
        data-surface="dark"
        className="fixed inset-x-3 bottom-[calc(var(--cta-bar-h)+0.75rem)] z-[60] mx-auto flex max-w-xl items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-4 text-sm text-white shadow-float lg:bottom-6"
      >
        <Eye aria-hidden className="size-4 shrink-0 text-mist" />
        <span className="min-w-0 flex-1 truncate">
          Preview · <strong className="font-semibold">{state}</strong>
          {state !== "Published" && " · not visible to the public"}
        </span>
        <Link
          href={`/admin/blog/${post.id}`}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 font-semibold text-deep transition-colors hover:bg-tint-2"
        >
          <ArrowLeft aria-hidden className="size-4" /> Editor
        </Link>
      </div>
      <ArticleView post={post} related={[]} />
    </SiteChrome>
  );
}
