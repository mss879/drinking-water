"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Fades each newly navigated page up into place. The first page of a visit is left alone:
 * its hero already animates, and hiding it would delay the first paint.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = document.documentElement;
      if (!root.dataset.visited) {
        root.dataset.visited = "true";
        return;
      }
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            clearProps: "all",
            onComplete: () => ScrollTrigger.refresh(),
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
