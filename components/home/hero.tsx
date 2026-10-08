"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { preload } from "react-dom";
import { useHeroTone } from "@/components/layout/hero-tone";
import { ButtonLink } from "@/components/ui/button";
import { marked } from "@/components/ui/marked";
import { Tag } from "@/components/ui/pill";
import type { homeHero } from "@/content/copy/home";
import { site } from "@/content/site";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * The hero film: the client's clip, frame for frame (only its silent audio track was dropped, and its index moved to
 * the front so it starts while it downloads). Phones get the part of it they actually show, a 576×720 crop at the
 * same 30% framing, which is a quarter of the size.
 */
const film = {
  src: "/video/hero-membrane.mp4",
  phone: "/video/hero-membrane-phone.mp4",
  poster: "/video/hero-poster.jpg", // its first frame, shown until the film plays
};

/**
 * Home hero: a rounded card that fills the first screen, 5px in from every edge, with the film of water running
 * through membrane fibres as its background. The floating navigation pill sits on top of it (the card slides up
 * under the header), then the headline, intro and buttons, and nothing else. On large screens the film sits to
 * the right and melts into the dark on the left, so the text stays on its calm side; on phones it fills the card
 * under a soft shade. Reduced-motion and data-saver visitors see its first frame instead of the moving film.
 */
export function Hero({ copy }: { copy: typeof homeHero.defaults }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  preload(film.poster, { as: "image", fetchPriority: "high" });
  useHeroTone(section);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
    let onScreen = true;
    const sync = () => {
      if (motion.matches && !connection?.saveData && onScreen) {
        el.muted = true; // set as a property too: browsers only autoplay muted video
        el.play().catch(() => {}); // e.g. iOS Low Power Mode: the poster stays
      } else el.pause();
    };
    // The film only runs while the hero is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section
      ref={section}
      data-hero
      data-surface="dark"
      aria-labelledby="hero-title"
      className="relative isolate mx-[5px] mt-[calc(5px-var(--header-h))] mb-[5px] overflow-hidden rounded-2xl bg-ink text-white lg:rounded-[1.25rem]"
    >
      <div
        aria-hidden
        className="film-enter absolute inset-0 -z-20 lg:left-auto lg:w-[74%] lg:[mask-image:linear-gradient(to_right,transparent,black_24%)]"
      >
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="metadata"
          poster={film.poster}
          tabIndex={-1}
          className="size-full object-cover object-[30%_50%] lg:object-left"
        >
          <source src={film.phone} type="video/mp4" media="(max-width: 767px)" />
          <source src={film.src} type="video/mp4" />
        </video>
      </div>
      {/* Phones and tablets: the text runs over the fibres, so a shade keeps it readable. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-ink/80 via-ink/60 to-ink/30 lg:hidden" />

      <div className="flex min-h-[max(34rem,calc(100svh-10px-var(--cta-bar-h)))] flex-col justify-center px-5 pt-[calc(var(--header-h)+1rem)] pb-12 sm:px-8 lg:px-[calc(var(--edge)-5px)] lg:pb-16">
        <div className="max-w-[40rem]">
          <div className="rise" style={delay(60)}>
            <Tag badge={site.name} tone="dark">
              {site.pillars.join(" · ")}
            </Tag>
          </div>
          <h1
            id="hero-title"
            className="mt-6 font-display text-[length:clamp(1.9rem,8.6vw,4rem)] leading-[1.06] font-bold tracking-[-0.035em]"
          >
            <span className="line-mask line-in">
              <span
                className="line bg-linear-to-r from-brand to-mist bg-clip-text whitespace-nowrap text-transparent"
                style={delay(120)}
              >
                {copy.title[0]}
              </span>
            </span>{" "}
            <span className="line-mask line-in">
              <span className="line whitespace-nowrap" style={delay(200)}>
                {copy.title[1]}
              </span>
            </span>
          </h1>
          <p className="rise mt-6 max-w-md text-lead text-white/85" style={delay(300)}>
            {marked(copy.intro, { mark: (word) => <span className="font-semibold text-white">{word}</span> })}
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={delay(380)}>
            <ButtonLink href="/water-purifiers" variant="white" arrow className="w-full sm:w-auto">
              {copy.buyButton}
            </ButtonLink>
            <ButtonLink href="/rental" variant="glass" arrow className="w-full sm:w-auto">
              {copy.rentButton}
            </ButtonLink>
          </div>
        </div>

      </div>
    </section>
  );
}
