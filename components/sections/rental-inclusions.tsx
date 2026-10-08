import { splitWords } from "@/components/motion/split-words";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rule } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import type { BrandIconName } from "@/content/brand-icons";
import { sharedRentalInclusions } from "@/content/copy/shared";
import { getCopy } from "@/lib/cms/content";

/** One 3D icon per inclusion, in the order of the block's inclusions (content/copy/shared.ts). */
const icons: BrandIconName[] = ["countertop", "wrench", "calendar", "filter", "headset", "shield"];

/**
 * "One monthly payment. Complete water care." as the GrowSphere capabilities list: the heading holds still on
 * the left while the six inclusions scroll past on the right, each with its 3D icon; dividers draw as they come in.
 * Its wording is the shared block; the closing qualifier stays as the brief words it.
 */
export async function RentalInclusions({ showCta = true }: { showCta?: boolean }) {
  const copy = await getCopy(sharedRentalInclusions);
  return (
    <section id="included" className="py-16 md:py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-10" data-no-reveal>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            {/* One idea per line: each sentence gets its own line at every width. */}
            <h2
              data-split
              className="split font-display text-[length:clamp(1.6rem,0.9rem+3.4vw,2.9rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink lg:text-[length:clamp(2.2rem,0.4rem+2.5vw,2.9rem)]"
            >
              {splitWords(
                <>
                  <span className="block whitespace-nowrap">{copy.title[0]}</span>{" "}
                  <Highlight className="block whitespace-nowrap">{copy.title[1]}</Highlight>
                </>,
              )}
            </h2>
            <p data-reveal="up" className="mt-6 max-w-sm leading-relaxed text-muted">
              {copy.intro}
            </p>
            {showCta && (
              <div data-reveal="up" className="mt-8">
                <ButtonLink href="/rental" arrow>
                  {copy.button}
                </ButtonLink>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <Rule />
          <ol data-stagger>
            {copy.items.map((item, i) => (
              <li key={i} className="group">
                <div className="grid grid-cols-[auto_1fr] gap-5 py-7 sm:gap-8 sm:py-9">
                  <div className="flex items-start gap-5 sm:gap-8">
                    <span className="grid size-16 place-items-center rounded-card-sm bg-tint sm:size-20">
                      <BrandIcon name={icons[i]} size={56} className="sm:size-16" />
                    </span>
                    <span aria-hidden className="h-full w-px bg-line" />
                  </div>
                  <div>
                    <h3 className="font-display text-h3 font-semibold text-ink">{item.lead}</h3>
                    <p className="mt-2 max-w-lg leading-relaxed text-muted">
                      <strong className="font-semibold text-deep">{item.title}.</strong> {item.body}
                    </p>
                  </div>
                </div>
                <Rule />
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">Exact inclusions are confirmed in your rental agreement.</p>
        </div>
      </Container>
    </section>
  );
}
