import Link from "next/link";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { BrandIcon } from "@/components/ui/brand-icon";
import { WaveLines } from "@/components/ui/decor";
import { functionalWaters } from "@/content/functional-water";
import { cn } from "@/lib/cn";

/**
 * Sparkling, hydrogen, alkaline and other functional water as four cards: three outlined with their 3D icon, the
 * last a solid deep-blue card. Each opens its section on the Functional water page.
 */
export function FunctionalWaterGrid({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5", className)}>
      {functionalWaters.map((water, i) => {
        const dark = i === functionalWaters.length - 1;
        return (
          <li key={water.id}>
            <Link
              href={`/functional-water#${water.id}`}
              className={cn(
                "group/card relative flex h-full min-h-[18rem] flex-col overflow-hidden p-6 transition-colors duration-300 sm:p-7",
                dark ? "rounded-card bg-deep text-white hover:bg-deep-hover" : "card-line hover:border-brand hover:bg-tint",
              )}
            >
              {dark && <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />}
              <span className={cn("relative grid size-16 place-items-center rounded-card-sm", dark ? "bg-white/10" : "bg-tint-2")}>
                <BrandIcon name={water.icon} size={48} />
              </span>
              <span className="relative mt-auto block pt-10">
                <span className="block font-display text-h3 font-bold">{water.name}</span>
                <span className={cn("mt-2 block text-[15px] leading-relaxed", dark ? "text-white" : "text-muted")}>{water.short}</span>
              </span>
              <span className="relative mt-6 flex justify-end">
                <ArrowCircle variant={dark ? "white" : "deep"} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
