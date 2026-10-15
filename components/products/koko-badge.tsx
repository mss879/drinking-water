import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import koko from "@/public/brand/partners/koko.png";

/**
 * KOKO buy now, pay later, beside the product page's Buy option (client, October 2026: "Add the Koko logo to the
 * product purchase page"), shown while it is switched on in Prices & quotes. Its words (Page text, product.options)
 * come before the logo: "Pay in instalments with" (client, October 2026: no number of instalments). The
 * logo keeps KOKO's own colours: it's their mark, not part of LUSAKO's palette.
 */
export function KokoBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-white px-3.5 py-1.5 text-[13px] leading-tight font-medium text-ink",
        className,
      )}
    >
      {children}
      <Image src={koko} alt="KOKO" width={63} height={20} className="h-5 w-auto" />
    </p>
  );
}
