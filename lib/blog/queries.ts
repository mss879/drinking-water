import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { BlogPost } from "@/lib/supabase/types";

/** What a listing needs (no article body). */
export type PostSummary = Pick<
  BlogPost,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "cover_url"
  | "cover_alt"
  | "cover_width"
  | "cover_height"
  | "category"
  | "author_name"
  | "published_at"
  | "updated_at"
  | "reading_minutes"
  | "featured"
>;

const SUMMARY =
  "id, title, slug, excerpt, cover_url, cover_alt, cover_width, cover_height, category, author_name, published_at, updated_at, reading_minutes, featured";

/** Logged rather than thrown: the public blog shows its empty state instead of an error page. */
function quiet(error: { message: string } | null) {
  if (error) console.error("[blog]", error.message);
}

/** Published posts, newest first (row level security hides drafts and scheduled posts). */
export const getPublishedPosts = cache(async (limit = 60): Promise<PostSummary[]> => {
  const supabase = createPublicClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("blog_posts").select(SUMMARY).order("published_at", { ascending: false }).limit(limit);
    quiet(error);
    return data ?? [];
  } catch (error) {
    console.error("[blog] couldn't load posts", error);
    return [];
  }
});

/** A published post by slug, or where an old slug now points. */
export const getPostBySlug = cache(async (slug: string): Promise<{ post: BlogPost | null; movedTo: string | null }> => {
  const supabase = createPublicClient();
  if (!supabase || !/^[a-z0-9-]{1,120}$/.test(slug)) return { post: null, movedTo: null };
  try {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
    quiet(error);
    if (data) return { post: data, movedTo: null };
    const { data: moved } = await supabase.from("blog_posts").select("slug").contains("previous_slugs", [slug]).limit(1).maybeSingle();
    return { post: null, movedTo: moved?.slug ?? null };
  } catch (error) {
    console.error("[blog] couldn't load a post", error);
    return { post: null, movedTo: null };
  }
});

/** Up to three more posts: same category first, then the latest. */
export async function getRelatedPosts(post: Pick<BlogPost, "id" | "category">): Promise<PostSummary[]> {
  const all = await getPublishedPosts();
  const others = all.filter((item) => item.id !== post.id);
  const same = others.filter((item) => post.category && item.category === post.category);
  return [...same, ...others.filter((item) => !same.includes(item))].slice(0, 3);
}
