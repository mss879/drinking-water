import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaBand } from "@/components/sections/cta-band";
import { HeroMedia, PageHero } from "@/components/sections/page-hero";
import { SolutionsTrio } from "@/components/sections/solutions-trio";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { Logo } from "@/components/ui/logo";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { photos } from "@/content/images";
import { rentalPlans } from "@/content/pricing";
import { products } from "@/content/products";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About LUSAKO",
  description:
    "LUSAKO is a water purification and hydration solutions company in Sri Lanka: LUSAKO Water Purifiers to buy, LUSAKO Hydration Solutions to rent, and LUSAKO Care for service.",
  path: "/about",
});

// Family order as written in the brand architecture (brief Doc 1).
const familyOrder = ["AquaElite", "AquaPrime", "AquaSignature", "AquaSpark", "AquaServe"];
const rank = (family: string) => (familyOrder.includes(family) ? familyOrder.indexOf(family) : familyOrder.length);
const families = Array.from(new Set(products.map((product) => product.family))).sort((a, b) => rank(a) - rank(b));

type Division = {
  division: string;
  brand: string;
  summary: string;
  items: string[];
  journey?: string[];
  href: string;
  cta: string;
  tone: "outline" | "tint" | "deep";
};

/** LUSAKO brand architecture: DIRECT SALES · RENTAL · SERVICE (brief Doc 1). */
const divisions: Division[] = [
  {
    division: "Direct sales",
    brand: "LUSAKO Water Purifiers",
    summary: "Purification systems you own, backed by warranty and LUSAKO after-sales service.",
    items: families,
    journey: ["Buy", "Own", "Service"],
    href: "/water-purifiers",
    cta: "Explore purifiers",
    tone: "outline",
  },
  {
    division: "Rental",
    brand: "LUSAKO Hydration Solutions",
    summary: "Complete hydration for one predictable monthly payment, maintained by LUSAKO.",
    items: rentalPlans.map((plan) => `${plan.name} · ${plan.filtration === "UF + Sparkling" ? plan.bestFor : plan.stages}`),
    journey: ["Rent", "Use", "We maintain"],
    href: "/rental",
    cta: "Explore rental",
    tone: "tint",
  },
  {
    division: "Service",
    brand: "LUSAKO Care",
    summary: "Professional installation, maintenance and technical support for purchased and rented systems.",
    items: ["Installation", "Preventive maintenance", "Filter replacement", "Technical service", "Water testing", "AMC", "Relocation"],
    href: "/service-support",
    cta: "Service & support",
    tone: "deep",
  },
];

const tones = {
  outline: { card: "card-line text-ink", sub: "text-muted", micro: "text-deep", pill: "tint" },
  tint: { card: "rounded-card bg-tint-2 text-ink", sub: "text-muted", micro: "text-deep", pill: "white" },
  deep: { card: "rounded-card bg-deep text-white", sub: "text-white", micro: "text-white", pill: "glass" },
} as const;

