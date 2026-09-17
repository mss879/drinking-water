import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "dark" | "brand" | "pastel" | "outline" | "ghost" | "white" | "glass";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[transform,background-color,color,border-color] duration-200 ease-emph hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<Variant, string> = {
  dark: "bg-ink text-white hover:bg-ocean",
  brand: "bg-brand text-white hover:bg-brand-bright",
  pastel: "bg-pastel text-ink hover:bg-mist",
  outline: "border border-ink/15 bg-white text-ink hover:border-ink/40",
  ghost: "text-ink hover:bg-frost",
  white: "bg-white text-ink hover:bg-ice",
  glass: "border border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white/25",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-7 text-base",
};

export function buttonClasses({
  variant = "dark",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return cn(base, variants[variant], sizes[size], className);
}

function Arrow() {
  return (
    <ArrowUpRight
      aria-hidden
      strokeWidth={2}
      className="size-4 transition-transform duration-200 ease-emph group-hover/btn:rotate-45"
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; arrow?: boolean };

export function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link {...props} className={buttonClasses({ variant, size, className })}>
      {children}
      {arrow && <Arrow />}
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
      className={buttonClasses({ variant, size, className })}
    >
      {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
      {arrow && !loading && <Arrow />}
    </button>
  );
}
