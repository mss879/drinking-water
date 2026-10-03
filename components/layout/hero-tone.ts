"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";

/**
 * Whether a dark hero card is under the floating navigation pill. Every public page opens with one (the home film,
 * or an inner page's compact card), so the server snapshot says yes and the pill renders as smoked glass from the
 * first paint. Each hero card reports itself: it registers on mount, and an IntersectionObserver says when its
 * lower edge has passed up under the pill. With no hero on the page the pill turns frosted white.
 */
let heroes = 0;
let overHero = true;
const listeners = new Set<() => void>();

function set(next: boolean) {
  if (next === overHero) return;
  overHero = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Read by the header: true while a dark hero card sits under the pill. */
export function useOverHero() {
  return useSyncExternalStore(
    subscribe,
    () => overHero,
    () => true,
  );
}

/** The pill's lower edge sits about this far from the top of the screen (components/layout/header.tsx). */
const PILL_BOTTOM = 56;

/** Called by a hero card with a ref to its element. */
export function useHeroTone(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    heroes += 1;
    // Settle the tone now rather than a frame later, when the observer first reports.
    set(el.getBoundingClientRect().bottom > PILL_BOTTOM);
    const observer = new IntersectionObserver(([entry]) => set(entry.isIntersecting), {
      rootMargin: `-${PILL_BOTTOM}px 0px 0px 0px`,
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      heroes -= 1;
      // Navigating swaps one page's hero for the next in the same commit; only a page with none turns the pill light.
      queueMicrotask(() => {
        if (heroes === 0) set(false);
      });
    };
  }, [ref]);
}
