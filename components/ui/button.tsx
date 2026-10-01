import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ink" | "white" | "glass" | "ghost";
type Size = "sm" | "md" | "lg";

// A button never grows wider than the box it sits in: on a very narrow screen a long label wraps onto two
// balanced lines instead of pushing the page sideways (hence min-heights rather than fixed heights).
const base =
  "group/btn inline-flex max-w-full shrink-0 items-center justify-center gap-2.5 rounded-full text-center font-semibold text-balance select-none transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-emph hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-deep text-white hover:bg-deep-hover hover:shadow-float",
  outline: "border border-deep/25 bg-white text-deep hover:border-deep",
  ink: "bg-ink text-white hover:bg-deep",
  white: "bg-white text-deep hover:bg-tint-2",
  glass: "border border-white/35 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
  ghost: "text-deep hover:bg-tint",
};

/** The arrow rides in its own circle at the end of the pill, and turns to point ahead on hover. */
const arrowTone: Record<Variant, string> = {
  primary: "bg-white text-deep",
  outline: "bg-deep text-white",
  ink: "bg-white text-ink",
  white: "bg-deep text-white",
  glass: "bg-white text-deep",
  ghost: "bg-deep text-white",
};

/** Large buttons tighten a little on small phones, so labels such as "Explore corporate hydration" stay on one line. */
const sizes: Record<Size, { box: string; withArrow: string; circle: string }> = {
  sm: { box: "min-h-10 px-4 py-1.5 text-[13px] leading-tight", withArrow: "pr-1.5", circle: "size-7" },
  md: { box: "min-h-12 px-6 py-2 text-sm leading-tight", withArrow: "pr-2", circle: "size-8" },
  lg: { box: "min-h-14 px-7 py-2 text-[15px] leading-tight max-[400px]:px-6 max-[400px]:text-sm", withArrow: "pr-2", circle: "size-10" },
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  arrow = false,
  className,
}: {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
}) {
  return cn(base, variants[variant], sizes[size].box, arrow && sizes[size].withArrow, className);
}

export function ButtonArrow({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition-transform duration-300 ease-emph group-hover/btn:rotate-45",
        arrowTone[variant],
        sizes[size].circle,
      )}
    >
      <ArrowUpRight strokeWidth={2.25} className="size-3.5" />
    </span>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; arrow?: boolean };

export function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link {...props} className={buttonClasses({ variant, size, arrow, className })}>
      {children}
      {arrow && <ButtonArrow variant={variant} size={size} />}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  loading?: boolean;
};

export function Button({ variant, size, arrow, loading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, arrow: arrow && !loading, className })}
    >
      {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
      {arrow && !loading && <ButtonArrow variant={variant} size={size} />}
    </button>
  );
}
