"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { howItWorks } from "@/content/services";
import { cn } from "@/lib/cn";

type Mode = keyof typeof howItWorks;

/** Zig-zag geometry (px): each step's dot sits on the wave; odd steps drop by twice the amplitude. */
const DOT = 8;
const AMPLITUDE = 44;
const HEIGHT = DOT * 2 + AMPLITUDE * 2;

/** A cosine wave across `steps` columns: crests on even steps, troughs on odd ones (viewBox 1000 × HEIGHT). */
function wave(steps: number) {
  const column = 1000 / steps;
  const points: string[] = [];
  for (let x = 0; x <= 1000; x += 5) {
    const phase = ((x - column / 2) / column) * Math.PI;
    const y = DOT + AMPLITUDE - AMPLITUDE * Math.cos(phase);
    points.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`);
  }
  return points.join(" ");
}

/**
 * Purchase: Choose → Get advice → Install → Own. Rental adds site assessment and ongoing service. Laid out as
 * StomDent's numbered advantages: thin brand-blue numerals strung along a wave that draws itself on scroll.
 */
export function HowItWorks({ initial = "buy" }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const steps = howItWorks[mode];

  return (
    <section id="how-it-works" className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          layout="split"
          eyebrow="How it works"
          title={
            <>
              From first question to <Highlight>pure water</Highlight> on tap
            </>
          }
          action={
            <div role="group" aria-label="Show the steps for" className="inline-flex w-fit rounded-full border border-line bg-white p-1">
              {(["buy", "rent"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  onClick={() => setMode(option)}
                  className={cn(
                    "h-11 cursor-pointer rounded-full px-6 text-sm font-semibold transition-colors duration-200",
                    mode === option ? "bg-deep text-white" : "text-deep hover:bg-tint",
                  )}
                >
                  {option === "buy" ? "Buying" : "Renting"}
                </button>
              ))}
            </div>
          }
        />

        <div data-draw-trigger className="relative mt-14 lg:mt-20">
          {/* Large screens: the wave runs through every step's dot. */}
          <svg
            aria-hidden
            viewBox={`0 0 1000 ${HEIGHT}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 hidden w-full overflow-visible text-brand lg:block"
            style={{ height: HEIGHT }}
          >
            <path d={wave(steps.length)} fill="none" stroke="currentColor" strokeWidth="2" data-draw data-draw-start="top 80%" data-draw-end="bottom 70%" />
          </svg>
          {/* Phones and tablets: a straight line down the left. An svg doesn't stretch between top and bottom, so
              it gets an explicit height. */}
          <svg
            aria-hidden
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute top-2 left-[7px] h-[calc(100%-1rem)] w-0.5 text-brand lg:hidden"
          >
            <line x1="1" y1="0" x2="1" y2="100" stroke="currentColor" strokeWidth="2" data-draw data-draw-start="top 80%" data-draw-end="bottom 60%" />
          </svg>

          <ol key={mode} className={cn("grid gap-10 lg:gap-6", mode === "buy" ? "lg:grid-cols-4" : "lg:grid-cols-5")}>
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="relative animate-fade-up pl-10 lg:pl-0 lg:odd:pt-0 lg:even:pt-[88px]"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 grid size-4 place-items-center rounded-full border-2 border-brand bg-white lg:relative lg:mx-auto"
                >
                  <span className={cn("size-1.5 rounded-full", i === steps.length - 1 ? "bg-deep" : "bg-brand")} />
                </span>
                <div className="lg:mt-8 lg:text-center">
                  <span aria-hidden className="block font-sans text-[3.5rem] leading-none font-extralight tracking-[-0.04em] text-brand lg:text-[4.25rem]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="sr-only">Step {i + 1}: </span>
                  <span className="mt-4 block font-display text-h3 font-bold text-ink">{step.title}</span>
                  <span className="mt-2 block text-[15px] leading-relaxed text-muted lg:mx-auto lg:max-w-[15rem]">{step.body}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
