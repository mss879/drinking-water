import Image from "next/image";
import Link from "next/link";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonArrow } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Product } from "@/content/products";

/** "Find my solution" set round a ring (StomDent's round "find out prices" cell); the ring turns slowly. */
function SolutionCircle() {
  return (
    <Link
      href="/find-my-solution"
      aria-label="Find my solution"
      className="group/circle relative mx-auto grid aspect-square w-full max-w-[19rem] place-items-center overflow-hidden rounded-full bg-brand text-white transition-transform duration-500 ease-emph hover:scale-[1.03] md:max-w-none lg:w-[88%]"
    >
      <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-[6%] animate-spin-slow motion-reduce:animate-none">
        <defs>
          <path id="solution-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-white font-display text-[15.5px] font-bold tracking-[0.2em] uppercase">
          <textPath href="#solution-ring">Find my solution • Find my solution •</textPath>
        </text>
      </svg>
      <span className="grid size-20 place-items-center rounded-full bg-white text-deep transition-transform duration-500 ease-emph group-hover/circle:rotate-45 sm:size-24">
        <svg viewBox="0 0 24 24" aria-hidden className="size-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </span>
    </Link>
  );
}

/**
 * BUY | RENT | CARE (+ CORPORATE) as the StomDent service grid: outlined cards, one solid feature, one circle. No
 * prices here: the client keeps rental prices to the product and rental pages.
 */
export function ChooseYourWay({ featured }: { featured?: Product }) {

  return (
    <section className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Choose your way"
          title={
            <>
              <span className="inline-block">Buy it. Rent it.</span> <Highlight className="inline-block">We take care of it.</Highlight>
            </>
          }
        />

        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          <li className="md:col-span-2">
            <Link
              href="/water-purifiers"
              className="group/card card-line grid h-full gap-6 p-6 transition-colors duration-300 hover:border-brand hover:bg-tint sm:grid-cols-[1.1fr_1fr] sm:p-8 lg:min-h-[24rem]"
            >
              <div className="flex flex-col">
                <h3 className="font-display text-[2rem] leading-none font-bold text-brand">Buy</h3>
                <p className="mt-4 font-display text-xl font-semibold text-ink">Own your water purification system.</p>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
                  Invest once in a LUSAKO purification system and enjoy reliable purified water for years.
                </p>
                <span className="mt-auto flex items-center gap-3 pt-8 text-sm font-semibold text-deep">
                  <ArrowCircle variant="deep" className="size-10" />
                  Explore purifiers
                </span>
              </div>
              <div className="relative min-h-60 overflow-hidden rounded-card bg-tint-2">
                <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-3/5 w-full text-brand/50" />
                {featured && (
                  <Image
                    src={featured.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                    className="object-contain p-8 transition-transform duration-700 ease-emph group-hover/card:scale-105"
                  />
                )}
              </div>
            </Link>
          </li>

          <li>
            <Link
              href="/rental"
              className="group/card relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-card bg-brand p-6 text-white sm:p-8 md:min-h-[22rem]"
            >
              <WaveLines lines={4} className="absolute inset-x-0 -bottom-6 h-1/2 w-full text-white/35" />
              <h3 className="relative font-display text-[2rem] leading-none font-bold">Rent</h3>
              <p className="relative mt-4 font-display text-xl leading-snug font-bold">Complete hydration for one predictable monthly payment.</p>
              <p className="relative mt-5 w-fit rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-deep">
                Equipment and service included
              </p>
              <span className="relative mt-auto flex w-fit items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-5 text-sm font-semibold text-deep">
                Explore rental
                <ButtonArrow variant="white" size="sm" />
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/service-support"
              className="group/card card-line flex h-full flex-col p-6 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-8 md:min-h-[22rem]"
            >
              <h3 className="font-display text-[2rem] leading-none font-bold text-brand">Care</h3>
              <p className="mt-4 font-display text-xl leading-snug font-semibold text-ink">
                Professional installation, maintenance and technical support.
              </p>
              <p className="mt-3 text-sm font-medium text-muted">LUSAKO Care</p>
              <span className="mt-auto flex items-center gap-3 pt-8 text-sm font-semibold text-deep">
                <ArrowCircle variant="deep" className="size-10" />
                Service &amp; support
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/hydration-solutions/corporate"
              className="group/card relative flex h-full flex-col overflow-hidden rounded-card bg-ink p-6 text-white transition-colors duration-300 hover:bg-deep sm:p-8 md:min-h-[22rem]"
            >
              <h3 className="font-display text-[2rem] leading-none font-bold">Corporate</h3>
              <p className="mt-4 font-display text-xl leading-snug font-semibold">One partner for your workplace hydration, across one site or many.</p>
              <p className="mt-3 text-sm font-medium text-mist">Corporate Hydration Solutions</p>
              <span className="mt-auto flex items-center gap-3 pt-8 text-sm font-semibold">
                <ArrowCircle variant="white" className="size-10" />
                Talk to our team
              </span>
            </Link>
          </li>

          <li className="flex items-center justify-center py-4 md:py-0">
            <SolutionCircle />
          </li>
        </ul>
      </Container>
    </section>
  );
}
