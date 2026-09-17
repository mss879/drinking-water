import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  outline: "border border-ink/15 bg-white text-ink",
  pastel: "bg-pastel text-ink",
  white: "bg-white text-ink",
  glass: "border border-white/30 bg-ink/35 text-white backdrop-blur-md",
  ocean: "bg-ocean text-white",
} as const;

/** Small tag pill — "Our Projects" / "Our Gallery" in the reference. */
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
        "inline-flex h-8 w-fit items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap [&>svg]:size-3.5",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
