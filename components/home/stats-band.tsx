"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { createVideoScrub } from "@/components/motion/video-scrub";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The underwater film, recoloured onto the brand sheet's blue strip (README › Brand imagery). */
const film = {
  wide: "/video/water-1280.mp4",
  portrait: "/video/water-portrait.mp4",
  poster: "/video/water-poster.jpg",
};

/**
 * What every LUSAKO system comes with, set large on the band. The client asked for the rental price, the number of
 * filtration stages and the product count to stay off the home page (they live on the product pages instead).
 */
const promises = [
  { title: "UF or RO", caption: "Purification matched to your water source." },
  { title: "Installed", caption: "Professionally, by trained LUSAKO technicians." },
  { title: "Cared for", caption: "Preventive maintenance and technical support." },
];

/**
 * "More than a purifier" (the GrowSphere stats band): the promise as a heading, then a rounded band over the
 * brand-blue water film, which plays as the band scrolls past, with the three parts of that promise.
 */
export function StatsBand() {
  const root = useRef<HTMLElement>(null);

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
          description="Every LUSAKO system comes with the right purification for your water, a professional installation and care for as long as you have it."
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
            <ul className="grid content-center gap-8 px-4 py-6 sm:grid-cols-3 sm:gap-6 lg:col-span-8 lg:px-8">
              {promises.map((promise) => (
                <li key={promise.title} className="flex flex-col gap-4 border-t border-white/30 pt-5">
                  <p className="font-sans text-[length:clamp(2.25rem,1.6rem+1.9vw,3.25rem)] leading-none font-light tracking-[-0.04em] whitespace-nowrap">
                    {promise.title}
                  </p>
                  <p className="max-w-[16rem] text-[15px] leading-snug text-white">{promise.caption}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
