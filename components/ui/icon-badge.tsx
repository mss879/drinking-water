import { isValidElement, type ReactNode } from "react";
import { brandIconFor, type BrandIconName } from "@/content/brand-icons";
import { BrandIcon } from "./brand-icon";
import { cn } from "@/lib/cn";

const variants = {
  tint: "bg-tint-2 text-deep",
  deep: "bg-deep text-white",
  white: "bg-white text-deep shadow-soft",
  outline: "border border-line bg-white text-deep",
  ink: "bg-ink text-white",
} as const;

const sizes = {
  sm: "size-10 [&>svg]:size-[18px]",
  md: "size-12 [&>svg]:size-5",
  lg: "size-14 [&>svg]:size-6",
} as const;

/** Brand icon size in px: bare on light cards, or framed inside the circle. */
const brandSizes = { sm: 44, md: 56, lg: 64 } as const;
const framedSizes = { sm: 28, md: 34, lg: 40 } as const;

/**
 * Round icon badge. When the Lucide icon passed in has a 3D brand icon (content/brand-icons.ts), that image is
 * shown instead: bare on light cards, or inside the circle with `framed` (for dark surfaces). `brandIcon` picks
 * a specific brand icon; `brand={false}` keeps the line icon, e.g. in timelines.
 */
export function IconBadge({
  children,
  variant = "tint",
  size = "md",
  brand = true,
  brandIcon,
  framed = false,
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  brand?: boolean;
  brandIcon?: BrandIconName;
  framed?: boolean;
  className?: string;
}) {
  const brandName = brand ? (brandIcon ?? (isValidElement(children) ? brandIconFor(children.type) : undefined)) : undefined;
  if (brandName && !framed) return <BrandIcon name={brandName} size={brandSizes[size]} className={className} />;

  return (
    <span aria-hidden className={cn("inline-grid shrink-0 place-items-center rounded-full", variants[variant], sizes[size], className)}>
      {brandName ? <BrandIcon name={brandName} size={framedSizes[size]} /> : children}
    </span>
  );
}
