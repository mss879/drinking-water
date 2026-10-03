import type { JSONContent } from "@tiptap/core";
import { ChevronDown } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { PostMeta } from "@/components/blog/post-meta";
import { ShareLinks } from "@/components/blog/share-links";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/content/site";
import { JsonLd } from "@/lib/jsonld";
import { ogImage, organizationRef, websiteId } from "@/lib/seo";
import type { PostSummary } from "@/lib/blog/queries";
import { renderArticle } from "@/lib/blog/render";
import { autoExcerpt, headings } from "@/lib/blog/text";
import type { BlogPost } from "@/lib/supabase/types";
import { heroImages } from "@/content/images";

function Contents({ entries }: { entries: ReturnType<typeof headings> }) {
  return (
    <ol className="grid gap-1 text-[15px]">
      {entries.map((entry) => (
        <li key={entry.id} className={entry.level === 3 ? "pl-4" : undefined}>
          <a href={`#${entry.id}`} className="-mx-2 block rounded-chip px-2 py-1.5 leading-snug text-muted transition-colors hover:bg-tint hover:text-deep">
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * A blog post as readers see it: the compact hero with the cover behind it, the article with its contents and share
 * links alongside, more posts, and the closing call to action. Used by the public page and the admin preview.
 */
export async function ArticleView({ post, related }: { post: BlogPost; related: PostSummary[] }) {
  const content = post.content as JSONContent;
  const toc = headings(content);
  const url = new URL(`/blog/${post.slug}`, site.url).toString();
  const description = post.seo_description ?? post.excerpt ?? autoExcerpt(content);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description,
          url,
          mainEntityOfPage: url,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          image: [post.cover_url ?? new URL(ogImage.url, site.url).toString()],
          author: { "@type": "Organization", name: post.author_name, url: site.url },
          publisher: organizationRef,
          isPartOf: { "@id": websiteId },
          ...(post.category ? { articleSection: post.category } : {}),
        }}
      />
      <PageHero
        crumbs={[
          { label: "Blog", href: "/blog" },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
        showCrumbs
        eyebrow={post.category ?? "Blog"}
        title={post.title}
        description={post.excerpt}
        image={post.cover_url ? { src: post.cover_url, mono: true, alt: post.cover_alt ?? undefined } : { src: heroImages.blog, position: "object-right" }}
      >
        <PostMeta publishedAt={post.published_at} minutes={post.reading_minutes} author={post.author_name} tone="dark" />
      </PageHero>

      <section className="py-12 md:py-16 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_18rem]" data-no-reveal>
          <div className="min-w-0">
            {toc.length > 1 && (
              <details className="group mb-8 rounded-card-sm border border-line bg-white lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display font-bold text-ink">
                  On this page
                  <ChevronDown aria-hidden className="size-4 text-deep transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-line px-5 py-3">
                  <Contents entries={toc} />
                </div>
              </details>
            )}
            <div className="article max-w-[68ch]">{renderArticle(content)}</div>
            <div className="mt-12 max-w-[68ch] border-t border-line pt-8 lg:hidden">
              <ShareLinks url={url} title={post.title} />
            </div>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-h)+1.5rem)] grid gap-10">
              {toc.length > 1 && (
                <nav aria-label="On this page">
                  <p className="label">On this page</p>
                  <div className="mt-4">
                    <Contents entries={toc} />
                  </div>
                </nav>
              )}
              <ShareLinks url={url} title={post.title} />
            </div>
          </aside>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="pb-16 md:pb-20 lg:pb-28">
          <Container>
            <SectionHeading eyebrow="Keep reading" title="More from the blog" />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <PostCard post={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CtaBand />
    </>
  );
}
