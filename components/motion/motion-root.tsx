"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Mobile toolbars showing and hiding shouldn't re-measure every trigger mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Site-wide motion, re-run on every route (the home hero runs its own timeline, see components/home/hero.tsx):
 * - scroll reveals: card grids, `[data-stagger]` children and `[data-reveal]` blocks rise in as they enter
 * - `[data-split]` headings: words rise out of their masks when scrolled into view
 * - parallax on large cover photos, and scroll-scrubbed moments (big type, arch, footer)
 * - the marquee speeds up and follows scroll direction
 *
 * Nothing is hidden before this runs, and only content below the fold is prepared, so there is no flash
 * and pages still read fine without JavaScript. Reduced-motion visitors get none of it.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)" },
        (context) => {
          const { motion } = context.conditions as { motion: boolean };
          if (!motion) return;

          const viewport = window.innerHeight;
          const belowFold = (el: Element) => el.getBoundingClientRect().top > viewport * 0.9;
          const hero = document.querySelector("main section");
          const prepared: HTMLElement[] = [];
          const splitPrepared: HTMLElement[] = [];

          const prepare = (el: HTMLElement, index: number, kind = "up") => {
            if (el.dataset.animate || el.closest("[data-animate]") || el.classList.contains("rise")) return;
            if (hero?.contains(el) || !belowFold(el)) return;
            el.dataset.animate = kind;
            el.style.setProperty("--i", String(Math.min(index, 6)));
            el.classList.add("is-waiting");
            prepared.push(el);
          };

          // Outermost first, so nested groups never animate twice.
          document.querySelectorAll<HTMLElement>("main section .grid").forEach((grid) => {
            if (grid.children.length < 2) return;
            Array.from(grid.children).forEach((child, i) => prepare(child as HTMLElement, i));
          });
          document.querySelectorAll<HTMLElement>("main [data-stagger]").forEach((group) => {
            Array.from(group.children).forEach((child, i) => prepare(child as HTMLElement, i));
          });
          document.querySelectorAll<HTMLElement>("main [data-reveal]").forEach((el) => prepare(el, 0, el.dataset.reveal || "up"));

          if (prepared.length) {
            ScrollTrigger.batch(prepared, {
              start: "clamp(top 92%)",
              once: true,
              onEnter: (batch) =>
                batch.forEach((el) => {
                  el.classList.remove("is-waiting");
                  el.classList.add("is-revealed");
                }),
            });
          }

          // Word-split headings below the fold wait in their masks until they scroll in.
          document.querySelectorAll<HTMLElement>("main [data-split]").forEach((heading) => {
            if (heading.classList.contains("split-in") || !belowFold(heading)) return;
            heading.classList.add("split-wait");
            splitPrepared.push(heading);
            ScrollTrigger.create({
              trigger: heading,
              start: "clamp(top 90%)",
              once: true,
              onEnter: () => {
                heading.classList.remove("split-wait");
                heading.classList.add("split-in");
              },
            });
          });

          // Gentle parallax on large cover photos (not the hero, not product cut-outs).
          document.querySelectorAll<HTMLImageElement>("main img.object-cover").forEach((img) => {
            const frame = img.parentElement;
            if (!frame || hero?.contains(img) || img.closest("[data-no-parallax]") || frame.clientHeight < 220) return;
            gsap.fromTo(
              img,
              { yPercent: -6, scale: 1.14 },
              {
                yPercent: 6,
                scale: 1.14,
                ease: "none",
                scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          });

          // PURE ◯ HYDRATION: the words slide in from either side and meet; the photo spins into place.
          // Each word travels only as far as its gap to the viewport edge, so it is never cut off mid-slide.
          const pageX = (el: HTMLElement) => {
            let x = 0;
            for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) x += node.offsetLeft;
            return x; // layout position, unaffected by transforms, so it can be re-measured on resize
          };
          document.querySelectorAll<HTMLElement>("[data-bigtype]").forEach((band) => {
            const left = band.querySelector<HTMLElement>("[data-bigtype-left]");
            const right = band.querySelector<HTMLElement>("[data-bigtype-right]");
            const orb = band.querySelector("[data-bigtype-orb]");
            const tl = gsap.timeline({
              scrollTrigger: { trigger: band, start: "top bottom", end: "center 58%", scrub: 0.6, invalidateOnRefresh: true },
            });
            if (left) {
              const from = () => -Math.max(0, pageX(left) - 12);
              tl.fromTo(left, { x: from, autoAlpha: 0.15 }, { x: 0, autoAlpha: 1, ease: "none" }, 0);
            }
            if (right) {
              const from = () => Math.max(0, document.documentElement.clientWidth - pageX(right) - right.offsetWidth - 12);
              tl.fromTo(right, { x: from, autoAlpha: 0.15 }, { x: 0, autoAlpha: 1, ease: "none" }, 0);
            }
            if (orb) tl.fromTo(orb, { scale: 0.45, rotate: -140 }, { scale: 1, rotate: 0, ease: "none" }, 0);
          });

          // Closing arch opens up and the oval photo settles as it scrolls in.
          document.querySelectorAll<HTMLElement>("[data-arch]").forEach((arch) => {
            const shape = arch.querySelector("[data-arch-shape]");
            const media = arch.querySelector("[data-arch-media]");
            const tl = gsap.timeline({
              scrollTrigger: { trigger: arch, start: "top bottom", end: "center center", scrub: 0.6 },
            });
            if (shape) tl.fromTo(shape, { scaleX: 0.72, yPercent: 14 }, { scaleX: 1, yPercent: 0, ease: "none" }, 0);
            if (media) tl.fromTo(media, { scale: 0.84, yPercent: 12 }, { scale: 1, yPercent: 0, ease: "none" }, 0);
          });

          // Progress lines fill as their section is read.
          document.querySelectorAll<HTMLElement>("[data-progress]").forEach((bar) => {
            gsap.fromTo(
              bar,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                transformOrigin: "left center",
                scrollTrigger: { trigger: bar.closest("section") ?? bar, start: "top 70%", end: "bottom 65%", scrub: true },
              },
            );
          });

          // Footer wordmark rises into place.
          const wordmarkArt = document.querySelector("[data-wordmark] svg");
          if (wordmarkArt) {
            gsap.fromTo(
              wordmarkArt,
              { yPercent: 45, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: { trigger: "[data-wordmark]", start: "top bottom", end: "bottom bottom", scrub: 0.6 },
              },
            );
          }

          // Marquee: speed follows scroll velocity and direction, then eases back.
          const tracks = gsap.utils.toArray<HTMLElement>("[data-marquee-track]");
          if (tracks.length) {
            const proxy = { rate: 1 };
            const apply = () => tracks.forEach((track) => track.getAnimations().forEach((a) => (a.playbackRate = proxy.rate)));
            ScrollTrigger.create({
              onUpdate: (self) => {
                const direction = self.direction || 1;
                const boost = direction * (1 + Math.min(Math.abs(self.getVelocity()) / 450, 5));
                gsap.to(proxy, {
                  rate: boost,
                  duration: 0.25,
                  overwrite: true,
                  onUpdate: apply,
                  onComplete: () => {
                    gsap.to(proxy, { rate: direction, duration: 1.4, ease: "power2.out", onUpdate: apply });
                  },
                });
              },
            });
          }

          ScrollTrigger.refresh();
          document.fonts?.ready.then(() => ScrollTrigger.refresh());

          return () => {
            prepared.forEach((el) => {
              el.classList.remove("is-waiting", "is-revealed");
              delete el.dataset.animate;
              el.style.removeProperty("--i");
            });
            splitPrepared.forEach((el) => el.classList.remove("split-wait", "split-in"));
            tracks.forEach((track) => track.getAnimations().forEach((a) => (a.playbackRate = 1)));
          };
        },
      );

      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
