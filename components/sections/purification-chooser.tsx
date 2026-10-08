import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { sharedPurificationChooser } from "@/content/copy/shared";
import { getCopy, getPhotos, getRentalPlans, getRentalPrices } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

/** The two cards in order (their wording is the block's `cards`, in the same order). */
const cards = [
  { id: "pureflow-uf", letters: "UF", dark: false },
  { id: "pureflow-ro", letters: "RO", dark: true },
] as const;

/**
 * "Which Purification System Is Right for You?" City water → UF, well water / higher TDS → RO, with CHECK MY
 * WATER leading into Find My Solution (brief Doc 1 §14). The two cards slide in towards each other on scroll.
 * On the home page the cards leave out the stage count (client request); the rental page shows it, and each plan's
 * monthly price when the admin switches it on in Prices & quotes (else the card just asks for a quote). Its wording
 * is the shared block; the plan names and lines come from Rental plans.
 */
export async function PurificationChooser({ context = "home" }: { context?: "home" | "rental" }) {
  const rental = context === "rental";
  const [photos, copy, plans, prices] = await Promise.all([getPhotos(), getCopy(sharedPurificationChooser), getRentalPlans(), getRentalPrices()]);
  return (
    <section id="purification" className="overflow-x-clip py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading layout="split" eyebrow={copy.eyebrow} title={marked(copy.title)} description={copy.description} />

        <div data-no-reveal className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-5">
          {cards.map((card, i) => {
            const plan = plans.find((p) => p.id === card.id)!;
            const words = copy.cards[i];
            const price = rental ? prices.plans[card.id] : undefined;
            return (
              <article
                key={card.id}
                id={card.id}
                data-slide={card.dark ? "right" : "left"}
                className={cn(
                  "relative flex min-h-[27rem] flex-col overflow-hidden p-7 sm:p-10",
                  card.dark ? "rounded-card bg-deep text-white" : "card-line",
                )}
              >
                <WaveLines lines={4} className={cn("absolute inset-x-0 bottom-0 h-1/2 w-full", card.dark ? "text-white/20" : "text-brand/35")} />
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-14 right-5 font-display text-[7rem] leading-none font-extrabold tracking-[-0.05em] text-outline [--outline-w:1.5px] sm:top-3 sm:right-6 sm:text-[11rem]",
                    card.dark ? "[--outline-c:var(--color-mist)]" : "[--outline-c:var(--color-line)]",
                  )}
                >
                  {card.letters}
                </span>
                <Pill variant={card.dark ? "glass" : "tint"} className="relative">
                  {words.source} → {card.letters}
                </Pill>
                <div className="relative mt-auto pt-24">
                  <h3 className="font-display text-[clamp(2rem,1.6rem+1.5vw,2.75rem)] leading-tight font-bold tracking-[-0.02em]">
                    {rental ? plan.name : words.name}
                  </h3>
                  <p className={cn("mt-2 text-lg", card.dark ? "text-white" : "text-muted")}>
                    {rental ? `${plan.stages} · ${plan.bestFor}.` : `${plan.bestFor}.`}
                  </p>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
                    {typeof price === "number" && (
                      <p>
                        <span className={cn("block text-sm", card.dark ? "text-white" : "text-muted")}>{copy.priceLabel}</span>
                        <span className="font-display text-3xl font-bold">{formatLKR(price)}</span>
                        <span className={cn("text-sm", card.dark ? "text-white" : "text-muted")}> /month + VAT</span>
                      </p>
                    )}
                    <ButtonLink
                      href={rental ? `/contact?type=rental&preferredSolution=${card.id}#quote` : `/water-purifiers#uf-or-ro`}
                      variant={card.dark ? "white" : "primary"}
                      arrow
                    >
                      {rental ? (
                        <>
                          {copy.quoteButton}
                          <span className="sr-only"> for {plan.name} rental</span>
                        </>
                      ) : (
                        words.button
                      )}
                    </ButtonLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div
          data-reveal="up"
          className="card-line mt-4 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:mt-5 lg:pr-8"
        >
          <div className="flex items-center gap-5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full sm:size-20">
              <Image src={photos.waterTest.src} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <p className="font-display text-xl leading-snug font-semibold text-ink">
              {copy.stripTitle}
              <span className="mt-1 block font-sans text-[15px] font-normal text-balance text-muted">{copy.stripText}</span>
            </p>
          </div>
          <ButtonLink href="/find-my-solution" arrow className="w-full sm:w-auto">
            {copy.stripButton}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
