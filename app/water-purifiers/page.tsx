import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Droplets, KeyRound, PiggyBank, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { ProductCatalog } from "@/components/products/product-catalog";
import { CtaBand } from "@/components/sections/cta-band";
import { BuyVsRent } from "@/components/sections/buy-vs-rent";
import { FaqSection } from "@/components/sections/faq-section";
import { PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
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
    <div data-reveal="up" className="card-line relative mt-6 overflow-hidden rounded-card-xl p-6 sm:p-8 lg:p-10">
      <WaveLines lines={3} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand/30" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-6">
          <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-full sm:block">
            <Image src={photos.waterTest.src} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div>
            <h3 className="font-display text-h3 font-bold text-ink">Which purifier is right for me?</h3>
            <p className="mt-2 max-w-xl text-muted">
              Answer three quick questions and we’ll recommend the right system and purification for your water.
            </p>
            <ol className="mt-5 flex flex-wrap gap-2">
              {questions.map((question, i) => (
                <li key={question}>
                  <Pill variant="tint">
                    <span aria-hidden className="font-bold text-deep">
                      {i + 1}
                    </span>
                    {question}
                  </Pill>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <ButtonLink href="/find-my-solution" variant="primary" size="lg" arrow className="w-full sm:w-fit">
          Find my solution
        </ButtonLink>
      </div>
    </div>
  );
}

function WhyOwn() {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          layout="split"
          eyebrow="Why buy"
          title={
            <>
              Why own a <Highlight className="inline-block">LUSAKO system</Highlight>
            </>
          }
          description="For most homes, buying is the best long-term value. The system is yours, it’s covered by warranty, and LUSAKO Care is there whenever you need us."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          {reasons.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card-line flex flex-col p-6 sm:min-h-60 sm:p-7">
              <span className="grid size-16 place-items-center rounded-card-sm bg-tint">
                <IconBadge size="sm">
                  <Icon />
                </IconBadge>
              </span>
              <h3 className="mt-auto pt-6 font-display text-h3 font-bold text-ink sm:pt-10">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
            </li>
          ))}
          <li>
            <Link
              href="/service-support"
              className="group/card relative flex h-full flex-col overflow-hidden rounded-card bg-deep p-6 sm:min-h-60 text-white transition-colors duration-300 hover:bg-deep-hover sm:p-7"
            >
              <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />
              <span className="relative flex items-start justify-between gap-4">
                <IconBadge variant="white" framed>
                  <Wrench />
                </IconBadge>
                <ArrowCircle />
              </span>
              <h3 className="relative mt-auto pt-6 font-display text-h3 font-bold sm:pt-10">LUSAKO Care</h3>
              <span className="relative mt-2 block text-[15px] leading-relaxed text-white">
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
    <section id="uf-or-ro" className="py-16 md:py-20 lg:py-28">
      <Container>
        <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-tint-2 p-6 sm:p-10 lg:p-14">
          <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-brand/35" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16" data-no-reveal>
            <div data-reveal="up">
              <Pill variant="white">UF or RO?</Pill>
              <h2 className="mt-5 text-h2 font-semibold text-ink">
                Matched to <Highlight>your water</Highlight>
              </h2>
              <p className="mt-5 max-w-md text-lead text-muted">
                You don’t need to be a water expert. Tell us where your water comes from and we’ll recommend the right purification.
              </p>
              <ButtonLink href="/find-my-solution" variant="primary" arrow className="mt-8 w-full sm:w-auto">
                Check my water
              </ButtonLink>
            </div>

            <div>
              <ul data-stagger className="grid gap-3">
                {waterMatches.map((match) => (
                  <li key={match.tech} className="rounded-card bg-white p-5 shadow-soft sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <p className="min-w-0 flex-1">
                        <span className="block text-sm text-muted">If you have</span>
                        <span className="block font-display text-lg leading-snug font-bold text-ink">{match.source}</span>
                      </p>
                      <ArrowRight aria-hidden className="size-5 shrink-0 text-deep" />
                      <p
                        className={cn(
                          "grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold",
                          match.dark ? "bg-deep text-white" : "bg-brand text-white",
                        )}
                      >
                        <span className="sr-only">we recommend </span>
                        {match.tech}
                      </p>
                    </div>
                    <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
                      <strong className="font-semibold text-deep">{match.name}.</strong> {match.body}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">RO also suits city water. The final recommendation depends on your water condition.</p>
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
            <ButtonLink href="/find-my-solution" variant="outline" size="lg" arrow>
              Find my solution
            </ButtonLink>
            <ButtonLink href="/contact?type=buy" variant="primary" size="lg" arrow>
              Get a quote
            </ButtonLink>
          </>
        }
      />

      <section id="catalogue" aria-label="Water purifier catalogue" className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Catalogue"
            title={
              <>
                Choose your <Highlight>purifier</Highlight>
              </>
            }
            description="Countertop, freestanding and sparkling purifiers, plus a bottle dispenser. Filter by type or purification, or let us recommend one."
          />
          <ProductCatalog className="mt-10 lg:mt-12" purificationHelpHref="#uf-or-ro" />
          <DecisionCard />
        </Container>
      </section>

      <WhyOwn />
      <UfOrRo />
      <BuyVsRent />
      <FaqSection faqs={faqs.filter((faq) => faq.topic === "buying" || faq.topic === "purification")} />
      <CtaBand />
    </>
  );
}
