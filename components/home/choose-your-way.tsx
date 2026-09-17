import Image from "next/image";
import Link from "next/link";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { SnapRow } from "@/components/ui/snap-row";
import { planFor } from "@/content/pricing";
import { getProduct } from "@/content/products";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

/** BUY | RENT | CARE (+ CORPORATE) — the reference "Our Projects" card row. */
export function ChooseYourWay() {
  const featured = getProduct("aquaelite-3x")!;
  const from = planFor("UF").fromMonthly;

  const cards = [
    {
      title: "Rent",
      line: "Complete hydration for one predictable monthly payment.",
      meta: from ? `From ${formatLKR(from)}/month + VAT` : "Monthly plans",
      cta: "Explore rental",
      href: "/rental",
      dark: false,
    },
    {
      title: "Care",
      line: "Professional installation, maintenance and technical support.",
      meta: "LUSAKO Care",
      cta: "Service & support",
      href: "/service-support",
      dark: false,
    },
    {
      title: "Corporate",
      line: "One partner for your workplace hydration, across one site or many.",
      meta: "Corporate Hydration Solutions",
      cta: "Talk to our team",
      href: "/hydration-solutions/corporate",
      dark: true,
    },
  ];

  return (
    <section className="py-14 lg:py-20">
      <Container>
        <SectionHeading
          eyebrow="Choose your way"
          title={
            <>
              Buy it. Rent it. <Highlight>We take care of it.</Highlight>
            </>
          }
        />
      </Container>

      <SnapRow label="Ways to choose LUSAKO" className="mt-12">
        <li className="w-[88vw] shrink-0 snap-start sm:w-[600px]">
          <Link
            href="/water-purifiers"
            className="group/card grid h-full min-h-[21rem] gap-6 rounded-card-xl bg-frost p-6 transition-colors duration-300 hover:bg-ice sm:grid-cols-[1.1fr_1fr] sm:p-7"
          >
            <div className="flex flex-col">
              <h3 className="text-h3 font-medium text-ink">Buy</h3>
              <p className="mt-1 text-[15px] text-ink">Own your water purification system.</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Invest once in a LUSAKO purification system and enjoy reliable purified water for years.
              </p>
              <span className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm font-medium text-ink">
                Explore purifiers
                <ArrowCircle />
              </span>
            </div>
            <div className="relative min-h-56 overflow-hidden rounded-card bg-pastel">
              <Rings className="absolute -right-12 -bottom-12 size-72 text-white" />
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="(min-width: 640px) 280px, 80vw"
                className="object-contain p-7 transition-transform duration-500 ease-emph group-hover/card:scale-105"
              />
            </div>
          </Link>
        </li>

        {cards.map((card) => (
          <li key={card.title} className="w-[78vw] shrink-0 snap-start sm:w-[340px]">
            <Link
              href={card.href}
              className={cn(
                "group/card relative flex h-full min-h-[21rem] flex-col overflow-hidden rounded-card-xl p-6 sm:p-7",
                card.dark ? "bg-ocean text-white" : "bg-pastel text-ink",
              )}
            >
              <span aria-hidden className={cn("absolute -right-16 -bottom-20 size-64 rounded-full", card.dark ? "bg-white/10" : "bg-white/45")} />
              <span aria-hidden className={cn("absolute right-20 bottom-28 size-14 rounded-full", card.dark ? "bg-white/10" : "bg-white/60")} />
              <h3 className="relative w-fit rounded-full bg-white px-4 py-2 text-xl font-medium text-ink">{card.title}</h3>
              <p className="relative mt-6 text-lg leading-snug">{card.line}</p>
              <p className={cn("relative mt-3 text-sm", card.dark ? "text-white/70" : "text-muted")}>{card.meta}</p>
              <span className="relative mt-auto flex items-center justify-between gap-4 pt-8 text-sm font-medium">
                {card.cta}
                <ArrowCircle />
              </span>
            </Link>
          </li>
        ))}
      </SnapRow>
    </section>
  );
}
