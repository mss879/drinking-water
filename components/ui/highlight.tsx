import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Pastel pill behind key words in a headline — the reference's signature highlight. */
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("rounded-full bg-pastel px-[0.28em] text-ink [box-decoration-break:clone]", className)}>
      {children}
    </span>
  );
}
