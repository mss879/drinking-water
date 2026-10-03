import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/blog/post-editor";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Edit post" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: post }, { data: all }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("blog_posts").select("category").not("category", "is", null),
  ]);
  if (!post) notFound();
  const categories = [...new Set((all ?? []).map((row) => row.category).filter((value): value is string => Boolean(value)))].sort();
  return <PostEditor key={post.id} post={post} categories={categories} />;
}
