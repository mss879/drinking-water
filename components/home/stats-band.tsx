"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { createVideoScrub } from "@/components/motion/video-scrub";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { planFor } from "@/content/pricing";
import { products } from "@/content/products";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The underwater film, recoloured onto the brand sheet's blue strip (README › Brand imagery). */
const film = {
  wide: "/video/water-1280.mp4",
  portrait: "/video/water-portrait.mp4",
  poster: "/video/water-poster.jpg",
};

const numbers = new Intl.NumberFormat("en-US");

/** The promise behind the numbers: what every LUSAKO system comes with. */
const checks = ["UF & RO purification", "Professional installation", "Preventive maintenance"];

/**
 * "More than a purifier" (the GrowSphere stats band): the promise as a heading with its check chips, then a
 * rounded band over the brand-blue water film, which plays as the band scrolls past. Every figure and caption
 * comes from the site's own content — no invented stats.
 */
export function StatsBand() {
  const root = useRef<HTMLElement>(null);
  const rental = planFor("UF");
  const stats = [
    rental.fromMonthly && {
      count: rental.fromMonthly,
      prefix: "Rs.",
      value: numbers.format(rental.fromMonthly),
      suffix: "/month",
      caption: "Complete hydration for one predictable monthly payment.",
    },
    { count: 4, value: "4", suffix: "-Stage", caption: "UF & RO purification" },
    { count: products.length, value: String(products.length), caption: "Water purifiers" },
  ].filter(Boolean) as { count: number; prefix?: string; value: string; suffix?: string; caption: string }[];

  useGSAP(
    () => {
      const band = root.current?.querySelector<HTMLElement>("[data-expand]");
      const video = root.current?.querySelector("video");
      if (!band || !video) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
        if (connection?.saveData) return;
        let scrub: ReturnType<typeof createVideoScrub> | null = null;
        const playhead = { progress: 0 };
        // The film only loads once the band is close, then its playhead follows the band through the screen.
        ScrollTrigger.create({
          trigger: band,
          start: "top 180%",
          once: true,
          onEnter: () => {
            scrub = createVideoScrub(video, window.innerWidth < 640 ? film.portrait : film.wide);
            scrub.progress(playhead.progress);
          },
        });
        gsap.to(playhead, {
          progress: 1,
          ease: "none",
          scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true },
          onUpdate: () => scrub?.progress(playhead.progress),
        });
        return () => scrub?.destroy();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="promise-title" className="py-16 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow="More than a purifier"
          title={
            <span id="promise-title">
              The right purification, professional installation and <Highlight>long-term care</Highlight>.
            </span>
          }
          layout="split"
          action={
            <ul className="flex flex-wrap gap-x-5 gap-y-3 lg:flex-col lg:gap-3.5">
              {checks.map((check) => (
                <li key={check} className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-deep text-white">
                    <Check aria-hidden className="size-3" strokeWidth={3} />
                  </span>
                  {check}
                </li>
              ))}
            </ul>
          }
        />

        <div data-expand className="relative isolate mt-10 overflow-hidden rounded-card-xl bg-deep text-white lg:mt-14">
          <Image src={film.poster} alt="" fill sizes="(min-width: 1320px) 1224px, 100vw" data-no-parallax className="-z-20 object-cover" />
          <video
            muted
            playsInline
            preload="none"
            aria-hidden
            className="absolute inset-0 -z-20 size-full object-cover opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-deep/90 via-deep/50 to-deep/20" />
          <WaveLines lines={3} className="absolute inset-x-0 bottom-0 -z-10 h-1/2 w-full text-white/25" />

          <div className="grid gap-4 p-3 sm:p-4 lg:grid-cols-12 lg:gap-6 lg:p-5">
            <div className="flex flex-col justify-between gap-10 rounded-card bg-deep p-7 sm:p-8 lg:col-span-4 lg:min-h-[19rem]">
              <p className="font-display text-sm font-bold tracking-[0.16em] text-white uppercase">{site.name}</p>
              <div>
                <p className="font-display text-3xl leading-tight font-bold sm:text-[2.15rem]">{site.tagline}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-white">
                  Water purification and hydration solutions for homes, offices and organisations across Sri Lanka.
                </p>
              </div>
            </div>
            <dl className="grid content-center gap-8 px-4 py-6 sm:grid-cols-[1.6fr_1fr_1fr] sm:gap-6 lg:col-span-8 lg:px-8">
              {stats.map((stat) => (
                <div key={stat.caption} className="flex flex-col gap-4 border-t border-white/30 pt-5">
                  <dt className="order-2 max-w-[16rem] text-[15px] leading-snug text-white">{stat.caption}</dt>
                  <dd className="order-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 font-sans text-[length:clamp(2.75rem,2rem+2.1vw,3.75rem)] leading-none font-light tracking-[-0.04em] tabular-nums">
                    {stat.prefix && <span className="text-xl font-medium tracking-normal">{stat.prefix}</span>}{" "}
                    <span data-count={stat.count}>{stat.value}</span>
                    {stat.suffix && <span className="text-xl font-medium tracking-normal">{stat.suffix}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
