import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getPublishedPosts } from "@/lib/blog/queries";
import { getProducts } from "@/lib/cms/content";

type Entry = MetadataRoute.Sitemap[number];

const staticRoutes: { path: string; priority: number; changeFrequency: Entry["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/water-purifiers", priority: 0.9, changeFrequency: "weekly" },
  { path: "/rental", priority: 0.9, changeFrequency: "weekly" },
  { path: "/hydration-solutions", priority: 0.8, changeFrequency: "monthly" },
  { path: "/hydration-solutions/corporate", priority: 0.8, changeFrequency: "monthly" },
  { path: "/find-my-solution", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/service-support", priority: 0.7, changeFrequency: "monthly" },
  { path: "/service-support/amc", priority: 0.7, changeFrequency: "monthly" },
  { path: "/service-support/parts", priority: 0.7, changeFrequency: "monthly" },
  { path: "/functional-water", priority: 0.7, changeFrequency: "monthly" },
  { path: "/why-lusako", priority: 0.6, changeFrequency: "monthly" },
  { path: "/clients", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
];

const absolute = (path: string) => new URL(path, site.url).toString();

// Rebuilt at most hourly, and whenever an admin publishes or changes a post or a product.
export const revalidate = 3600;

// Only real change dates are given: fixed pages carry none, products and posts carry when they were last saved.
// A date that moved on every rebuild would teach search engines to ignore them all.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, products] = await Promise.all([getPublishedPosts(1000), getProducts()]);
  return [
    ...staticRoutes.map(({ path, priority, changeFrequency }) => ({
      url: absolute(path),
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({
      url: absolute(`/water-purifiers/${product.slug}`),
      ...(product.updatedAt ? { lastModified: new Date(product.updatedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: absolute(`/blog/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
