import Image from "next/image";
import { brandIconSrc, type BrandIconName } from "@/content/brand-icons";
import { cn } from "@/lib/cn";

/** A 3D icon in the LUSAKO blues (256px source). Decorative by default (empty alt). */
export function BrandIcon({
  name,
  size = 56,
  alt = "",
  className,
}: {
  name: BrandIconName;
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      data-brand-icon
      src={brandIconSrc(name)}
      alt={alt}
      width={size}
      height={size}
      className={cn("pointer-events-none shrink-0 drop-shadow-[0_10px_14px_rgb(14_58_112/0.18)] select-none", className)}
    />
  );
}
