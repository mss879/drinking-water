"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The carousel arrows from the StomDent reference: an outlined "back" and a filled "forward". */
export function CarouselArrows({
  label,
  onBack,
  onForward,
  className,
}: {
  label: string;
  onBack: () => void;
  onForward: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={onBack}
        aria-label={`Scroll ${label} back`}
        className="grid size-12 cursor-pointer place-items-center rounded-full border border-deep/25 bg-white text-deep transition-colors hover:border-deep"
      >
        <ArrowLeft aria-hidden className="size-5" />
      </button>
      <button
        type="button"
        onClick={onForward}
        aria-label={`Scroll ${label} forward`}
        className="grid size-12 cursor-pointer place-items-center rounded-full bg-deep text-white transition-colors hover:bg-deep-hover"
      >
        <ArrowRight aria-hidden className="size-5" />
      </button>
    </div>
  );
}

/**
 * Horizontal card row that bleeds off the right edge. Children must be <li> elements with
 * `shrink-0 snap-start` and a width.
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
      <CarouselArrows label={label} onBack={() => scroll(-1)} onForward={() => scroll(1)} className="mt-6 justify-end px-[var(--gutter)]" />
    </div>
  );
}
