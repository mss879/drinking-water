"use client";

import { useRef } from "react";
import { CarouselArrows } from "@/components/ui/snap-row";
import type { Product } from "@/content/products";
import { ProductCard } from "./product-card";

/**
 * The purifier carousel. Phones (and reduced motion) swipe it with the StomDent arrows; on large screens with
 * motion it becomes the track of a `[data-hscroll]` section, sliding sideways as the page scrolls
 * (components/motion/motion-root.tsx), with a progress line underneath.
 */
export function ProductRail({ products, label }: { products: Product[]; label: string }) {
  const listRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * Math.max(list.clientWidth * 0.7, 300), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="[--gutter:1.25rem] sm:[--gutter:2rem] lg:[--gutter:max(3rem,calc((100vw_-_1320px)/2_+_3rem))]">
      <ul
        ref={listRef}
        aria-label={label}
        data-hscroll-track
        data-stagger
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-2 motion-safe:lg:w-max motion-safe:lg:snap-none motion-safe:lg:gap-5 motion-safe:lg:overflow-visible"
      >
        {products.map((product) => (
          <li key={product.slug} className="w-[80vw] shrink-0 snap-start sm:w-[340px] xl:w-[360px]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-center gap-6 px-[var(--gutter)]">
        <div className="hidden h-0.5 flex-1 overflow-hidden rounded-full bg-line motion-safe:lg:block">
          <div data-hscroll-progress className="h-full w-full origin-left bg-deep" />
        </div>
        <CarouselArrows label={label} onBack={() => scroll(-1)} onForward={() => scroll(1)} className="ml-auto motion-safe:lg:hidden" />
      </div>
    </div>
  );
}
