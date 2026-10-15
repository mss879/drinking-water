"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * On computers, holds its content still in the middle of the screen (below the floating navigation) while the column
 * beside it scrolls. It's a sticky block the height of its content, so it stays put for as long as the column runs;
 * its `top` is worked out from its own height and the screen's, and kept right as either changes. Until then (and on
 * screens too short to centre it) it sits just below the navigation. Phones and tablets get an ordinary block.
 */
export function CenteredSticky({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const block = ref.current;
    if (!block) return;
    const place = () => {
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      const room = window.innerHeight - header;
      block.style.setProperty("--sticky-top", `${Math.round(header + Math.max(24, (room - block.offsetHeight) / 2))}px`);
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(block);
    window.addEventListener("resize", place);
    return () => {
      resize.disconnect();
      window.removeEventListener("resize", place);
    };
  }, []);

  return (
    <div ref={ref} className={cn("lg:sticky lg:top-[var(--sticky-top,calc(var(--header-h)+3rem))]", className)}>
      {children}
    </div>
  );
}
