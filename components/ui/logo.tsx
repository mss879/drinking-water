import { wordmark } from "@/content/brand-logo";
import { cn } from "@/lib/cn";

/**
 * The LUSAKO wordmark, rebuilt as exact vectors from the client's logo (content/brand-logo.ts). Brand blue
 * by default, white on dark surfaces; size it with a height class. Decorative unless given a `title`.
 * Full lockups with the tagline, and PNG/white versions, live in public/brand.
 */
export function Logo({ className, inverted = false, title }: { className?: string; inverted?: boolean; title?: string }) {
  return (
    <svg
      viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("block shrink-0 transition-colors duration-300", inverted ? "text-white" : "text-brand", className)}
    >
      <path fill="currentColor" d={wordmark.d} />
    </svg>
  );
}
