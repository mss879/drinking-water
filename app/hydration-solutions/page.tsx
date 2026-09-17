import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArchCta } from "@/components/sections/arch-cta";
import { PageHero } from "@/components/sections/page-hero";
import { SolutionsTrio } from "@/components/sections/solutions-trio";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { photos } from "@/content/images";
import { planFor } from "@/content/pricing";
import { services } from "@/content/services";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

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

export default function HydrationSolutionsPage() {
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
        title={
          <>
            Better water, <Highlight>the way that suits you</Highlight>
          </>
        }
        description="Buy a purifier for your home, rent for your office, or let LUSAKO manage drinking water across your whole organisation."
        actions={
          <>
            <ButtonLink href="/find-my-solution" variant="dark" size="lg" arrow>
              Help me choose
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg" arrow>
              Get a quote
            </ButtonLink>
          </>
        }
      />

      <h2 className="sr-only">Hydration solutions for homes, offices and companies</h2>
      <SolutionsTrio showHeading={false} />

      <section className="py-14 lg:py-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Buy | Rent | Corporate"
              title={
                <>
                  Rental is how you pay. <Highlight>Hydration is what we deliver.</Highlight>
                </>
              }
            />
            <p className="max-w-sm text-muted lg:pb-2">
              Buying, renting and corporate contracts describe how you pay for and use the equipment. A hydration solution is the
              complete service and outcome LUSAKO provides.
            </p>
          </div>

          <ul className="mt-12 grid gap-4 lg:grid-cols-3">
            {models.map((model) => {
              const dark = model.id === "corporate";
              return (
                <li
                  key={model.id}
                  className={cn(
                    "group/card relative flex flex-col overflow-hidden rounded-card-xl p-6 sm:p-8",
                    model.id === "buy" && "bg-frost text-ink",
                    model.id === "rent" && "bg-pastel text-ink",
                    dark && "bg-ocean text-white",
                  )}
                >
                  <span aria-hidden className={cn("absolute -right-16 -bottom-20 size-64 rounded-full", dark ? "bg-white/10" : "bg-white/45")} />
                  <div className="relative flex flex-wrap items-center justify-between gap-3">
                    <h3 className="w-fit rounded-full bg-white px-4 py-2 text-xl font-medium text-ink">{model.label}</h3>
                    <span className={cn("text-sm", dark ? "text-white/75" : "text-muted")}>{model.audience}</span>
                  </div>
                  <p className="relative mt-6 text-lg leading-snug">{model.promise}</p>
                  <dl className="relative mt-6 grid gap-4">
                    {model.rows.map((row) => (
                      <div key={row.term} className={cn("border-t pt-4", dark ? "border-white/15" : "border-ink/10")}>
                        <dt className={cn("text-xs font-medium tracking-[0.14em] uppercase", dark ? "text-white/65" : "text-subtle")}>
                          {row.term}
                        </dt>
                        <dd className="mt-1 text-[15px] leading-relaxed">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={model.href}
                    className="mt-auto flex items-center justify-between gap-4 pt-10 text-sm font-medium after:absolute after:inset-0 after:rounded-card-xl"
                  >
                    {model.cta}
                    <ArrowCircle className="relative" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-card-xl bg-frost sm:aspect-[4/3] lg:col-span-6 lg:aspect-[5/6]">
            <Image
              src={photos.careTechnician.src}
              alt={photos.careTechnician.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[40%_50%]"
            />
            <span className="corner-tab px-5 py-4 pr-6 [--tab-r:28px]">
              <span className="block text-[15px] leading-tight font-medium text-ink">LUSAKO Care</span>
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
                  <Icon aria-hidden className="size-4 text-brand" strokeWidth={1.75} />
                  {title}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-subtle">Provided according to your warranty, service plan or rental agreement.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/service-support" variant="dark" arrow>
                Explore LUSAKO Care
              </ButtonLink>
              <ButtonLink href="/contact?type=service" variant="outline" arrow>
                Request a service
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <ArchCta image={photos.waterTest} />
    </>
  );
}
