import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { BlogBrowser } from "@/components/blog/blog-browser";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { getPublishedPosts } from "@/lib/blog/queries";
import { pageMetadata } from "@/lib/seo";
import { heroImages } from "@/content/images";

// Served from cache and rebuilt at most hourly; publishing in the admin refreshes it straight away.
export const revalidate = 3600;

const base = pageMetadata({
  title: "Water & Hydration Blog",
  description: "Guides and news from LUSAKO on water purification, UF and RO, office hydration, rental and keeping your water at its best.",
  path: "/blog",
});
export const metadata: Metadata = {
  ...base,
  alternates: { ...base.alternates, types: { "application/rss+xml": "/blog/feed.xml" } },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Blog", href: "/blog" }]}
        eyebrow="Blog"
        title={["Better water,", <Highlight key="explained">explained</Highlight>]}
        description="Guides, tips and news from LUSAKO on purification, rental and drinking water at home and at work."
        image={{ src: heroImages.blog, position: "object-right" }}
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
              <h2 className="mt-6 font-display text-h3 font-bold text-ink">Articles are on the way</h2>
              <p className="mt-2 max-w-md text-muted">
                We’re writing our first guides on purified water. Meanwhile, find the system that suits you in three questions.
              </p>
              <ButtonLink href="/find-my-solution" arrow className="mt-7">
                Find my solution
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
