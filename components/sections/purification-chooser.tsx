import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPhotos } from "@/lib/cms/content";
import { rentalPlans } from "@/content/pricing";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

const cards = [
  { id: "pureflow-uf", source: "City water", letters: "UF", name: "Ultrafiltration", dark: false },
  { id: "pureflow-ro", source: "Well water / higher TDS", letters: "RO", name: "Reverse osmosis", dark: true },
] as const;

/**
 * "Which Purification System Is Right for You?" City water → UF, well water / higher TDS → RO, with CHECK MY
 * WATER leading into Find My Solution (brief Doc 1 §14). The two cards slide in towards each other on scroll.
 * On the home page the cards leave out the stage count and the rental price (client request); the rental page
 * shows both.
 */
export async function PurificationChooser({ context = "home" }: { context?: "home" | "rental" }) {
  const rental = context === "rental";
  const photos = await getPhotos();
  return (
    <section id="purification" className="overflow-x-clip py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          layout="split"
          eyebrow="Choose your purification"
          title={
            <>
              Which purification system is <Highlight>right for you?</Highlight>
            </>
          }
          description="You don’t need to be a water expert. Tell us where your water comes from and we match the right technology."
        />

        <div data-no-reveal className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-5">
          {cards.map((card) => {
            const plan = rentalPlans.find((p) => p.id === card.id)!;
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
                  {card.source} → {card.letters}
                </Pill>
                <div className="relative mt-auto pt-24">
                  <h3 className="font-display text-[clamp(2rem,1.6rem+1.5vw,2.75rem)] leading-tight font-bold tracking-[-0.02em]">
                    {rental ? plan.name : card.name}
                  </h3>
                  <p className={cn("mt-2 text-lg", card.dark ? "text-white" : "text-muted")}>
                    {rental ? `${plan.stages} · ${plan.bestFor}.` : `${plan.bestFor}.`}
                  </p>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
                    {rental && (
                      <p>
                        <span className={cn("block text-sm", card.dark ? "text-white" : "text-muted")}>Rental from</span>
                        <span className="font-display text-3xl font-bold">{plan.fromMonthly ? formatLKR(plan.fromMonthly) : "On request"}</span>
                        <span className={cn("text-sm", card.dark ? "text-white" : "text-muted")}> /month + VAT</span>
                      </p>
                    )}
                    <ButtonLink
                      href={rental ? `/contact?type=rental&preferredSolution=${card.id}` : `/water-purifiers#uf-or-ro`}
                      variant={card.dark ? "white" : "primary"}
                      arrow
                    >
                      {rental ? `Rent ${plan.name}` : `Explore ${card.letters}`}
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
              Not sure about your water?
              <span className="mt-1 block font-sans text-[15px] font-normal text-balance text-muted">Answer three quick questions and we’ll recommend UF or RO.</span>
            </p>
          </div>
          <ButtonLink href="/find-my-solution" arrow className="w-full sm:w-auto">
            Check my water
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
