"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Inertial smooth scrolling (Lenis) for wheel and trackpad, run on GSAP's ticker so every ScrollTrigger
 * effect moves in step with it. Touch keeps native scrolling. Off for reduced motion, and paused while
 * something locks the page (the intro and the mobile menu set overflow: hidden on <html>).
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    const enable = () => {
      if (lenis || reduce.matches) return;
      lenis = new Lenis({ lerp: 0.09, stopInertiaOnNavigate: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      // The intro locks the page before this runs, so the observer below never sees it happen.
      if (root.style.overflow === "hidden") lenis.stop();
    };
    const disable = () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis?.destroy();
      lenis = null;
    };
    const onPreference = () => (reduce.matches ? disable() : enable());
    const lock = new MutationObserver(() => {
      if (root.style.overflow === "hidden") lenis?.stop();
      else lenis?.start();
    });

    enable();
    reduce.addEventListener("change", onPreference);
    lock.observe(root, { attributes: true, attributeFilter: ["style"] });
    return () => {
      reduce.removeEventListener("change", onPreference);
      lock.disconnect();
      disable();
    };
  }, []);

  return null;
}
