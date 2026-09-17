import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Droplets, KeyRound, PiggyBank, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { ProductCatalog } from "@/components/products/product-catalog";
import { ArchCta } from "@/components/sections/arch-cta";
import { BuyVsRent } from "@/components/sections/buy-vs-rent";
import { FaqSection } from "@/components/sections/faq-section";
import { PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/faqs";
import { photos } from "@/content/images";
import { products } from "@/content/products";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Water Purifiers",
  description:
    "Buy a LUSAKO water purifier in Sri Lanka: countertop, freestanding and sparkling systems with UF or RO purification, professional installation and warranty.",
  path: "/water-purifiers",
});

/** The brief's BUY message (Doc 1 §12, Doc 2 §5): ownership, long-term value, quality, technology, warranty. */
const reasons: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: KeyRound, title: "Yours to keep", body: "Buy once and the system is yours, with no monthly rental to pay." },
  {
    icon: PiggyBank,
    title: "Long-term value",
    body: "Invest once and enjoy reliable purified water for years, with no more bottled-water deliveries.",
  },
  {
    icon: BadgeCheck,
    title: "Product quality",
    body: "Premium countertop, freestanding and sparkling systems, designed for everyday use at home and at work.",
  },
  {
    icon: Droplets,
    title: "The right technology",
    body: "UF or RO purification, matched to your water source. We recommend the right one, so you don’t have to be a water expert.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty cover",
    body: "Every purchased system comes with a product warranty, shown on each product page.",
  },
];

/** The three questions behind Find My Solution (brief Doc 1 §14). */
const questions = ["Where do you live?", "What is your water source?", "What do you need?"];

const waterMatches = [
  {
    source: "City water",
    tech: "UF",
    name: "Ultrafiltration",
    body: "A fine membrane removes particles, sediment and microorganisms while keeping naturally occurring minerals.",
    dark: false,
  },
  {
    source: "Well water / higher TDS",
    tech: "RO",
    name: "Reverse osmosis",
    body: "A much finer membrane also reduces dissolved salts and other dissolved solids (TDS).",
    dark: true,
  },
];

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "LUSAKO water purifiers",
  itemListElement: products.map((product, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: product.name,
    url: new URL(`/water-purifiers/${product.slug}`, site.url).toString(),
  })),
};

/** "Which purifier is right for me?" — the brief's decision tool, closing the catalogue (Doc 2 §5). */
function DecisionCard() {
  return (
    <div className="relative mt-6 overflow-hidden rounded-card-xl bg-frost p-6 sm:p-8 lg:p-10">
      <Rings count={8} className="absolute -top-28 -right-28 size-96 text-white" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-6">
          <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-full sm:block">
            <Image src={photos.waterTest.src} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div>
            <h3 className="text-h3 font-medium text-ink">Which purifier is right for me?</h3>
            <p className="mt-2 max-w-xl text-muted">
              Answer three quick questions and we’ll recommend the right system and purification for your water.
            </p>
            <ol className="mt-5 flex flex-wrap gap-2">
              {questions.map((question, i) => (
                <li key={question}>
                  <Pill variant="white">
                    <span aria-hidden className="font-semibold text-brand">
                      {i + 1}
                    </span>
                    {question}
                  </Pill>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <ButtonLink href="/find-my-solution" variant="dark" size="lg" arrow className="w-full sm:w-fit">
          Find my solution
        </ButtonLink>
      </div>
    </div>
  );
}

function WhyOwn() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Why buy"
            title={
              <>
                Why own a <Highlight>LUSAKO system</Highlight>
              </>
            }
          />
          <p className="max-w-sm text-muted lg:pb-2">
            For most homes, buying is the best long-term value. The system is yours, it’s covered by warranty, and LUSAKO Care is there
            whenever you need us.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex min-h-60 flex-col rounded-card bg-frost p-6 sm:p-7">
              <IconBadge variant="white">
                <Icon />
              </IconBadge>
              <h3 className="mt-auto pt-10 text-h3 font-medium text-ink">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
            </li>
          ))}
          <li>
            <Link
              href="/service-support"
              className="group/card relative flex h-full min-h-60 flex-col overflow-hidden rounded-card bg-ocean p-6 text-white sm:p-7"
            >
              <Rings className="absolute -right-20 -bottom-20 size-72 text-aqua/25" />
              <span className="relative flex items-start justify-between gap-4">
                <IconBadge variant="white" framed>
                  <Wrench />
                </IconBadge>
                <ArrowCircle />
              </span>
              <h3 className="relative mt-auto pt-10 text-h3 font-medium">LUSAKO Care</h3>
              <span className="relative mt-2 block text-[15px] leading-relaxed text-white/75">
                After-sales support whenever you need it: installation, preventive maintenance, filter replacement and technical support
                through a service plan or AMC.
              </span>
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}

