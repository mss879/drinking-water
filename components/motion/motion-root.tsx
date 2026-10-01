"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Mobile toolbars showing and hiding shouldn't re-measure every trigger mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

const numbers = new Intl.NumberFormat("en-US");

/**
 * Site-wide motion, re-run on every route (the home hero runs its own timeline, see components/home/hero.tsx).
 * Reveals:
 * - card grids, `[data-stagger]` children and `[data-reveal]` blocks rise in as they enter; grids inside
 *   `[data-no-reveal]` are left alone (explicit `[data-stagger]` / `[data-reveal]` inside still apply)
 * - `[data-split]` headings: words rise out of their masks
 * Scroll-scrubbed moments:
 * - `[data-draw]` SVG lines draw themselves
 * - `[data-expand]` bands open out to full width
 * - `[data-parallax]` / `[data-rotate]` drift and turn; `[data-slide="left|right"]` cards slide in from the sides
 * - big type, progress lines and the footer wordmark
 * - `[data-hscroll]` sections pin on large screens and slide their track sideways
 * Also: `[data-count]` figures count up once, and the marquee speeds up and follows the scroll direction.
 *
 * Nothing is hidden before this runs, and only content below the fold is prepared, so there is no flash and
 * pages still read fine without JavaScript. Reduced-motion visitors get none of it.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 64rem)" },
        (context) => {
          const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
          if (!motion) return;

          const viewport = window.innerHeight;
          const belowFold = (el: Element) => el.getBoundingClientRect().top > viewport * 0.9;
          const hero = document.querySelector("main [data-hero]") ?? document.querySelector("main section");
          const prepared: HTMLElement[] = [];
          const splitPrepared: HTMLElement[] = [];
          const cleanups: (() => void)[] = [];

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
            if (grid.children.length < 2 || grid.closest("[data-no-reveal]")) return;
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

          // Figures count up from zero once, then settle on exactly the server-rendered text.
          document.querySelectorAll<HTMLElement>("main [data-count]").forEach((el) => {
            const target = Number(el.dataset.count);
            const node = el.firstChild;
            if (!Number.isFinite(target) || !node || node.nodeType !== Node.TEXT_NODE || !belowFold(el)) return;
            const final = node.nodeValue;
            const counter = { value: 0 };
            node.nodeValue = numbers.format(0);
            cleanups.push(() => {
              node.nodeValue = final;
            });
            ScrollTrigger.create({
              trigger: el,
              start: "clamp(top 88%)",
              once: true,
              onEnter: () =>
                gsap.to(counter, {
                  value: target,
                  duration: 1.8,
                  ease: "power3.out",
                  onUpdate: () => {
                    node.nodeValue = numbers.format(Math.round(counter.value));
                  },
                  onComplete: () => {
                    node.nodeValue = final;
                  },
                }),
            });
          });

          // SVG lines draw themselves as they cross the screen (a path, or every path inside an svg/g).
          document.querySelectorAll<SVGElement>("main [data-draw]").forEach((el) => {
            const lines =
              el instanceof SVGGeometryElement
                ? [el]
                : Array.from(el.querySelectorAll<SVGGeometryElement>("path, line, polyline, circle, ellipse, rect"));
            if (!lines.length) return;
            lines.forEach((line) => line.setAttribute("pathLength", "1"));
            gsap.fromTo(
              lines,
              { strokeDasharray: 1, strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                // The offset runs 1 → 0 on a path of length 1: GSAP's default rounding of px values to whole
                // numbers would snap the line from hidden to fully drawn halfway through.
                autoRound: false,
                ease: "none",
                scrollTrigger: {
                  trigger: el.closest("[data-draw-trigger]") ?? el,
                  start: el.dataset.drawStart ?? "top 85%",
                  end: el.dataset.drawEnd ?? "bottom 60%",
                  scrub: true,
                },
              },
            );
          });

          // Bands open out from an inset, rounded card to the full width as they scroll in.
          document.querySelectorAll<HTMLElement>("main [data-expand]").forEach((band) => {
            const radius = band.dataset.expand === "full" ? "0px" : (band.dataset.expandRadius ?? "32px");
            gsap.fromTo(
              band,
              { clipPath: "inset(0% 6% 0% 6% round 48px)" },
              {
                clipPath: `inset(0% 0% 0% 0% round ${radius})`,
                ease: "none",
                scrollTrigger: { trigger: band, start: "top bottom", end: "top 30%", scrub: true },
              },
            );
          });

          // Paired cards slide in towards each other from either side as they scroll up.
          document.querySelectorAll<HTMLElement>("main [data-slide]").forEach((el) => {
            const from = el.dataset.slide === "right" ? 10 : -10;
            gsap.fromTo(
              el,
              { xPercent: from, autoAlpha: 0.35 },
              {
                xPercent: 0,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "top 55%", scrub: true },
              },
            );
          });

          // Free-floating objects drift (yPercent) and turn (degrees) across their pass through the screen.
          document.querySelectorAll<HTMLElement>("main [data-parallax], main [data-rotate]").forEach((el) => {
            const drift = Number(el.dataset.parallax ?? 0);
            const turn = Number(el.dataset.rotate ?? 0);
            gsap.fromTo(
              el,
              { yPercent: drift, rotate: -turn },
              {
                yPercent: -drift,
                rotate: turn,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
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

          // PURE ∞ HYDRATION: the words slide in from either side and meet; the centrepiece spins into place.
          // Each word travels only as far as its gap to the viewport edge, so it is never cut off mid-slide.
          const pageX = (el: HTMLElement) => {
            let x = 0;
            for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) x += node.offsetLeft;
            return x; // layout position, unaffected by transforms, so it can be re-measured on resize
          };
          document.querySelectorAll<HTMLElement>("[data-bigtype]").forEach((band) => {
            const left = band.querySelector<HTMLElement>("[data-bigtype-left]");
            const right = band.querySelector<HTMLElement>("[data-bigtype-right]");
            const orb = band.querySelector<HTMLElement>("[data-bigtype-orb]");
            const tl = gsap.timeline({
              scrollTrigger: { trigger: band, start: "top bottom", end: "center 58%", scrub: 0.3, invalidateOnRefresh: true },
            });
            if (left) {
              const from = () => -Math.max(0, pageX(left) - 12);
              tl.fromTo(left, { x: from, autoAlpha: 0.15 }, { x: 0, autoAlpha: 1, ease: "none" }, 0);
            }
            if (right) {
              const from = () => Math.max(0, document.documentElement.clientWidth - pageX(right) - right.offsetWidth - 12);
              tl.fromTo(right, { x: from, autoAlpha: 0.15 }, { x: 0, autoAlpha: 1, ease: "none" }, 0);
            }
            if (orb) {
              const spin = Number(orb.dataset.bigtypeOrb || -140);
              tl.fromTo(orb, { scale: 0.45, rotate: spin }, { scale: 1, rotate: 0, ease: "none" }, 0);
            }
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

          // Large screens: [data-hscroll] sections hold their stage in place while the track slides sideways.
          // The section is made just tall enough for the track's overflow; the stage is CSS sticky.
          if (wide) {
            document.querySelectorAll<HTMLElement>("main [data-hscroll]").forEach((section) => {
              const stage = section.querySelector<HTMLElement>("[data-hscroll-stage]");
              const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
              if (!stage || !track) return;
              const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);
              const size = () => {
                section.style.height = `${stage.offsetHeight + distance()}px`;
              };
              size();
              ScrollTrigger.addEventListener("refreshInit", size);
              const tween = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: section,
                  start: () => `top top+=${parseFloat(getComputedStyle(stage).top) || 0}`,
                  end: () => `+=${distance()}`,
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              });
              tween.fromTo(track, { x: 0 }, { x: () => -distance() }, 0);
              const progress = section.querySelector("[data-hscroll-progress]");
              if (progress) tween.fromTo(progress, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center" }, 0);
              // Tabbing to a card that is off to the side scrolls the page to where it is in view.
              const onFocus = (event: FocusEvent) => {
                const item = (event.target as HTMLElement).closest<HTMLElement>("[data-hscroll-track] > *");
                const trigger = tween.scrollTrigger;
                const travel = distance();
                if (!item || !trigger || !travel) return;
                const x = Math.min(travel, Math.max(0, item.offsetLeft - 48));
                window.scrollTo({ top: trigger.start + (x / travel) * (trigger.end - trigger.start) });
              };
              track.addEventListener("focusin", onFocus);
              cleanups.push(() => {
                ScrollTrigger.removeEventListener("refreshInit", size);
                track.removeEventListener("focusin", onFocus);
                section.style.height = "";
              });
            });
          }

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
                scrollTrigger: { trigger: "[data-wordmark]", start: "top bottom", end: "bottom bottom", scrub: 0.3 },
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

          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          document.fonts?.ready.then(() => ScrollTrigger.refresh());

          // Accordions, tabs and calculators change the page height; re-measure every trigger once they settle.
          const main = document.querySelector("main");
          let settle = 0;
          const observer = new ResizeObserver(() => {
            window.clearTimeout(settle);
            settle = window.setTimeout(() => ScrollTrigger.refresh(), 200);
          });
          if (main) observer.observe(main);

          return () => {
            observer.disconnect();
            window.clearTimeout(settle);
            cleanups.forEach((undo) => undo());
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
