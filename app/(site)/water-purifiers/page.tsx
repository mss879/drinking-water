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
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { BrandIcon } from "@/components/ui/brand-icon";
import {
  purifiersCare,
  purifiersCard,
  purifiersCatalogue,
  purifiersCatalogueMessages,
  purifiersDecision,
  purifiersFaqs,
  purifiersHero,
  purifiersNext,
  purifiersSeo,
  purifiersUfOrRo,
  purifiersWhyBuy,
} from "@/content/copy/purifiers";
import type { Photos } from "@/content/images";
import type { Product } from "@/content/products";
import { site } from "@/content/site";
import { getCopy, getFaqs, getPhotos, getProducts } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(purifiersSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/water-purifiers" });
}

/**
 * The icons of the brief's BUY message (Doc 1 §12, Doc 2 §5): ownership, long-term value, quality, technology,
 * warranty. Their wording is the purifiers.whyBuy block; each icon stays with its place.
 */
const reasonIcons: LucideIcon[] = [KeyRound, PiggyBank, BadgeCheck, Droplets, ShieldCheck];

/** The UF and RO badges beside the two water sources, in the order of the purifiers.ufOrRo cards. */
const waterMatches = [
  { tech: "UF", dark: false },
  { tech: "RO", dark: true },
];

function itemList(products: Product[]) {
  return {
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
}

/**
 * Where to go next from the catalogue: functional water, and the filters and parts that keep a purifier going. Their
 * wording is the purifiers.next block, in this order.
 */
const nextLinks = [
  { href: "/functional-water", icon: "sparkling" },
  { href: "/service-support/parts", icon: "filter" },
] as const;

/** "Which purifier is right for me?" — the brief's decision tool, closing the catalogue (Doc 2 §5). */
function DecisionCard({ photos, copy }: { photos: Photos; copy: typeof purifiersDecision.defaults }) {
  return (
    <div data-reveal="up" className="card-line relative mt-6 overflow-hidden rounded-card-xl p-6 sm:p-8 lg:p-10">
      <WaveLines lines={3} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand/30" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-6">
          <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-full sm:block">
            <Image src={photos.waterTest.src} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div>
            <h3 className="font-display text-h3 font-bold text-ink">{copy.title}</h3>
            <p className="mt-2 max-w-xl text-muted">{copy.body}</p>
            <ol className="mt-5 flex flex-wrap gap-2">
              {copy.questions.map((question, i) => (
                <li key={i}>
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
          {copy.button}
        </ButtonLink>
      </div>
    </div>
  );
}

function WhyOwn({ copy, care }: { copy: typeof purifiersWhyBuy.defaults; care: typeof purifiersCare.defaults }) {
  const reasons = copy.reasons.map((reason, i) => ({ ...reason, icon: reasonIcons[i] }));
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          layout="split"
          eyebrow={copy.eyebrow}
          title={marked(copy.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
          description={copy.description}
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          {reasons.map(({ icon: Icon, title, body }, i) => (
            <li key={i} className="card-line flex flex-col p-6 sm:min-h-60 sm:p-7">
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
              <h3 className="relative mt-auto pt-6 font-display text-h3 font-bold sm:pt-10">{care.title}</h3>
              <span className="relative mt-2 block text-[15px] leading-relaxed text-white">{care.body}</span>
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}

/** A compact UF / RO explainer: city water → UF, well water / higher TDS → RO (brief Doc 1 §14). */
function UfOrRo({ copy }: { copy: typeof purifiersUfOrRo.defaults }) {
  const matches = waterMatches.map((match, i) => ({ ...match, ...copy.matches[i] }));
  return (
    <section id="uf-or-ro" className="py-16 md:py-20 lg:py-28">
      <Container>
        <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-tint-2 p-6 sm:p-10 lg:p-14">
          <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-brand/35" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16" data-no-reveal>
            <div data-reveal="up">
              <Pill variant="white">{copy.pill}</Pill>
              <h2 className="mt-5 text-h2 font-semibold text-ink">{marked(copy.title)}</h2>
              <p className="mt-5 max-w-md text-lead text-muted">{copy.description}</p>
              <ButtonLink href="/find-my-solution" variant="primary" arrow className="mt-8 w-full sm:w-auto">
                {copy.button}
              </ButtonLink>
            </div>

            <div>
              <ul data-stagger className="grid gap-3">
                {matches.map((match) => (
                  <li key={match.tech} className="rounded-card bg-white p-5 shadow-soft sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <p className="min-w-0 flex-1">
                        <span className="block text-sm text-muted">{copy.cardLead}</span>
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
                      {marked(match.body, { mark: (phrase) => <strong className="font-semibold text-deep">{phrase}</strong> })}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">{copy.footnote}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default async function WaterPurifiersPage() {
  const [products, photos, faqs, hero, catalogue, messages, card, decision, next, whyBuy, care, ufOrRo, faqHeading] = await Promise.all([
    getProducts(),
    getPhotos(),
    getFaqs(),
    getCopy(purifiersHero),
    getCopy(purifiersCatalogue),
    getCopy(purifiersCatalogueMessages),
    getCopy(purifiersCard),
    getCopy(purifiersDecision),
    getCopy(purifiersNext),
    getCopy(purifiersWhyBuy),
    getCopy(purifiersCare),
    getCopy(purifiersUfOrRo),
    getCopy(purifiersFaqs),
  ]);
  const nextCards = nextLinks.map((link, i) => ({ ...link, ...next.cards[i] }));
  return (
    <>
      <JsonLd data={itemList(products)} />
      <PageHero
        crumbs={[{ label: "Water purifiers", href: "/water-purifiers" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.quoteButton, href: "/contact?type=buy" },
          { label: hero.finderButton, href: "/find-my-solution" },
        ]}
        image={{ src: photos.waterPour.src, position: "object-[50%_50%]" }}
      />

      <section id="catalogue" aria-label="Water purifier catalogue" className="pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={catalogue.eyebrow}
            title={marked(catalogue.title)}
            description={catalogue.description}
          />
          <ProductCatalog
            products={products}
            className="mt-10 lg:mt-12"
            purificationHelpHref="#uf-or-ro"
            copy={messages}
            cardCopy={card}
          />
          <DecisionCard photos={photos} copy={decision} />
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {nextCards.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group/card card-line flex items-center gap-5 p-5 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-6"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-card-sm bg-tint-2">
                    <BrandIcon name={link.icon} size={40} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold text-ink">{link.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{link.body}</span>
                  </span>
                  <ArrowCircle variant="deep" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <WhyOwn copy={whyBuy} care={care} />
      <UfOrRo copy={ufOrRo} />
      <BuyVsRent />
      <FaqSection faqs={faqs.filter((faq) => faq.topic === "buying" || faq.topic === "purification")} title={faqHeading.title} />
      <CtaBand />
    </>
  );
}
