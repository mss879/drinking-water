"use server";

import { getSchema, type JSONContent } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { ALLOWED_LINK, blogExtensions } from "@/lib/blog/extensions";
import { BLOG_BUCKET, isBlogImage } from "@/lib/blog/images";
import { readingMinutes, slugify } from "@/lib/blog/text";
import { BLOG_TAG } from "@/lib/supabase/public";
import type { BlogPost, Json, PostStatus } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const schema = getSchema(blogExtensions);
const MAX_CONTENT = 512_000;

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: JSONContent;
  cover_url: string | null;
  cover_alt: string;
  cover_width: number | null;
  cover_height: number | null;
  category: string;
  author_name: string;
  status: PostStatus;
  /** ISO time; empty means "now" when publishing. */
  published_at: string | null;
  featured: boolean;
  seo_title: string;
  seo_description: string;
};

const text = (value: unknown, max: number) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);

/** The article must fit the editor's schema, link only to allowed places and use only uploaded images. */
function checkContent(content: unknown): string | null {
  if (JSON.stringify(content ?? null).length > MAX_CONTENT) return "The article is too long to save. Split it into two posts.";
  let doc: Node;
  try {
    doc = Node.fromJSON(schema, content);
    doc.check();
  } catch {
    return "The article couldn’t be read. Reload the editor and try again.";
  }
  let problem: string | null = null;
  doc.descendants((node) => {
    if (node.type.name === "image" && !isBlogImage(node.attrs.src)) problem = "Images must be uploaded through the editor.";
    for (const mark of node.marks) {
      if (mark.type.name === "link" && !ALLOWED_LINK.test(String(mark.attrs.href ?? ""))) {
        problem = "One of the links isn’t a web, email or phone link.";
      }
    }
    return problem === null;
  });
  return problem;
}

/** Refreshes everything that shows posts: the blog pages (old and new address), the feed and the sitemap. */
function refreshPublic(...slugs: (string | null | undefined)[]) {
  updateTag(BLOG_TAG);
  revalidatePath("/blog");
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog/feed.xml");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
  revalidatePath("/admin");
}

/** "New post": an empty draft, opened straight away in the editor. */
export async function createPost() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ title: "", slug: `untitled-${crypto.randomUUID().slice(0, 8)}` })
    .select("id")
    .single();
  if (error) throw new Error(friendlyError(error));
  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${data.id}`);
}

export async function savePost(id: string, input: PostInput): Promise<ActionResult<{ post: BlogPost }>> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown post." };

  const title = text(input.title, 200) ?? "";
  const status: PostStatus = input.status === "published" ? "published" : "draft";
  if (status === "published" && !title) return { ok: false, error: "Give the post a title before publishing." };

  const slug = (text(input.slug, 120) ?? slugify(title)).toLowerCase();
  if (!SLUG.test(slug)) return { ok: false, error: "The web address can only use lower-case letters, numbers and dashes." };

  const problem = checkContent(input.content);
  if (problem) return { ok: false, error: problem };

  if (input.cover_url && !isBlogImage(input.cover_url)) return { ok: false, error: "Upload the cover image through the editor." };

  let publishedAt: string | null = null;
  if (input.published_at) {
    const when = new Date(input.published_at);
    if (Number.isNaN(when.getTime())) return { ok: false, error: "Pick a valid publish date." };
    publishedAt = when.toISOString();
  }

  const { data: before } = await supabase.from("blog_posts").select("slug, status").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "This post was deleted." };

  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      excerpt: text(input.excerpt, 400),
      content: input.content as Json,
      cover_url: input.cover_url || null,
      cover_alt: text(input.cover_alt, 300),
      cover_width: input.cover_url && input.cover_width ? Math.round(input.cover_width) : null,
      cover_height: input.cover_url && input.cover_height ? Math.round(input.cover_height) : null,
      category: text(input.category, 60),
      author_name: text(input.author_name, 80) ?? "LUSAKO Team",
      status,
      published_at: publishedAt,
      featured: Boolean(input.featured),
      seo_title: text(input.seo_title, 120),
      seo_description: text(input.seo_description, 300),
      reading_minutes: readingMinutes(input.content),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Another post already uses that web address. Change the slug." };
    return { ok: false, error: friendlyError(error) };
  }

  // Drafts don't appear in public, so only touch the public pages when something visible could change.
  if (status === "published" || before.status === "published") refreshPublic(before.slug, data.slug);
  else revalidatePath("/admin/blog");
  return { ok: true, data: { post: data } };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown post." };
  const { data: post } = await supabase.from("blog_posts").select("slug, status").eq("id", id).maybeSingle();

  // Its images live in a folder named after the post.
  const { data: files } = await supabase.storage.from(BLOG_BUCKET).list(id, { limit: 1000 });
  if (files?.length) await supabase.storage.from(BLOG_BUCKET).remove(files.map((file) => `${id}/${file.name}`));

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  if (post?.status === "published") refreshPublic(post.slug);
  else revalidatePath("/admin/blog");
  return { ok: true, message: "Post deleted." };
}
