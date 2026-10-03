import { site } from "@/content/site";
import { getPublishedPosts } from "@/lib/blog/queries";

export const revalidate = 3600;

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** The blog as an RSS feed, for feed readers and newsletter tools. */
export async function GET() {
  const posts = await getPublishedPosts(30);
  const items = posts
    .map((post) => {
      const url = new URL(`/blog/${post.slug}`, site.url).toString();
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${post.published_at ? `<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>` : ""}
      ${post.category ? `<category>${escape(post.category)}</category>` : ""}
      ${post.excerpt ? `<description>${escape(post.excerpt)}</description>` : ""}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${site.name} Blog`)}</title>
    <link>${new URL("/blog", site.url)}</link>
    <description>${escape("Guides and news from LUSAKO on water purification and hydration.")}</description>
    <language>en-LK</language>
    <atom:link href="${new URL("/blog/feed.xml", site.url)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
