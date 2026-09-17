"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { splitWords } from "@/components/motion/split-words";
import { createVideoScrub } from "@/components/motion/video-scrub";
import { ButtonLink } from "@/components/ui/button";
import { Highlight } from "@/components/ui/highlight";
import { HERO_CHANGE_EVENT } from "@/lib/events";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Underwater footage re-encoded for scrubbing (README › Hero video); the portrait cut is a centre crop for phones. */
const film = {
  wide: "/video/hero-1280.mp4",
  portrait: "/video/hero-portrait.mp4",
  poster: "/video/hero-poster.jpg",
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
/** Lines content up with the header's container. */
const content = "mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12";
/** Keeps content clear of the mobile browser toolbar and quick-actions bar (see .hero in globals.css). */
const clearBars = "bottom-[calc(var(--hero-gap)+var(--hero-bar))]";
const pastel = (alpha: number) => `rgba(221, 235, 252, ${alpha})`;

/**
 * Timeline positions are shares (0–100) of the scroll through the sticky film. The section is 360lvh with a
 * 100lvh stage, and "Choose your way" overlaps its last 100lvh, so that section starts covering the film
 * 160/260 of the way through.
 */
const COVER = 61.5;

/**
 * Home hero: a full-bleed underwater film under a see-through header, played by the scroll. The headline
 * slips up out of its masks, the problem rises word by word and leaves, the promise follows, then
 * "Choose your way" slides up over the film as it deepens. Reduced motion gets the still film and the
 * headline, with no video download.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  // The header goes see-through over the film; tell it when the film arrives or leaves (e.g. client navigation).
  useEffect(() => {
    window.dispatchEvent(new Event(HERO_CHANGE_EVENT));
    return () => {
      window.dispatchEvent(new Event(HERO_CHANGE_EVENT));
    };
  }, []);

  useGSAP(
    () => {
      const section = root.current;
      const stage = section?.querySelector<HTMLElement>("[data-hero-stage]");
      const media = section?.querySelector<HTMLElement>("[data-hero-media]");
      const video = section?.querySelector("video");
      const shade = section?.querySelector<HTMLElement>("[data-hero-shade]");
      const cue = section?.querySelector<HTMLElement>("[data-hero-cue]");
      const statement = section?.querySelector<HTMLElement>("[data-hero-statement]");
      const care = section?.querySelector<HTMLElement>("[data-hero-care]");
      if (!section || !stage || !media || !video || !shade || !cue || !statement || !care) return;

      const title = section.querySelectorAll("#hero-title .word");
      const titleMark = section.querySelector("#hero-title .hero-mark");
      const lede = section.querySelectorAll("[data-hero-lede]");
      const statementWords = statement.querySelectorAll(".word");
      const careLabel = care.querySelector("[data-hero-care-label]");
      const careWords = care.querySelectorAll(".word");
      const careMark = care.querySelector(".hero-mark");

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
        const scrub = connection?.saveData ? null : createVideoScrub(video, window.innerWidth < 640 ? film.portrait : film.wide);
        const playhead = { progress: 0 };

        // The later beats wait with their words tucked below their masks (150%, so even tall letters stay hidden).
        gsap.set([statement, care], { opacity: 1 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${section.offsetHeight - stage.offsetHeight}`,
            scrub: 0.5,
          },
        });

        // The film plays across the whole scroll and eases back from a close-up.
        tl.to(playhead, { progress: 1, duration: 100, onUpdate: () => scrub?.progress(playhead.progress) }, 0)
          .fromTo(media, { scale: 1.22, yPercent: 0 }, { scale: 1, duration: COVER, ease: "power1.out" }, 0)
          .fromTo(cue, { autoAlpha: 1 }, { autoAlpha: 0, duration: 3 }, 0);

        // 1 · The headline slips up out of its masks; the rest lifts away. (`y: 0` stops GSAP adopting the
        // offset of the CSS entrance if the page is scrolled while the words are still rising.)
        tl.fromTo(title, { y: 0, yPercent: 0 }, { y: 0, yPercent: -150, duration: 7, stagger: 0.7, ease: "power2.in" }, 2)
          .fromTo(titleMark, { backgroundColor: pastel(1) }, { backgroundColor: pastel(0), duration: 4 }, 4)
          .fromTo(lede, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -48, duration: 6, stagger: 1.2, ease: "power2.in" }, 3);

        // 2 · The problem rises word by word, holds, then leaves the same way.
        tl.fromTo(shade, { opacity: 0.15 }, { opacity: 0.45, duration: 8 }, 11)
          .fromTo(statementWords, { yPercent: 150, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 5, stagger: 0.55, ease: "power3.out" }, 13)
          .to(statementWords, { yPercent: -150, rotate: -3, duration: 4, stagger: 0.3, ease: "power2.in" }, 36);

        // 3 · The promise.
        tl.to(shade, { opacity: 0.3, duration: 6 }, 44)
          .fromTo(careLabel, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 4, ease: "power2.out" }, 45)
          .fromTo(careWords, { yPercent: 150, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 5, stagger: 0.5, ease: "power3.out" }, 46)
          .fromTo(careMark, { backgroundColor: pastel(0) }, { backgroundColor: pastel(1), duration: 5, ease: "power2.out" }, 49);

        // 4 · Hand-off: "Choose your way" rises over the film, which deepens and drifts on.
        tl.to(shade, { opacity: 0.7, duration: 100 - COVER }, COVER)
          .to(media, { scale: 1.12, yPercent: -8, duration: 100 - COVER, ease: "power1.in" }, COVER)
          .to(care, { y: -80, opacity: 0, duration: 22, ease: "power1.in" }, COVER + 4);

        return () => scrub?.destroy();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-hero aria-labelledby="hero-title" className="hero relative -mt-[72px] motion-safe:h-[360lvh] lg:-mt-20">
      <div data-hero-stage className="sticky top-0 h-lvh overflow-hidden bg-abyss">
        <div data-hero-media className="absolute inset-0">
          <Image src={film.poster} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover" />
          <video
            aria-hidden
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100"
          />
        </div>
        <div data-hero-shade className="absolute inset-0 bg-abyss opacity-15" />
        <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-abyss/60 via-abyss/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-abyss/80 via-abyss/25 to-transparent" />

        <div data-hero-intro className={`absolute inset-x-0 ${clearBars} ${content} pb-[5.5rem] lg:pb-20`}>
          <h1
            id="hero-title"
            className="split split-in max-w-4xl text-display font-medium text-balance text-white"
            style={{ "--split-delay": "80ms" } as CSSProperties}
          >
            {splitWords(
              <>
                <Highlight className="hero-mark">Pure water</Highlight> without the hassle
              </>,
            )}
          </h1>
          <div data-hero-lede>
            <p className="rise mt-5 max-w-md text-lead text-white/85" style={delay(380)}>
              Bottleless water purification and hydration solutions for homes, offices and businesses.
            </p>
          </div>
          <div data-hero-lede className="hidden lg:block">
            <div className="rise mt-8 flex gap-3" style={delay(480)}>
              <ButtonLink href="/water-purifiers" variant="white" size="lg" arrow>
                Buy a water purifier
              </ButtonLink>
              <ButtonLink href="/rental" variant="glass" size="lg" arrow>
                Rent for your office
              </ButtonLink>
            </div>
          </div>
        </div>

        <div data-hero-statement className={`pointer-events-none absolute inset-x-0 top-0 ${clearBars} grid place-items-center px-6 opacity-0`}>
          <p className="max-w-[17ch] text-center text-[clamp(2.25rem,1.3rem+4vw,5rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance text-white">
            {splitWords("No more bottled-water deliveries. No heavy bottles. No unnecessary storage. No maintenance headaches.")}
          </p>
        </div>

        <div data-hero-care className={`pointer-events-none absolute inset-x-0 top-0 ${clearBars} flex items-center opacity-0`}>
          <div className={content}>
            <p data-hero-care-label className="text-[13px] font-medium tracking-[0.2em] text-white/75 uppercase">
              More than a purifier
            </p>
            <p className="mt-5 max-w-[19ch] text-[clamp(2.125rem,1.3rem+3.4vw,4.25rem)] leading-[1.04] font-medium tracking-[-0.04em] text-balance text-white">
              {splitWords(
                <>
                  The right purification, professional installation and <Highlight className="hero-mark">long-term care</Highlight>.
                </>,
              )}
            </p>
          </div>
        </div>

        <div
          data-hero-cue
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-white/80 lg:flex"
        >
          <span className="text-[11px] font-medium tracking-[0.24em] uppercase">Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-white/25">
            <span className="scroll-cue absolute inset-x-0 top-0 block h-1/2 bg-white" />
          </span>
        </div>
      </div>
    </section>
  );
}
