import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  Check,
  GlassWater,
  Headset,
  House,
  KeyRound,
  MapPinned,
  Receipt,
  Settings2,
  Sparkles,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { RentalQuoteBuilder } from "@/components/rental/rental-quote-builder";
import { CtaBand } from "@/components/sections/cta-band";
import { BuyVsRent } from "@/components/sections/buy-vs-rent";
import { FaqSection } from "@/components/sections/faq-section";
import { HowItWorks } from "@/components/sections/how-it-works";
import { HeroStrip, PageHero } from "@/components/sections/page-hero";
import { PurificationChooser } from "@/components/sections/purification-chooser";
import { RentalInclusions } from "@/components/sections/rental-inclusions";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { IconBadge } from "@/components/ui/icon-badge";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  rentalAquaspark,
  rentalCharges,
  rentalEnquiry,
  rentalFaq,
  rentalHero,
  rentalNextSteps,
  rentalQuote,
  rentalQuoteBuilder,
  rentalRegional,
  rentalSeo,
  rentalWhy,
} from "@/content/copy/rental";
import { fill } from "@/content/copy/schema";
import { findProduct } from "@/content/products";
import { site } from "@/content/site";
import { getCopy, getFaqs, getPhotos, getProducts, getRentalPlans, getRentalPrices } from "@/lib/cms/content";
import { formatLKR } from "@/lib/format";
import { JsonLd } from "@/lib/jsonld";
import { organizationRef, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(rentalSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/rental" });
}

/**
 * The benefit cards' icons, by position (the brief's rental message, Doc 1 §13: sell convenience, not a machine).
 * Their wording is in content/copy/rental.ts; the third is the "Low initial cost" card.
 */
const benefitIcons: LucideIcon[] = [GlassWater, CalendarClock, Wallet, Wrench, Headset, KeyRound];

const coverageIcons: LucideIcon[] = [Settings2, CalendarCheck, MapPinned];

/** The two charge cards: the initial payment, then the Regional Hydration Service. */
const chargeIcons: LucideIcon[] = [Receipt, MapPinned];

/** The cards under "What happens next", by position. */
const crossLinks: { href: string; icon: LucideIcon }[] = [
  { href: "/hydration-solutions/corporate", icon: Building2 },
  { href: "/water-purifiers", icon: House },
];

/** A title with line breaks sets each line on its own line. */
function titleLines(title: string) {
  const lines = title.split(/\n+/).filter(Boolean);
  return lines.length > 1 ? lines.map((line, i) => <span key={i} className="block">{line}</span>) : title;
}

export default async function RentalPage() {
  const [products, photos, plans, prices, faqs, hero, why, aquasparkCopy, quote, builder, charges, regional, enquiry, next, faqCopy] =
    await Promise.all([
      getProducts(),
      getPhotos(),
      getRentalPlans(),
      getRentalPrices(),
      getFaqs(),
      getCopy(rentalHero),
      getCopy(rentalWhy),
      getCopy(rentalAquaspark),
      getCopy(rentalQuote),
      getCopy(rentalQuoteBuilder),
      getCopy(rentalCharges),
      getCopy(rentalRegional),
      getCopy(rentalEnquiry),
      getCopy(rentalNextSteps),
      getCopy(rentalFaq),
    ]);
  const aquaspark = plans.find((plan) => plan.id === "aquaspark");
  const sparklingProduct = findProduct(products, "aquaspark-elite") ?? products.find((product) => product.types.includes("sparkling"));
  const rentalFaqs = faqs.filter((faq) => faq.topic === "rental");

  // The amounts the admin has switched on (Prices & quotes). A hidden one keeps the page's wording without a price.
  const ufFrom = prices.plans["pureflow-uf"];
  const aquasparkFrom = aquaspark ? prices.plans[aquaspark.id] : undefined;
  const chargeAmounts = [prices.initial, prices.regional];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "LUSAKO water purifier rental",
          serviceType: "Water purifier rental",
          description:
            "One predictable monthly payment for a LUSAKO water purifier and the ongoing service required to keep it operating.",
          url: new URL("/rental", site.url).toString(),
          provider: organizationRef,
          areaServed: { "@type": "Country", name: "Sri Lanka" },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "LUSAKO rental plans",
            itemListElement: plans.map((plan) => {
              const from = prices.plans[plan.id];
              return {
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: plan.name, description: plan.description },
                ...(from !== undefined && {
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    minPrice: from,
                    priceCurrency: "LKR",
                    unitCode: "MON",
                    valueAddedTaxIncluded: false,
                  },
                }),
              };
            }),
          },
        }}
      />

      <PageHero
        crumbs={[{ label: "Rental", href: "/rental" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.quoteButton, href: "#calculator" },
          { label: hero.enquiryButton, href: "#enquiry" },
        ]}
        image={{ src: photos.officePantry.src, position: "object-[50%_45%]" }}
      />
      <HeroStrip
        title={hero.stripTitle}
        description={hero.stripText}
        pills={hero.stripPills}
        highlight={ufFrom !== undefined ? `${fill(hero.stripPrice, { price: formatLKR(ufFrom) })}/month + VAT` : undefined}
      />

      <section className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12" data-no-reveal>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <SectionHeading
                eyebrow={why.eyebrow}
                title={
                  <>
                    <span className="block">{marked(why.title[0])}</span> {marked(why.title[1])}
                  </>
                }
                description={why.description}
              />
              <div data-reveal="up" className="mt-8">
                <ButtonLink href="#calculator" variant="outline" arrow>
                  {why.button}
                </ButtonLink>
              </div>
            </div>
          </div>
          <ul data-stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {why.benefits.map(({ title, body }, i) => {
              const Icon = benefitIcons[i] ?? GlassWater;
              // The "Low initial cost" card names the initial payment while it is shown.
              const text = i === 2 && prices.initial !== null ? fill(why.initialWithPrice, { price: formatLKR(prices.initial) }) : body;
              return (
                <li key={i} className="card-line flex flex-col p-6 sm:min-h-52">
                  <span className="grid size-14 place-items-center rounded-card-sm bg-tint">
                    <IconBadge size="sm">
                      <Icon />
                    </IconBadge>
                  </span>
                  <h3 className="pt-6 font-display text-xl font-bold text-ink sm:pt-8">{titleLines(title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <PurificationChooser context="rental" />

      {aquaspark && (
        <div id="aquaspark" className="-mt-12 pb-16 md:pb-20 lg:-mt-20 lg:pb-28">
          <Container>
            <article data-reveal="up" className="card-line relative flex flex-col gap-6 overflow-hidden p-5 sm:flex-row sm:items-center sm:p-6 lg:pr-8">
              {sparklingProduct && (
                <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-tint-2 sm:size-28">
                  <Image src={sparklingProduct.image} alt="" fill sizes="112px" className="object-contain p-3" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill variant="tint">
                    <Sparkles aria-hidden /> {aquaspark.bestFor}
                  </Pill>
                  <Pill>{aquaspark.stages}</Pill>
                </div>
                <h3 className="mt-3 font-display text-h3 font-bold text-ink">{aquaspark.name}</h3>
                <p className="mt-1 max-w-xl text-[15px] text-muted">{aquaspark.description}</p>
              </div>
              <div className="flex flex-col gap-4 sm:items-end sm:text-right">
                <p>
                  <span className="block text-sm text-muted">{aquasparkCopy.rateLabel}</span>
                  <span className="font-display text-lg font-bold text-deep">
                    {aquasparkFrom !== undefined
                      ? `${fill(aquasparkCopy.rateWithPrice, { price: formatLKR(aquasparkFrom) })}/month + VAT`
                      : aquasparkCopy.rate}
                  </span>
                </p>
                <ButtonLink
                  href={`/contact?type=rental&preferredSolution=${aquaspark.id}#quote`}
                  variant="primary"
                  arrow
                  className="w-full sm:w-auto"
                >
                  {aquasparkCopy.button}
                  <span className="sr-only"> for {aquaspark.name} rental</span>
                </ButtonLink>
              </div>
            </article>
          </Container>
        </div>
      )}

      <RentalInclusions showCta={false} />

      <section id="calculator" className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={quote.eyebrow}
            title={marked(quote.title)}
            description={quote.description}
          />

          <RentalQuoteBuilder className="mt-12 lg:mt-14" copy={builder} plans={plans} prices={prices} />

          <div className="mt-16 lg:mt-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="font-display text-h3 font-bold text-ink">{charges.title}</h3>
              {/* The VAT statement stays in the code. */}
              <p className="text-sm text-muted">{`${charges.note} All amounts exclude VAT.`}</p>
            </div>
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:gap-5">
              {charges.cards.map(({ title, when, unit, unitWithPrice, body }, i) => {
                const Icon = chargeIcons[i] ?? Receipt;
                const amount = chargeAmounts[i] ?? null;
                return (
                  <li key={i} className="card-line flex flex-col p-6">
                    <div className="flex items-center gap-3">
                      <IconBadge size="sm">
                        <Icon />
                      </IconBadge>
                      <h4 className="font-display text-[15px] font-bold text-ink">{title}</h4>
                    </div>
                    <p className="mt-6 lg:mt-8">
                      <span className="font-sans text-[2rem] leading-tight font-light tracking-[-0.03em] text-deep">
                        {amount !== null ? formatLKR(amount) : when}
                      </span>
                      <span className="ml-1.5 text-sm text-muted">{amount !== null ? unitWithPrice : unit}</span>
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      <section id="regional-service" aria-labelledby="regional-service-title" className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <div data-expand className="relative isolate grid gap-10 overflow-hidden rounded-card-xl bg-deep p-6 text-white sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="relative lg:col-span-7">
              <Pill variant="glass">{regional.pill}</Pill>
              <h2 id="regional-service-title" className="mt-5 max-w-2xl text-h2 font-bold">
                {regional.title}
              </h2>
              <p className="mt-5 max-w-xl text-lead text-white">{regional.text}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {regional.chips.map((label, i) => {
                  const Icon = coverageIcons[i] ?? MapPinned;
                  return (
                    <li key={i} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-ink">
                      <Icon aria-hidden className="size-4 text-deep" strokeWidth={1.75} />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="relative flex flex-col gap-3 lg:col-span-5 lg:justify-center">
              <h3 className="font-display text-sm font-bold tracking-[0.14em] text-white uppercase">{regional.examplesTitle}</h3>
              <div className="rounded-card bg-white p-5 text-ink sm:p-6">
                <p className="text-sm text-muted">{regional.westernLabel}</p>
                <p className="mt-1 font-display text-xl font-bold text-ink">{regional.westernTitle}</p>
                <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-[15px] text-ink">
                  <Check aria-hidden className="size-4 text-deep" strokeWidth={2.5} /> {regional.westernLine}
                </p>
              </div>
              <div className="rounded-card bg-white p-5 text-ink sm:p-6">
                <p className="text-sm text-muted">{regional.outsideLabel}</p>
                <p className="mt-1 font-display text-xl font-bold text-ink">{regional.outsideTitle}</p>
                <ul className="mt-4 grid gap-2 border-t border-line pt-4 text-[15px] text-ink">
                  <li className="flex items-center gap-2">
                    <Check aria-hidden className="size-4 text-deep" strokeWidth={2.5} /> {regional.outsideRentalLine}
                  </li>
                  <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Check aria-hidden className="size-4 text-deep" strokeWidth={2.5} /> {regional.outsideRegionalLine}
                    <span className="text-sm text-muted">
                      {prices.regional !== null
                        ? fill(regional.regionalNoteWithPrice, { price: formatLKR(prices.regional) })
                        : regional.regionalNote}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <BuyVsRent />
      <HowItWorks initial="rent" />

      <section id="enquiry" className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12" data-no-reveal>
          <div className="flex flex-col lg:col-span-5">
            <SectionHeading eyebrow={enquiry.eyebrow} title={marked(enquiry.title)} description={enquiry.description} />

            <h3 data-reveal="up" className="label mt-10">{enquiry.stepsTitle}</h3>
            <ol data-stagger className="mt-5 grid gap-5">
              {next.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-deep text-sm font-semibold text-white"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold text-ink">{step.title}</span>
                    <span className="mt-0.5 block text-[15px] leading-relaxed text-muted">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div data-stagger className="mt-10 grid gap-3">
              {crossLinks.map(({ href, icon: Icon }, i) => {
                const card = enquiry.links[i];
                if (!card) return null;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="group/card card-line flex items-center gap-4 p-4 pr-5 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-5"
                  >
                    <IconBadge>
                      <Icon />
                    </IconBadge>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-bold text-ink">{card.title}</span>
                      <span className="mt-0.5 block text-sm text-muted">{card.body}</span>
                    </span>
                    <ArrowCircle variant="deep" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div data-reveal="up" className="card-line rounded-card-xl p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <h3 className="font-display text-h3 font-bold text-ink">{enquiry.formTitle}</h3>
            <p className="mt-2 mb-8 text-[15px] text-muted">{enquiry.formText}</p>
            <LeadForm type="rental" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={rentalFaqs} title={faqCopy.title} />
      <CtaBand />
    </>
  );
}
