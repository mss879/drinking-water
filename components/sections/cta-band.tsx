import type { ReactNode } from "react";
import { splitWords } from "@/components/motion/split-words";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";

/**
 * Closing call to action, after GrowSphere's full-width blue statement band: the big statement sits on the main
 * blue, the smaller text on the deep blue it fades into, and the band opens out to the full width on scroll.
 * Place it last on a page, just above the footer.
 */
export function CtaBand({
  eyebrow = "Find my solution",
  title = (
    <>
      Need help choosing?
      <br className="hidden sm:block" /> We’ll recommend the right system.
    </>
  ),
  description = "Tell us your location, water source, customer type and preferred solution. LUSAKO recommends the appropriate system.",
  href = "/find-my-solution",
  buttonLabel = "Find my solution",
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  href?: string;
  buttonLabel?: string;
}) {
  return (
    <section className="pt-6 lg:pt-8">
      <div
        data-expand="full"
        className="relative isolate overflow-hidden bg-linear-to-br from-brand from-35% to-deep to-75% py-16 text-white md:py-20 lg:py-28"
      >
        <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/25" />
        <Container className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12" data-no-reveal>
          <div className="lg:col-span-8">
            <span className="grid size-16 place-items-center rounded-full border border-white/40 bg-white/10 backdrop-blur-md">
              <BrandIcon name="drop" size={40} />
            </span>
            <p className="mt-8 w-fit rounded-full bg-deep px-3.5 py-1.5 font-display text-xs font-bold tracking-[0.16em] uppercase">
              {eyebrow}
            </p>
            <h2 data-split className="split mt-5 font-display text-[length:clamp(2rem,1.3rem+2.2vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.025em]">
              {splitWords(title)}
            </h2>
          </div>
          <div data-reveal="up" className="flex flex-col gap-8 lg:col-span-4 lg:pb-2">
            <p className="max-w-md text-lead text-white">{description}</p>
            <ButtonLink href={href} variant="white" size="lg" arrow className="w-full sm:w-fit">
              {buttonLabel}
            </ButtonLink>
          </div>
        </Container>
      </div>
    </section>
  );
}
