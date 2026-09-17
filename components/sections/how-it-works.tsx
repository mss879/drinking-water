"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { howItWorks } from "@/content/services";
import { cn } from "@/lib/cn";

type Mode = keyof typeof howItWorks;

/** Purchase: Choose → Get advice → Install → Own. Rental adds site assessment and ongoing service. */
export function HowItWorks({ initial = "buy" }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const steps = howItWorks[mode];

  return (
    <section id="how-it-works" className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                From first question to <Highlight>pure water</Highlight> on tap
              </>
            }
          />
          <div role="group" aria-label="Show the steps for" className="inline-flex w-fit rounded-full bg-frost p-1">
            {(["buy", "rent"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
                className={cn(
                  "h-11 cursor-pointer rounded-full px-6 text-[15px] font-medium transition-colors duration-200",
                  mode === option ? "bg-ink text-white" : "text-ink hover:bg-white",
                )}
              >
                {option === "buy" ? "Buying" : "Renting"}
              </button>
            ))}
          </div>
        </div>

        <div aria-hidden className="mt-12 h-0.5 overflow-hidden rounded-full bg-line">
          <div data-progress className="h-full rounded-full bg-brand" />
        </div>
        <ol key={mode} className={cn("mt-6 grid gap-4 sm:grid-cols-2", mode === "buy" ? "lg:grid-cols-4" : "lg:grid-cols-5")}>
          {steps.map((step, i) => (
            <li
              key={step.title}
              className={cn("flex min-h-48 animate-fade-up flex-col rounded-card p-6 sm:min-h-60", i === steps.length - 1 ? "bg-pastel" : "bg-frost")}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span aria-hidden className="text-[3.25rem] leading-none font-medium tracking-[-0.04em] text-outline [--outline-c:var(--color-brand)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="sr-only">Step {i + 1}: </span>
              <span className="mt-auto pt-6 text-h3 font-medium text-ink sm:pt-10">{step.title}</span>
              <span className="mt-2 text-sm leading-relaxed text-muted">{step.body}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
