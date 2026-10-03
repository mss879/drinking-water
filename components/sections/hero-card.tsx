"use client";

import { useRef, type ReactNode } from "react";
import { useHeroTone } from "@/components/layout/hero-tone";
import { cn } from "@/lib/cn";

/**
 * The shell every inner page opens with, cut from the same cloth as the home hero: a dark rounded card 5px in from
 * the screen edges that slides up under the floating navigation pill. It tells the header when it is under the
 * pill (smoked glass) and when it has scrolled away (frosted white).
 */
export function HeroCard({
  labelledBy,
  className,
  children,
}: {
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useHeroTone(ref);
  return (
    <section
      ref={ref}
      data-hero="compact"
      data-surface="dark"
      aria-labelledby={labelledBy}
      className={cn(
        "relative isolate mx-[5px] mt-[calc(5px-var(--header-h))] overflow-hidden rounded-2xl bg-ink text-white lg:rounded-[1.25rem]",
        className,
      )}
    >
      {children}
    </section>
  );
}