/** A compact UF / RO explainer: city water → UF, well water / higher TDS → RO (brief Doc 1 §14). */
function UfOrRo() {
  return (
    <section id="uf-or-ro" className="py-14 lg:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-card-xl bg-frost p-6 sm:p-10 lg:p-14">
          <Rings count={8} className="absolute -bottom-48 -left-48 size-[32rem] text-white" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <Pill variant="white">UF or RO?</Pill>
              <h2 className="mt-5 text-h2 font-medium text-ink">
                Matched to <Highlight>your water</Highlight>
              </h2>
              <p className="mt-5 max-w-md text-lead text-muted">
                You don’t need to be a water expert. Tell us where your water comes from and we’ll recommend the right purification.
              </p>
              <ButtonLink href="/find-my-solution" variant="dark" arrow className="mt-8 w-full sm:w-auto">
                Check my water
              </ButtonLink>
            </div>

            <div>
              <ul className="grid gap-3">
                {waterMatches.map((match) => (
                  <li key={match.tech} className="rounded-card bg-white p-5 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <p className="min-w-0 flex-1">
                        <span className="block text-sm text-subtle">If you have</span>
                        <span className="block text-lg leading-snug font-medium text-ink">{match.source}</span>
                      </p>
                      <ArrowRight aria-hidden className="size-5 shrink-0 text-brand" />
                      <p
                        className={cn(
                          "grid size-14 shrink-0 place-items-center rounded-full text-lg font-semibold",
                          match.dark ? "bg-ocean text-white" : "bg-pastel text-ink",
                        )}
                      >
                        <span className="sr-only">we recommend </span>
                        {match.tech}
                      </p>
                    </div>
                    <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
                      <strong className="font-medium text-ink">{match.name}.</strong> {match.body}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-subtle">RO also suits city water. The final recommendation depends on your water condition.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function WaterPurifiersPage() {
  return (
    <>
      <JsonLd data={itemList} />
      <PageHero
        crumbs={[{ label: "Water purifiers", href: "/water-purifiers" }]}
        eyebrow="LUSAKO Water Purifiers"
        title={
          <>
            Own <Highlight>better water</Highlight>
          </>
        }
        description="Invest once in a LUSAKO purification system and enjoy reliable purified water for years. Find the right system for your water and lifestyle."
        actions={
          <>
            <ButtonLink href="/find-my-solution" variant="pastel" size="lg" arrow>
              Find my solution
            </ButtonLink>
            <ButtonLink href="/contact?type=buy" variant="dark" size="lg" arrow>
              Get a quote
            </ButtonLink>
          </>
        }
      />

      <section id="catalogue" aria-label="Water purifier catalogue" className="pt-4 pb-14 lg:pt-6 lg:pb-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Catalogue"
              title={
                <>
                  Choose your <Highlight>purifier</Highlight>
                </>
              }
            />
            <p className="max-w-sm text-muted lg:pb-2">
              Countertop, freestanding and sparkling purifiers, plus a bottle dispenser. Filter by type or purification, or let us recommend
              one.
            </p>
          </div>
          <ProductCatalog className="mt-10 lg:mt-12" purificationHelpHref="#uf-or-ro" />
          <DecisionCard />
        </Container>
      </section>

      <WhyOwn />
      <UfOrRo />
      <BuyVsRent />
      <FaqSection faqs={faqs.filter((faq) => faq.topic === "buying" || faq.topic === "purification")} />
      <ArchCta />
    </>
  );
}
