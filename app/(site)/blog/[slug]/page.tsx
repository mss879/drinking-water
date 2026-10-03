import type { JSONContent } from "@tiptap/core";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleView } from "@/components/blog/article-view";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/blog/queries";
import { autoExcerpt } from "@/lib/blog/text";
import { pageMetadata } from "@/lib/seo";

// Cached, rebuilt at most hourly (so scheduled posts appear within the hour) and refreshed when an admin saves.
export const revalidate = 3600;

/** Published posts are built ahead of time; newer ones are built on their first visit. */
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  const description = post.seo_description ?? post.excerpt ?? autoExcerpt(post.content as JSONContent, 160);
  const base = pageMetadata({ title: post.seo_title ?? post.title, description, path: `/blog/${post.slug}` });
  const image = post.cover_url
    ? [{ url: post.cover_url, width: post.cover_width ?? undefined, height: post.cover_height ?? undefined, alt: post.cover_alt ?? post.title }]
    : base.openGraph?.images;
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      ...(post.category ? { section: post.category } : {}),
      images: image,
    },
    twitter: { ...base.twitter, images: post.cover_url ? [post.cover_url] : base.twitter?.images },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const { post, movedTo } = await getPostBySlug(slug);
  if (!post) {
    // A renamed post keeps its old address alive.
    if (movedTo) permanentRedirect(`/blog/${movedTo}`);
    notFound();
  }
  const related = await getRelatedPosts(post);
  return <ArticleView post={post} related={related} />;
}
