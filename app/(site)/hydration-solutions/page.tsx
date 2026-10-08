import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { SolutionsTrio } from "@/components/sections/solutions-trio";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { marked } from "@/components/ui/marked";
import { SectionHeading } from "@/components/ui/section-heading";
import { hydrationCare, hydrationHero, hydrationModels, hydrationSeo } from "@/content/copy/hydration";
import { fill } from "@/content/copy/schema";
import { planFor } from "@/content/pricing";
import { getCopy, getPhotos, getRentalPrices, getServices } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(hydrationSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/hydration-solutions" });
}

type Model = {
  id: "buy" | "rent" | "corporate";
  label: string;
  audience: string;
  promise: string;
  rows: { term: string; value: string }[];
  cta: string;
  href: string;
};

/** Where each model card leads, by position (the cards' wording is the hydration.models block). */
const modelLinks = [
  { id: "buy", href: "/water-purifiers" },
  { id: "rent", href: "/rental" },
  { id: "corporate", href: "/hydration-solutions/corporate" },
] as const;

export default async function HydrationSolutionsPage() {
  const [photos, services, rentalPrices, hero, modelsCopy, care] = await Promise.all([
    getPhotos(),
    getServices(),
    getRentalPrices(),
    getCopy(hydrationHero),
    getCopy(hydrationModels),
    getCopy(hydrationCare),
  ]);
  const rentFrom = rentalPrices.plans[planFor("UF").id];

  /** BUY | RENT | CORPORATE: how you pay and use the equipment (brief Doc 2 §8). */
  const models: Model[] = modelLinks.map(({ id, href }, i) => {
    const card = modelsCopy.cards[i];
    // The Rent card says what a month costs while the PureFlow UF price is shown.
    const pay = id === "rent" && typeof rentFrom === "number" ? fill(modelsCopy.rentPayWithPrice, { price: formatLKR(rentFrom) }) : card.pay;
    return {
      id,
      label: card.label,
      audience: card.audience,
      promise: card.promise,
      rows: [
        { term: modelsCopy.terms[0], value: pay },
        { term: modelsCopy.terms[1], value: card.bestFor },
        { term: modelsCopy.terms[2], value: card.care },
      ],
      cta: card.cta,
      href,
    };
  });

  return (
    <>
      <PageHero
        crumbs={[{ label: "Hydration solutions", href: "/hydration-solutions" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.chooseButton, href: "/find-my-solution" },
          { label: hero.quoteButton, href: "/contact" },
        ]}
        image={{ src: photos.pageHydration.src, position: "object-right" }}
      />

      <h2 className="sr-only">Hydration solutions for homes, offices and companies</h2>
      <SolutionsTrio showHeading={false} />

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={modelsCopy.eyebrow}
            title={marked(modelsCopy.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
            description={modelsCopy.description}
          />

          <ul className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-3 lg:gap-5">
            {models.map((model) => {
              const dark = model.id === "corporate";
              return (
                <li
                  key={model.id}
                  className={cn(
                    "group/card relative flex flex-col overflow-hidden p-6 transition-colors duration-300 sm:p-8",
                    model.id === "buy" && "card-line hover:border-brand hover:bg-tint",
                    model.id === "rent" && "rounded-card bg-tint-2 text-ink",
                    dark && "rounded-card bg-deep text-white",
                  )}
                >
                  {dark && <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />}
                  <div className="relative flex flex-wrap items-center justify-between gap-3">
                    <h3 className={cn("font-display text-[2rem] leading-none font-bold", dark ? "text-white" : "text-brand")}>{model.label}</h3>
                    <span className={cn("text-sm font-medium", dark ? "text-white" : "text-muted")}>{model.audience}</span>
                  </div>
                  <p className="relative mt-6 font-display text-xl leading-snug font-semibold">{model.promise}</p>
                  <dl className="relative mt-6 grid gap-4">
                    {model.rows.map((row, i) => (
                      <div key={i} className={cn("border-t pt-4", dark ? "border-white/20" : "border-line")}>
                        <dt className={cn("font-display text-xs font-bold tracking-[0.14em] uppercase", dark ? "text-white" : "text-deep")}>
                          {row.term}
                        </dt>
                        <dd className="mt-1 text-[15px] leading-relaxed">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={model.href}
                    className="mt-auto flex items-center justify-between gap-4 pt-10 text-sm font-semibold after:absolute after:inset-0 after:rounded-card"
                  >
                    {model.cta}
                    <ArrowCircle variant={dark ? "white" : "deep"} className="relative" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="py-16 md:py-20 lg:py-28">
        <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16" data-no-reveal>
          <div data-reveal="up" className="relative aspect-[4/5] overflow-hidden rounded-card-xl bg-tint-2 sm:aspect-[4/3] lg:col-span-6 lg:aspect-[5/6]">
            <Image
              src={photos.careTechnician.src}
              alt={photos.careTechnician.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[40%_50%]"
            />
            <span className="absolute bottom-4 left-4 rounded-card-sm bg-white px-5 py-4 pr-6 shadow-float">
              <span className="block font-display text-[15px] leading-tight font-bold text-ink">{care.captionTitle}</span>
              <span className="block text-xs text-muted">{care.captionText}</span>
            </span>
          </div>

          <div className="lg:col-span-6">
            <SectionHeading eyebrow={care.eyebrow} title={marked(care.title)} description={care.description} />
            <ul className="mt-8 flex flex-wrap gap-2">
              {services.map(({ id, title, icon: Icon }) => (
                <li key={id} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-ink">
                  <Icon aria-hidden className="size-4 text-deep" strokeWidth={1.75} />
                  {title}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">{care.note}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/service-support" variant="primary" arrow>
                {care.careButton}
              </ButtonLink>
              <ButtonLink href="/contact?type=service" variant="outline" arrow>
                {care.serviceButton}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
