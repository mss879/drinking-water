import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

const variants = {
  white: "bg-white text-deep",
  deep: "bg-deep text-white",
  tint: "bg-tint-2 text-deep",
  outline: "border border-line text-deep",
} as const;

/** Round arrow on cards; it turns to point ahead when its `group/card` parent is hovered. */
export function ArrowCircle({
  variant = "white",
  className,
}: {
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid size-11 shrink-0 place-items-center rounded-full transition-transform duration-300 ease-emph group-hover/card:rotate-45",
        variants[variant],
        className,
      )}
    >
      <ArrowUpRight className="size-[18px]" strokeWidth={1.75} />
    </span>
  );
}
