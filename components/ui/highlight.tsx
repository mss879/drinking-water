import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Pastel pill behind key words in a headline — the reference's signature highlight. It stays inline so it can
 * wrap with the words; the `highlight` utility (globals.css) fits the pill to the letters.
 */
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("highlight rounded-full bg-pastel text-ink", className)}>
      <span>{children}</span>
    </span>
  );
}
