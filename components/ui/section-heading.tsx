import type { ReactNode } from "react";
import { splitWords } from "@/components/motion/split-words";
import { cn } from "@/lib/cn";

/**
 * Section label + headline + intro. The label is the brand sheet's uppercase sub-heading; the headline's words
 * rise into place when it scrolls into view.
 *
 * `layout="split"` puts the intro (and an optional `action`) in a right-hand column on large screens, the
 * "heading on the left, short paragraph on the right" row both references use.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  layout = "stack",
  tone = "light",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  layout?: "stack" | "split";
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
}) {
  const dark = tone === "dark";
  const intro = (description || action) && (
    <div
      data-reveal="up"
      className={cn(
        "flex flex-col gap-6",
        layout === "split" ? "lg:col-span-4 lg:col-start-9 lg:pb-2" : "max-w-2xl",
        align === "center" && layout === "stack" && "items-center",
      )}
    >
      {description && <p className={cn("text-lead", dark ? "text-white/80" : "text-muted")}>{description}</p>}
      {action && <div className="flex flex-wrap gap-3">{action}</div>}
    </div>
  );

  return (
    <div
      data-no-reveal
      className={cn(
        layout === "split" ? "grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8" : "flex flex-col gap-6",
        align === "center" && layout === "stack" && "items-center text-center",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-5", layout === "split" && "lg:col-span-7", align === "center" && "items-center")}>
        {eyebrow && (
          <div data-reveal="fade">
            <span className={cn("label", dark && "text-mist before:bg-mist")}>{eyebrow}</span>
          </div>
        )}
        <Tag data-split className={cn("split max-w-4xl text-h2 font-semibold", dark ? "text-white" : "text-ink")}>
          {splitWords(title)}
        </Tag>
      </div>
      {intro}
    </div>
  );
}
