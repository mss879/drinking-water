import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { ElementType } from "react";
import { site } from "@/content/site";
import { ALLOWED_LINK, blogExtensions } from "@/lib/blog/extensions";
import { isBlogImage } from "@/lib/blog/images";
import { slugify } from "@/lib/blog/text";

/**
 * An article body, rendered on the server from the editor's JSON: only the node types the editor allows exist, so
 * no raw HTML ever reaches the page. Headings get ids for the table of contents (the same ones lib/blog/text.ts
 * computes), links are checked again, outside links open in a new tab, and images must come from the blog's bucket.
 */
export function renderArticle(content: JSONContent) {
  const seen = new Map<string, number>();
  return renderToReactElement({
    content,
    extensions: blogExtensions,
    options: {
      nodeMapping: {
        heading: ({ node, children }) => {
          const level = Math.min(4, Math.max(2, Number(node.attrs.level) || 2));
          const base = slugify(node.textContent.trim()) || "section";
          const count = seen.get(base) ?? 0;
          seen.set(base, count + 1);
          const Tag = `h${level}` as ElementType;
          return <Tag id={count ? `${base}-${count + 1}` : base}>{children}</Tag>;
        },
        image: ({ node }) => {
          const { src, alt, title, width, height } = node.attrs as Record<string, string | number | null>;
          if (!isBlogImage(src)) return null;
          return (
            <figure>
              {/* Stored at a fixed size in the blog's bucket; the article column sizes it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={typeof alt === "string" ? alt : ""}
                width={typeof width === "number" ? width : undefined}
                height={typeof height === "number" ? height : undefined}
                loading="lazy"
                decoding="async"
              />
              {typeof title === "string" && title && <figcaption>{title}</figcaption>}
            </figure>
          );
        },
      },
      markMapping: {
        link: ({ mark, children }) => {
          const href = typeof mark.attrs.href === "string" ? mark.attrs.href : "";
          if (!ALLOWED_LINK.test(href)) return <>{children}</>;
          const external = /^https?:\/\//i.test(href) && !href.startsWith(site.url);
          return (
            <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {children}
            </a>
          );
        },
      },
    },
  });
}
