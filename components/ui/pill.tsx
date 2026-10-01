import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  outline: "border border-line bg-white text-ink",
  tint: "bg-tint-2 text-deep",
  white: "bg-white text-deep",
  glass: "border border-white/30 bg-white/10 text-white backdrop-blur-md",
  deep: "bg-deep text-white",
} as const;

/** Small tag pill for categories, facts and chips. A long label wraps inside a narrow card instead of being cut off. */
export function Pill({
  children,
  variant = "outline",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 w-fit max-w-full items-center gap-1.5 rounded-full px-3.5 py-1 text-[13px] leading-tight font-medium [&>svg]:size-3.5 [&>svg]:shrink-0",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Announcement tag with a filled badge ahead of the text — "New | Bondify for All-in-One CRM" in the reference. */
export function Tag({
  badge,
  children,
  tone = "light",
  className,
}: {
  badge: ReactNode;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-2.5 rounded-full p-1 pr-4 text-[13px] font-medium",
        tone === "light" ? "border border-line bg-white text-ink" : "border border-white/25 bg-white/10 text-white backdrop-blur-md",
        className,
      )}
    >
      <span className="shrink-0 rounded-full bg-deep px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-white uppercase">
        {badge}
      </span>
      <span className="min-w-0 leading-tight">{children}</span>
    </span>
  );
}
