import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";
import { createPost } from "@/app/actions/admin/blog";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState, PageHeader } from "@/components/admin/ui/panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { requireAdmin } from "@/lib/admin/auth";
import { formatAgo, formatDate, formatNumber } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Blog" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "scheduled", label: "Scheduled" },
  { key: "draft", label: "Drafts" },
] as const;

/** Every post, with where it stands and how many people read it in the last 30 days. */
async function loadPosts(filter: string) {
  const { supabase } = await requireAdmin();
  const now = new Date();
  const [{ data: posts, error }, { data: views }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, slug, status, published_at, updated_at, category, cover_url, featured")
      .order("updated_at", { ascending: false }),
    supabase.rpc("analytics_breakdown", {
      p_from: new Date(now.getTime() - 30 * 86_400_000).toISOString(),
      p_to: now.toISOString(),
      p_dimension: "path",
      p_limit: 100,
    }),
  ]);
  if (error) throw new Error(error.message);
  const viewsByPath = new Map((views ?? []).map((row) => [row.label, Number(row.total)]));
  const rows = (posts ?? []).map((post) => {
    const state =
      post.status === "draft" ? "draft" : post.published_at && new Date(post.published_at) > now ? "scheduled" : "published";
    return { ...post, state, views: viewsByPath.get(`/blog/${post.slug}`) ?? 0 };
  });
  const counts = Object.fromEntries(FILTERS.map(({ key }) => [key, key === "all" ? rows.length : rows.filter((row) => row.state === key).length]));
  return { rows: filter === "all" ? rows : rows.filter((row) => row.state === filter), counts };
}

const stateBadge = {
  published: { label: "Published", tone: "solid" },
  scheduled: { label: "Scheduled", tone: "soft" },
  draft: { label: "Draft", tone: "muted" },
} as const;

export default async function BlogAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filter = FILTERS.some(({ key }) => key === params.status) ? String(params.status) : "all";
  const { rows, counts } = await loadPosts(filter);

  return (
    <>
      <PageHeader
        title="Blog"
        description="Write, schedule and publish articles for drinkingwater.lk/blog."
        actions={
          <form action={createPost}>
            <Button type="submit" size="sm">
              <Plus aria-hidden className="size-4" /> New post
            </Button>
          </form>
        }
      />

      <nav aria-label="Filter posts" className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={key === "all" ? "/admin/blog" : `/admin/blog?status=${key}`}
            aria-current={filter === key ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors",
              filter === key ? "bg-deep text-white" : "bg-white text-ink ring-1 ring-line hover:ring-mist",
            )}
          >
            {label} <span className={cn("tabular-nums", filter === key ? "text-white/80" : "text-muted")}>{counts[key]}</span>
          </Link>
        ))}
      </nav>

      <div className="card-line overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={<Newspaper />}
            title={filter === "all" ? "No posts yet" : "Nothing here"}
            action={
              filter === "all" && (
                <form action={createPost}>
                  <Button type="submit" arrow>
                    Write the first post
                  </Button>
                </form>
              )
            }
          >
            {filter === "all" ? "Posts you publish appear on the website’s blog, newest first." : "No posts with this status."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((post) => {
              const badge = stateBadge[post.state as keyof typeof stateBadge];
              return (
                <li key={post.id} className="relative flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-tint sm:px-5">
                  <span className="hidden aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-chip bg-tint-2 sm:block">
                    {post.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element -- a small admin thumbnail
                      <img src={post.cover_url} alt="" loading="lazy" className="size-full object-cover grayscale" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/blog/${post.id}`} className="after:absolute after:inset-0">
                      <span className="block truncate text-[15px] font-semibold text-ink">{post.title || "Untitled post"}</span>
                    </Link>
                    <p className="mt-0.5 truncate text-[13px] text-muted">
                      /blog/{post.slug}
                      {post.category && ` · ${post.category}`}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right text-[13px] text-muted md:block">
                    <p className="font-semibold text-ink tabular-nums">{formatNumber(post.views)}</p>
                    <p>views, 30 days</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex gap-1.5">
                      {post.featured && <Badge tone="white">Featured</Badge>}
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </span>
                    <span className="text-[12px] text-muted">
                      {post.state === "draft" ? `Edited ${formatAgo(post.updated_at)}` : formatDate(post.published_at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
