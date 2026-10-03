"use client";

import { useState } from "react";
import { PostCard } from "@/components/blog/post-card";
import { cn } from "@/lib/cn";
import type { PostSummary } from "@/lib/blog/queries";

/** The blog's list: the featured post first, then a grid, filtered by category in the browser (the page stays static). */
export function BlogBrowser({ posts }: { posts: PostSummary[] }) {
  const categories = [...new Set(posts.map((post) => post.category).filter((value): value is string => Boolean(value)))];
  const [category, setCategory] = useState<string | null>(null);
  const shown = category ? posts.filter((post) => post.category === category) : posts;
  const featured = category ? null : (posts.find((post) => post.featured) ?? posts[0]);
  const rest = shown.filter((post) => post !== featured);

  return (
    <>
      {categories.length > 1 && (
        <div role="group" aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">
          {[null, ...categories].map((value) => (
            <button
              key={value ?? "all"}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
              className={cn(
                "inline-flex h-11 cursor-pointer items-center rounded-full border px-5 text-sm font-semibold transition-colors",
                category === value ? "border-deep bg-deep text-white" : "border-line bg-white text-ink hover:border-deep hover:text-deep",
              )}
            >
              {value ?? "All articles"}
            </button>
          ))}
        </div>
      )}
      {featured && <PostCard post={featured} featured className="mb-5" />}
      {rest.length > 0 && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
