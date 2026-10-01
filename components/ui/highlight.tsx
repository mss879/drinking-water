import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Key words in a headline, set in the main brand blue. It stays inline and plain so word-split headings can
 * still animate each word (components/motion/split-words.tsx).
 */
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-brand", className)}>{children}</span>;
}
