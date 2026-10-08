import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { SolutionsTrio } from "@/components/sections/solutions-trio";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Logo } from "@/components/ui/logo";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { aboutArchitecture, aboutHero, aboutIntro, aboutSeo } from "@/content/copy/about";
import type { RentalPlan } from "@/content/pricing";
import { site } from "@/content/site";
import { getCopy, getPhotos, getProducts, getRentalPlans } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(aboutSeo);
  return pageMetadata({ title: seo.title, absolute: true, description: seo.description, path: "/about" });
}

// Family order as written in the brand architecture (brief Doc 1); families added in the admin follow.
const familyOrder = ["AquaElite", "AquaPrime", "AquaSignature", "AquaSpark"];
const rank = (family: string) => (familyOrder.includes(family) ? familyOrder.indexOf(family) : familyOrder.length);

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

type ArchitectureCopy = typeof aboutArchitecture.defaults;

/**
 * LUSAKO brand architecture: DIRECT SALES · RENTAL · SERVICE (brief Doc 1). The cards' wording is the
 * about.architecture block; each card's tags, link and colours stay with its place.
 */
const divisionsFor = (families: string[], plans: RentalPlan[], copy: ArchitectureCopy): Division[] => {
  const [sales, rental, service] = copy.divisions;
  return [
    {
      division: sales.label,
      brand: sales.brand,
      summary: sales.summary,
      items: families,
      journey: copy.salesJourney,
      href: "/water-purifiers",
      cta: sales.link,
      tone: "outline",
    },
    {
      division: rental.label,
      brand: rental.brand,
      summary: rental.summary,
      items: plans.map((plan) => `${plan.name} · ${plan.filtration === "UF + Sparkling" ? plan.bestFor : plan.stages}`),
      journey: copy.rentalJourney,
      href: "/rental",
      cta: rental.link,
      tone: "tint",
    },
    {
      division: service.label,
      brand: service.brand,
      summary: service.summary,
      items: copy.serviceTags,
      href: "/service-support",
      cta: service.link,
      tone: "deep",
    },
  ];
};

const tones = {
  outline: { card: "card-line text-ink", sub: "text-muted", micro: "text-deep", pill: "tint" },
  tint: { card: "rounded-card bg-tint-2 text-ink", sub: "text-muted", micro: "text-deep", pill: "white" },
  deep: { card: "rounded-card bg-deep text-white", sub: "text-white", micro: "text-white", pill: "glass" },
} as const;

export default async function AboutPage() {
  const [photos, products, plans, hero, intro, architecture] = await Promise.all([
    getPhotos(),
    getProducts(),
    getRentalPlans(),
    getCopy(aboutHero),
    getCopy(aboutIntro),
    getCopy(aboutArchitecture),
  ]);
  const families = Array.from(new Set(products.map((product) => product.family).filter(Boolean))).sort((a, b) => rank(a) - rank(b));
  const divisions = divisionsFor(families, plans, architecture);
  return (
    <>
      <PageHero
        crumbs={[{ label: "About LUSAKO", href: "/about" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        image={{ src: photos.pageAbout.src, position: "object-right" }}
      />

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
              {intro.statement[0]}{" "}
              <span className="block text-brand">{intro.statement[1]}</span>
            </h2>
            <p data-reveal="up" className="mt-6 max-w-2xl text-lead text-muted">
              {intro.description}
            </p>
            <dl data-stagger className="mt-10 grid gap-3 sm:grid-cols-3">
              {intro.promises.map((item, i) => (
                <div key={i} className="card-line p-6">
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
            eyebrow={architecture.eyebrow}
            title={marked(architecture.title)}
            description={architecture.description}
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
                  <li key={division.tone} className="relative">
                    <span aria-hidden className="absolute -top-10 left-1/2 hidden h-10 w-px bg-brand/40 lg:block" />
                    <article className={cn("relative flex h-full flex-col overflow-hidden p-7 sm:p-8", tone.card)}>
                      {division.tone === "deep" && <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />}
                      <p className={cn("relative font-display text-xs font-bold tracking-[0.18em] uppercase", tone.micro)}>{division.division}</p>
                      <h3 className="relative mt-3 font-display text-h3 font-bold">{division.brand}</h3>
                      <p className={cn("relative mt-2 text-[15px] leading-relaxed", tone.sub)}>{division.summary}</p>
                      <ul className="relative mt-6 flex flex-wrap gap-2">
                        {division.items.map((item, i) => (
                          <li key={i}>
                            <Pill variant={tone.pill}>{item}</Pill>
                          </li>
                        ))}
                      </ul>
                      {division.journey && (
                        <>
                          <p className={cn("relative mt-7 font-display text-xs font-bold tracking-[0.18em] uppercase", tone.micro)}>{architecture.journeyLabel}</p>
                          <ol className="relative mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium">
                            {division.journey.map((stage, i) => (
                              <li key={i} className="flex items-center gap-2">
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