const promise = [
  { title: "Buy", body: "Own your water purification system." },
  { title: "Rent", body: "Get complete hydration for one predictable monthly payment." },
  { title: "Care", body: "Professional installation, maintenance and technical support." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "About LUSAKO", href: "/about" }]}
        eyebrow="About LUSAKO"
        title={
          <>
            Better water. <Highlight>Better way.</Highlight>
          </>
        }
        description="From homes to offices and large organisations, LUSAKO provides the right purification technology, the right equipment and the right service for your water needs."
      >
        <HeroMedia image={photos.corporateTeam} priority />
      </PageHero>

      <section className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12" data-no-reveal>
          <div data-reveal="up" className="flex flex-col items-start gap-5 sm:flex-row sm:items-center lg:col-span-4 lg:flex-col lg:items-start">
            <span className="relative block size-28 shrink-0 overflow-hidden rounded-full border border-line p-2 sm:size-40 lg:size-56">
              <span className="relative block size-full overflow-hidden rounded-full">
                <Image src={photos.waterPour.src} alt="" fill sizes="224px" data-no-parallax className="scale-[1.12] object-cover" />
              </span>
            </span>
            <p className="label max-w-xs">
              {site.name} · {site.descriptor}
            </p>
          </div>
          <div className="lg:col-span-8">
            <h2 data-reveal="up" className="font-display text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] leading-[1.12] font-semibold tracking-[-0.025em] text-ink">
              LUSAKO is a water purification and hydration solutions company.{" "}
              <span className="block text-brand">Not simply a seller of purifiers.</span>
            </h2>
            <p data-reveal="up" className="mt-6 max-w-2xl text-lead text-muted">
              We help homes, offices and organisations move beyond bottled-water deliveries to purified water on tap, and we look after it
              long after installation.
            </p>
            <dl data-stagger className="mt-10 grid gap-3 sm:grid-cols-3">
              {promise.map((item) => (
                <div key={item.title} className="card-line p-6">
                  <dt className="font-display text-2xl font-bold text-brand">{item.title}</dt>
                  <dd className="mt-3 text-[15px] leading-snug text-ink">{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Brand architecture"
            title={
              <>
                Three business pillars, <Highlight>one brand</Highlight>
              </>
            }
            description="Direct sales, rental and service, each with a clear journey. Together they make BUY | RENT | CARE."
          />

          <div className="mt-14 flex flex-col items-center">
            <div className="flex items-center gap-4 rounded-full bg-deep py-4 pr-7 pl-6 text-left text-white">
              <Logo inverted title="LUSAKO" className="h-6 w-auto" />
              <span aria-hidden className="h-7 w-px bg-white/30" />
              <span className="text-sm font-medium text-white">{site.descriptor}</span>
            </div>
            <span aria-hidden className="h-10 w-px bg-brand/40" />
          </div>

          <div className="relative lg:pt-10">
            <span
              aria-hidden
              className="absolute top-0 right-[calc((100%_-_2rem)/6)] left-[calc((100%_-_2rem)/6)] hidden h-px bg-brand/40 lg:block"
            />
            <ul className="grid gap-4 lg:grid-cols-3">
              {divisions.map((division) => {
                const tone = tones[division.tone];
                return (
                  <li key={division.division} className="relative">
                    <span aria-hidden className="absolute -top-10 left-1/2 hidden h-10 w-px bg-brand/40 lg:block" />
                    <article className={cn("relative flex h-full flex-col overflow-hidden p-7 sm:p-8", tone.card)}>
                      {division.tone === "deep" && <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />}
                      <p className={cn("relative font-display text-xs font-bold tracking-[0.18em] uppercase", tone.micro)}>{division.division}</p>
                      <h3 className="relative mt-3 font-display text-h3 font-bold">{division.brand}</h3>
                      <p className={cn("relative mt-2 text-[15px] leading-relaxed", tone.sub)}>{division.summary}</p>
                      <ul className="relative mt-6 flex flex-wrap gap-2">
                        {division.items.map((item) => (
                          <li key={item}>
                            <Pill variant={tone.pill}>{item}</Pill>
                          </li>
                        ))}
                      </ul>
                      {division.journey && (
                        <>
                          <p className={cn("relative mt-7 font-display text-xs font-bold tracking-[0.18em] uppercase", tone.micro)}>Journey</p>
                          <ol className="relative mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium">
                            {division.journey.map((stage, i) => (
                              <li key={stage} className="flex items-center gap-2">
                                {i > 0 && <ArrowRight aria-hidden className="size-4 text-brand" />}
                                {stage}
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                      <Link href={division.href} className="group relative mt-auto inline-flex w-fit items-center gap-2 pt-8 text-[15px] font-semibold">
                        {division.cta}
                        <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:rotate-45" />
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      <SolutionsTrio />
      <CtaBand />
    </>
  );
}
