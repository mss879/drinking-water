import type { MetadataRoute } from "next";
import { products } from "@/content/products";
import { site } from "@/content/site";

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
  { path: "/why-lusako", priority: 0.6, changeFrequency: "monthly" },
  { path: "/clients", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
];

const absolute = (path: string) => new URL(path, site.url).toString();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...staticRoutes.map(({ path, priority, changeFrequency }) => ({
      url: absolute(path),
      lastModified,
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({
      url: absolute(`/water-purifiers/${product.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
