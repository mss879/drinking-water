import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { BlogBrowser } from "@/components/blog/blog-browser";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { marked } from "@/components/ui/marked";
import { blogEmpty, blogHero, blogSeo } from "@/content/copy/blog";
import { getPublishedPosts } from "@/lib/blog/queries";
import { getCopy, getPhotos } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo";

// Served from cache and rebuilt at most hourly; publishing in the admin refreshes it straight away.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [seo, posts] = await Promise.all([getCopy(blogSeo), getPublishedPosts()]);
  const base = await pageMetadata({ title: seo.title, description: seo.description, path: "/blog" });
  return {
    ...base,
    alternates: { ...base.alternates, types: { "application/rss+xml": "/blog/feed.xml" } },
    // Until the first post, the page is only its "coming soon" note: search engines may follow it but not list it.
    ...(posts.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function BlogPage() {
  const [posts, photos, hero, empty] = await Promise.all([getPublishedPosts(), getPhotos(), getCopy(blogHero), getCopy(blogEmpty)]);
  return (
    <>
      <PageHero
        crumbs={[{ label: "Blog", href: "/blog" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        image={{ src: photos.pageBlog.src, position: "object-right" }}
      />
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-28">
        <Container>
          {posts.length > 0 ? (
            <BlogBrowser posts={posts} />
          ) : (
            <div className="card-line flex flex-col items-center px-6 py-16 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-tint-2 text-deep">
                <Newspaper aria-hidden className="size-7" />
              </span>
              <h2 className="mt-6 font-display text-h3 font-bold text-ink">{empty.title}</h2>
              <p className="mt-2 max-w-md text-muted">{empty.description}</p>
              <ButtonLink href="/find-my-solution" arrow className="mt-7">
                {empty.button}
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
