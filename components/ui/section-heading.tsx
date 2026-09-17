import type { ReactNode } from "react";
import { splitWords } from "@/components/motion/split-words";
import { Pill } from "./pill";
import { cn } from "@/lib/cn";

/** Eyebrow pill + headline + intro. The headline's words rise into place when it scrolls into view. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <div data-reveal="fade">
          <Pill>{eyebrow}</Pill>
        </div>
      )}
      <Tag data-split className="split max-w-4xl text-h2 font-medium text-ink">
        {splitWords(title)}
      </Tag>
      {description && (
        <p data-reveal="up" className="max-w-2xl text-lead text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
