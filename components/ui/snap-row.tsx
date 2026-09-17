"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Horizontal card row that bleeds off the right edge like the reference's project cards.
 * Children must be <li> elements with `shrink-0 snap-start` and a width.
 */
export function SnapRow({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const listRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * Math.max(list.clientWidth * 0.7, 280), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      className={cn(
        "[--gutter:1.25rem] sm:[--gutter:2rem] lg:[--gutter:max(3rem,calc((100vw_-_1320px)/2_+_3rem))]",
        className,
      )}
    >
      <ul
        ref={listRef}
        aria-label={label}
        data-stagger
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-2"
      >
        {children}
      </ul>
      <div className="mt-6 flex justify-end gap-2 px-[var(--gutter)]">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${label} back`}
          className="grid size-12 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink/30"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label={`Scroll ${label} forward`}
          className="grid size-12 cursor-pointer place-items-center rounded-full bg-ink text-white transition-colors hover:bg-ocean"
        >
          <ArrowRight aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
