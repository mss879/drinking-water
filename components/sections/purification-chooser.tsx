import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { photos } from "@/content/images";
import { rentalPlans } from "@/content/pricing";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

const cards = [
  { id: "pureflow-uf", source: "City water", letters: "UF", dark: false },
  { id: "pureflow-ro", source: "Well water / higher TDS", letters: "RO", dark: true },
] as const;

/**
 * "Which Purification System Is Right for You?" City water → UF, well water / higher TDS → RO,
 * with CHECK MY WATER leading into Find My Solution (brief Doc 1 §14).
 */
export function PurificationChooser({ context = "home" }: { context?: "home" | "rental" }) {
  return (
    <section id="purification" className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Choose your purification"
            title={
              <>
                Which purification system is <Highlight>right for you?</Highlight>
              </>
            }
          />
          <p className="max-w-sm text-muted lg:pb-2">
            You don’t need to be a water expert. Tell us where your water comes from and we match the right technology.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {cards.map((card) => {
            const plan = rentalPlans.find((p) => p.id === card.id)!;
            return (
              <article
                key={card.id}
                id={card.id}
                className={cn(
                  "relative flex min-h-[26rem] flex-col overflow-hidden rounded-card-xl p-7 sm:p-10",
                  card.dark ? "bg-ocean text-white" : "bg-pastel text-ink",
                )}
              >
                <Rings className={cn("absolute -right-24 -bottom-24 size-[26rem]", card.dark ? "text-aqua/25" : "text-white")} />
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-4 right-7 text-[8.5rem] leading-none font-semibold tracking-[-0.06em] text-outline sm:text-[11rem]",
                    card.dark ? "[--outline-c:rgb(255_255_255/0.28)]" : "[--outline-c:rgb(10_31_61/0.16)]",
                  )}
                >
                  {card.letters}
                </span>
                <Pill variant={card.dark ? "glass" : "white"} className="relative">
                  {card.source} → {card.letters}
                </Pill>
                <div className="relative mt-auto pt-24">
                  <h3 className="text-[clamp(2rem,1.6rem+1.5vw,2.75rem)] leading-tight font-medium tracking-[-0.03em]">{plan.name}</h3>
                  <p className={cn("mt-2 text-lg", card.dark ? "text-white/80" : "text-muted")}>
                    {plan.stages} · {plan.bestFor}.
                  </p>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
                    <p>
                      <span className={cn("block text-sm", card.dark ? "text-white/70" : "text-muted")}>Rental from</span>
                      <span className="text-2xl font-medium">{plan.fromMonthly ? formatLKR(plan.fromMonthly) : "On request"}</span>
                      <span className={cn("text-sm", card.dark ? "text-white/70" : "text-muted")}> /month + VAT</span>
                    </p>
                    <ButtonLink
                      href={context === "rental" ? `/contact?type=rental&preferredSolution=${card.id}` : `/rental#${card.id}`}
                      variant={card.dark ? "white" : "dark"}
                      arrow
                    >
                      {context === "rental" ? `Rent ${plan.name}` : `Explore ${card.letters}`}
                    </ButtonLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-5 rounded-card-xl bg-frost p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:pr-8">
          <div className="flex items-center gap-5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full sm:size-20">
              <Image src={photos.waterTest.src} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <p className="text-lg leading-snug text-ink">
              Not sure about your water?
              <span className="block text-[15px] text-muted">Answer three quick questions and we’ll recommend UF or RO.</span>
            </p>
          </div>
          <ButtonLink href="/find-my-solution" variant="dark" arrow className="w-full sm:w-auto">
            Check my water
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
