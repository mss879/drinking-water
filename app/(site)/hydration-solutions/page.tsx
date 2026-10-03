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
import { SectionHeading } from "@/components/ui/section-heading";
import { getPhotos } from "@/lib/cms/content";
import { planFor } from "@/content/pricing";
import { services } from "@/content/services";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { heroImages } from "@/content/images";

export const metadata: Metadata = pageMetadata({
  title: "Hydration Solutions",
  description:
    "LUSAKO Hydration Solutions: buy a water purifier for your home, rent for your office, or let LUSAKO manage drinking water across your whole organisation.",
  path: "/hydration-solutions",
});

type Model = {
  id: "buy" | "rent" | "corporate";
  label: string;
  audience: string;
  promise: string;
  rows: { term: string; value: string }[];
  cta: string;
  href: string;
};

export default async function HydrationSolutionsPage() {
  const photos = await getPhotos();
  const rentFrom = planFor("UF").fromMonthly;

  /** BUY | RENT | CORPORATE: how you pay and use the equipment (brief Doc 2 §8). */
  const models: Model[] = [
    {
      id: "buy",
      label: "Buy",
      audience: "For homes",
      promise: "Own your water purification system.",
      rows: [
        { term: "How you pay", value: "A one-time purchase" },
        { term: "Best for", value: "Homes and long-term ownership" },
        { term: "Looking after it", value: "Product warranty, with LUSAKO Care service plans and AMC available" },
      ],
      cta: "Explore purifiers",
      href: "/water-purifiers",
    },
    {
      id: "rent",
      label: "Rent",
      audience: "For offices",
      promise: "Complete hydration for one predictable monthly payment.",
      rows: [
        { term: "How you pay", value: rentFrom ? `Monthly, from ${formatLKR(rentFrom)}/month + VAT` : "One predictable monthly payment" },
        { term: "Best for", value: "Offices and companies" },
        { term: "Looking after it", value: "Installation, maintenance and support according to your rental agreement" },
      ],
      cta: "Explore rental",
      href: "/rental",
    },
    {
      id: "corporate",
      label: "Corporate",
      audience: "For organisations",
      promise: "One partner for your organisation’s drinking water.",
      rows: [
        { term: "How you pay", value: "A custom quotation for multiple units" },
        { term: "Best for", value: "Organisations with one site or many" },
        { term: "Looking after it", value: "Maintenance and support according to contract, with centralised account management" },
      ],
      cta: "Talk to our team",
      href: "/hydration-solutions/corporate",
    },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: "Hydration solutions", href: "/hydration-solutions" }]}
        eyebrow="LUSAKO Hydration Solutions"
        title={["Better water,", <Highlight key="suits">the way that suits you</Highlight>]}
        description="Buy a purifier for your home, rent for your office, or let LUSAKO manage drinking water across your whole organisation."
        actions={[
          { label: "Help me choose", href: "/find-my-solution" },
          { label: "Get a quote", href: "/contact" },
        ]}
        image={{ src: heroImages.hydration, position: "object-right" }}
      />

      <h2 className="sr-only">Hydration solutions for homes, offices and companies</h2>
      <SolutionsTrio showHeading={false} />

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Buy | Rent | Corporate"
            title={
              <>
                Rental is how you pay. <Highlight className="inline-block">Hydration is what we deliver.</Highlight>
              </>
            }
            description="Buying, renting and corporate contracts describe how you pay for and use the equipment. A hydration solution is the complete service and outcome LUSAKO provides."
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
                    {model.rows.map((row) => (
                      <div key={row.term} className={cn("border-t pt-4", dark ? "border-white/20" : "border-line")}>
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
              <span className="block font-display text-[15px] leading-tight font-bold text-ink">LUSAKO Care</span>
              <span className="block text-xs text-muted">Installation, maintenance & support</span>
            </span>
          </div>

          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="LUSAKO Care"
              title={
                <>
                  Looked after, <Highlight>long after installation</Highlight>
                </>
              }
              description="Service is what makes LUSAKO a hydration partner rather than an appliance retailer. Whether you buy, rent or run a corporate contract, LUSAKO Care keeps your system performing."
            />
            <ul className="mt-8 flex flex-wrap gap-2">
              {services.map(({ id, title, icon: Icon }) => (
                <li key={id} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-ink">
                  <Icon aria-hidden className="size-4 text-deep" strokeWidth={1.75} />
                  {title}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">Provided according to your warranty, service plan or rental agreement.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/service-support" variant="primary" arrow>
                Explore LUSAKO Care
              </ButtonLink>
              <ButtonLink href="/contact?type=service" variant="outline" arrow>
                Request a service
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
