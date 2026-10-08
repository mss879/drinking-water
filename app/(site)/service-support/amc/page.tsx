import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { AmcComparison } from "@/components/sections/amc-comparison";
import { AmcPlans, amcEnquiryHref, withValues } from "@/components/sections/amc-plans";
import { CoverComparison } from "@/components/sections/cover-comparison";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroStrip, PageHero } from "@/components/sections/page-hero";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  amcFaqs,
  amcKeyTerms,
  amcRoutine,
  annualFee,
  breakEvenSentence,
  dailyCost,
  discounted,
  recommendedPlan,
  recommendedValue,
  visitsLabel,
  type AmcSettings,
} from "@/content/amc";
import {
  amcCompare,
  amcCover,
  amcCta,
  amcFaq,
  amcFilters,
  amcHero,
  amcOnCall,
  amcPlanCards,
  amcPlansHeading,
  amcRoutineCopy,
  amcSeo,
  amcStrip,
  amcTermsCopy,
  amcValue,
  amcWhy,
} from "@/content/copy/amc";
import { fill } from "@/content/copy/schema";
import type { Part } from "@/content/parts";
import { site } from "@/content/site";
import { getAmc, getCopy, getOnCallFee, getParts, getPhotos } from "@/lib/cms/content";
import { formatCents, formatLKR, formatLKRCents } from "@/lib/format";
import { JsonLd } from "@/lib/jsonld";
import { organizationRef, pageMetadata } from "@/lib/seo";

const path = "/service-support/amc";

export async function generateMetadata(): Promise<Metadata> {
  const [amc, seo] = await Promise.all([getAmc(), getCopy(amcSeo)]);
  const from = Math.min(...amc.plans.map((plan) => plan.monthly));
  const filterOff = Math.max(...amc.plans.map((plan) => plan.filterDiscount));
  return pageMetadata({
    title: seo.title,
    description: fill(filterOff ? seo.description : seo.descriptionNoDiscount, { price: formatLKR(from), discount: filterOff }),
    path,
  });
}

const onCallHref = `/contact?${new URLSearchParams({ type: "service", serviceType: "on-call", issue: "I’d like to book an on-call service visit." })}#quote`;

function serviceJsonLd(amc: AmcSettings) {
  const url = new URL(path, site.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: "Water purifier annual maintenance contracts (AMC)",
    serviceType: "Water purifier maintenance",
    description:
      "Annual maintenance plans for LUSAKO water purifiers: scheduled preventive maintenance, tank chlorination and sanitation, breakdown support and discounts on eligible filters and spare parts.",
    url,
    provider: organizationRef,
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AMC plans",
      itemListElement: amc.plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.summary,
        url: `${url}#amc-${plan.id}`,
        price: annualFee(plan),
        priceCurrency: "LKR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: annualFee(plan),
          priceCurrency: "LKR",
          unitCode: "ANN",
          unitText: "year",
          valueAddedTaxIncluded: false,
        },
        itemOffered: { "@type": "Service", name: plan.name },
      })),
    },
  };
}

/** The proposal's "What eligible filter replacements could cost": standard prices against each plan's discount. */
function FilterPrices({ amc, filters, life }: { amc: AmcSettings; filters: Part[]; life: string }) {
  const plans = amc.plans.filter((plan) => plan.filterDiscount > 0);
  if (!filters.length || !plans.length) return null;
  return (
    <>
      <div className="card-line hidden overflow-hidden rounded-card-xl md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Standard filter prices and the prices with each plan’s discount, in LKR</caption>
          <thead>
            <tr className="bg-tint">
              <th scope="col" className="p-5 text-sm font-semibold text-ink lg:px-6">
                Filter or component
              </th>
              <th scope="col" className="p-5 text-right text-sm font-semibold text-ink">
                Standard price
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={`p-5 text-right text-sm font-semibold ${plan.id === recommendedPlan ? "bg-deep text-white" : "text-ink"}`}
                >
                  {plan.short} <span className="font-normal opacity-80">({plan.filterDiscount}% off)</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {filters.map((filter) => (
              <tr key={filter.id} className="border-t border-line">
                <th scope="row" className="p-5 font-normal lg:px-6">
                  <span className="block font-display font-bold text-ink">{filter.name}</span>
                  {filter.life && <span className="block text-[13px] text-muted">{withValues(life, { months: filter.life })}</span>}
                </th>
                <td className="p-5 text-right text-ink">{formatCents(filter.price!)}</td>
                {plans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`p-5 text-right font-semibold ${plan.id === recommendedPlan ? "border-t border-white/15 bg-deep text-white" : "text-deep"}`}
                  >
                    {formatCents(discounted(filter.price!, plan.filterDiscount))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {filters.map((filter) => (
          <li key={filter.id} className="card-line p-4">
            <p className="font-display font-bold text-ink">{filter.name}</p>
            {filter.life && <p className="text-[13px] text-muted">{withValues(life, { months: filter.life })}</p>}
            <dl className="mt-3 grid grid-cols-3 gap-1.5 text-center tabular-nums">
              <div className="rounded-chip bg-tint px-1.5 py-2">
                <dt className="text-[12px] text-muted">Standard</dt>
                <dd className="text-sm font-semibold text-ink">{formatCents(filter.price!)}</dd>
              </div>
              {plans.map((plan) => {
                const featured = plan.id === recommendedPlan;
                return (
                  <div key={plan.id} className={`rounded-chip px-1.5 py-2 ${featured ? "bg-deep text-white" : "bg-tint text-ink"}`}>
                    <dt className={`text-[12px] ${featured ? "text-white/85" : "text-muted"}`}>
                      {plan.short} −{plan.filterDiscount}%
                    </dt>
                    <dd className="text-sm font-semibold">{formatCents(discounted(filter.price!, plan.filterDiscount))}</dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function AmcPage() {
  const [amc, parts, photos, onCallFee, hero, strip, plansHeading, planCards, compare, valueCopy, filtersCopy, why, routine, terms, onCall, cover, faq, cta] =
    await Promise.all([
      getAmc(),
      getParts(),
      getPhotos(),
      getOnCallFee(),
      getCopy(amcHero),
      getCopy(amcStrip),
      getCopy(amcPlansHeading),
      getCopy(amcPlanCards),
      getCopy(amcCompare),
      getCopy(amcValue),
      getCopy(amcFilters),
      getCopy(amcWhy),
      getCopy(amcRoutineCopy),
      getCopy(amcTermsCopy),
      getCopy(amcOnCall),
      getCopy(amcCover),
      getCopy(amcFaq),
      getCopy(amcCta),
    ]);
  const value = recommendedValue(amc);
  const breakEven = breakEvenSentence(amc);
  const recommended = amc.plans.find((plan) => plan.id === recommendedPlan)!;
  const from = Math.min(...amc.plans.map((plan) => plan.monthly));
  const filters = parts.filter((part) => part.category === "filters" && part.price !== null);
  const labourNote = amc.plans.find((plan) => plan.labourNote)?.labourNote;
  const footnote = [labourNote && `*${labourNote}`, compare.footnote].filter(Boolean).join(" ");
  // The first on-call step names the visit fee while it's switched on in Prices & quotes.
  const onCallSteps = onCall.steps.map((step, i) =>
    i === 0 && onCallFee !== null ? { ...step, body: fill(onCall.bookWithPrice, { price: formatLKR(onCallFee) }) } : step,
  );

  return (
    <>
      <JsonLd data={serviceJsonLd(amc)} />

      <PageHero
        crumbs={[
          { label: "Service & support", href: "/service-support" },
          { label: "AMC plans", href: path },
        ]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.plansButton, href: "#plans" },
          { label: hero.compareButton, href: "#compare" },
        ]}
        image={{ src: photos.pageAmc.src, position: "object-right" }}
      />
      <HeroStrip
        title={strip.title}
        description={strip.description}
        pills={amc.plans.map((plan) => plan.short)}
        highlight={fill(strip.price, { price: formatLKR(from) })}
      />

      <section id="plans" aria-labelledby="plans-title" className="scroll-mt-24 py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={plansHeading.eyebrow}
            title={
              <span id="plans-title">
                {marked(plansHeading.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
              </span>
            }
            description={fill(plansHeading.description, { plan: recommended.name })}
          />
          <AmcPlans plans={amc.plans} copy={planCards} className="mt-12 lg:mt-14" />
          <p className="mt-5 text-sm leading-relaxed text-muted">{plansHeading.taxNote}</p>
        </Container>
      </section>

      <section id="compare" aria-labelledby="compare-title" className="scroll-mt-24 pb-16 md:pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={compare.eyebrow}
            title={
              <span id="compare-title">
                {marked(compare.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
              </span>
            }
            description={compare.description}
          />
          <AmcComparison plans={amc.plans} copy={planCards} footnote={footnote} className="mt-12 lg:mt-14" />
        </Container>
      </section>

      {value && (
        <section aria-labelledby="value-title" className="pb-16 md:pb-20 lg:pb-28">
          <Container className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-6 lg:order-2">
              <SectionHeading eyebrow={valueCopy.eyebrow} title={<span id="value-title">{marked(valueCopy.title)}</span>} />
              <div data-reveal="up" className="mt-6 grid gap-4 text-[15px] leading-relaxed text-muted">
                <p>{withValues(valueCopy.saving, { percent: value.percent, discount: recommended.filterDiscount })}</p>
                <p>{withValues(valueCopy.fees, { visit: formatLKR(amc.fees.visit), sanitation: formatLKR(amc.fees.sanitation) })}</p>
              </div>
              <ul data-stagger className="mt-8 grid gap-3">
                {amc.plans.map((plan) => (
                  <li key={plan.id} className="flex flex-col gap-1 rounded-card-sm border border-line bg-white p-4 sm:flex-row sm:gap-4">
                    <span className="shrink-0 font-display font-bold text-deep sm:w-24">{plan.short}</span>
                    <span className="text-[15px] leading-snug text-muted">{plan.summary}</span>
                  </li>
                ))}
              </ul>
              {breakEven && <p className="mt-5 text-sm leading-relaxed text-muted">{breakEven}</p>}
            </div>

            <div data-reveal="up" className="relative isolate overflow-hidden rounded-card-xl bg-deep p-6 text-white sm:p-8 lg:col-span-6 lg:order-1 lg:p-10">
              <WaveLines lines={4} className="absolute inset-x-0 bottom-0 -z-10 h-1/2 w-full text-white/15" />
              <Pill variant="glass">{value.plan.name}</Pill>
              <dl className="mt-8 grid text-[15px]">
                <div className="flex items-baseline justify-between gap-4 border-b border-white/20 py-3">
                  <dt>
                    {visitsLabel(value.plan.visits).replace("visit", "preventive maintenance visit")} × {formatLKR(amc.fees.visit)}
                  </dt>
                  <dd className="shrink-0 font-semibold tabular-nums">{formatLKR(value.plan.visits * amc.fees.visit)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-white/20 py-3">
                  <dt>
                    {value.plan.sanitations} tank chlorination &amp; sanitation {value.plan.sanitations === 1 ? "service" : "services"}
                  </dt>
                  <dd className="shrink-0 font-semibold tabular-nums">{formatLKR(value.plan.sanitations * amc.fees.sanitation)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-white/20 py-3">
                  <dt className="text-white/85">{valueCopy.separately}</dt>
                  <dd className="shrink-0 font-semibold tabular-nums">{formatLKR(value.separately)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-white/85">{withValues(valueCopy.annualFee, { plan: value.plan.name })}</dt>
                  <dd className="shrink-0 font-semibold tabular-nums">{formatLKR(value.fee)}</dd>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 rounded-card-sm bg-white px-4 py-4 text-deep">
                  <dt className="font-semibold">{valueCopy.savingLabel}</dt>
                  <dd className="shrink-0 text-right">
                    <span className="block font-display text-2xl leading-none font-bold tabular-nums">{formatLKR(value.saving)}</span>
                    <span className="text-[13px] font-semibold">{withValues(valueCopy.percent, { percent: value.percent })}</span>
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-sm text-white/85">
                {withValues(valueCopy.monthly, { monthly: formatLKR(value.plan.monthly), daily: formatLKRCents(dailyCost(value.plan)) })}
              </p>
            </div>
          </Container>
        </section>
      )}

      {filters.length > 0 && amc.plans.some((plan) => plan.filterDiscount > 0) && (
        <section aria-labelledby="filters-title" className="pb-16 md:pb-20 lg:pb-28">
          <Container>
            <SectionHeading
              layout="split"
              eyebrow={filtersCopy.eyebrow}
              title={
                <span id="filters-title">
                  {marked(filtersCopy.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
                </span>
              }
              description={filtersCopy.description}
              action={
                <ButtonLink href="/service-support/parts" variant="outline" arrow>
                  {filtersCopy.button}
                </ButtonLink>
              }
            />
            <div className="mt-12 lg:mt-14">
              <FilterPrices amc={amc} filters={filters} life={filtersCopy.life} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">{filtersCopy.note}</p>
          </Container>
        </section>
      )}

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-deep p-6 text-white sm:p-10 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="lg:col-span-7">
                <Pill variant="glass">{why.pill}</Pill>
                <h2 className="mt-5 text-h2 font-bold">{why.title}</h2>
              </div>
              <p className="text-white/85 lg:col-span-5">{why.text}</p>
            </div>
            <ul data-stagger className="mt-10 grid gap-3 lg:grid-cols-3">
              {why.reasons.map((reason, i) => (
                <li key={i} className="rounded-card-sm bg-white/10 p-5 ring-1 ring-white/15 ring-inset sm:p-6">
                  <h3 className="font-display text-lg leading-snug font-bold">{reason.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/85">{reason.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 border-t border-white/20 pt-8">
              <p className="font-display text-lg font-bold">{why.checksTitle}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {why.checks.map((check, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] leading-snug">
                    <span aria-hidden className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-white text-deep">
                      <Check className="size-3" strokeWidth={2.5} />
                    </span>
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="routine-title" className="pb-16 md:pb-20 lg:pb-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow={routine.eyebrow} title={<span id="routine-title">{marked(routine.title)}</span>} />
            <ol data-stagger className="mt-10 grid gap-6">
              {amcRoutine(amc, routine.steps).map((step, i) => (
                <li key={i} className="flex gap-5">
                  <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-deep font-display font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-6">
            <SectionHeading eyebrow={terms.eyebrow} title={terms.title} />
            <Accordion
              className="mt-10"
              defaultOpen={null}
              items={amcKeyTerms(amc, terms.terms).map((term) => ({ title: term.title, content: term.body }))}
            />
          </div>
        </Container>
      </section>

      <section id="on-call" aria-labelledby="on-call-title" className="scroll-mt-24 pb-16 md:pb-20 lg:pb-28">
        <Container>
          <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-tint-2 p-6 sm:p-10 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-brand/30" />
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="lg:col-span-7">
                <Pill variant="white">{onCall.pill}</Pill>
                <h2 id="on-call-title" className="mt-5 text-h2 font-bold text-ink">
                  {onCall.title}
                </h2>
              </div>
              <p className="text-muted lg:col-span-5">{onCall.text}</p>
            </div>
            <ol data-stagger className="mt-10 grid gap-3 md:grid-cols-3">
              {onCallSteps.map((step, i) => (
                <li key={i} className="rounded-card-sm bg-white p-5 sm:p-6">
                  <span aria-hidden className="font-sans text-[2.5rem] leading-none font-extralight tracking-[-0.04em] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-muted">{onCall.note}</p>
              <ButtonLink href={onCallHref} arrow className="w-full shrink-0 sm:w-auto">
                {onCall.button}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section id="cover" aria-labelledby="cover-title" className="scroll-mt-24 pb-16 md:pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={cover.eyebrow}
            title={
              <span id="cover-title">
                {marked(cover.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
              </span>
            }
            description={
              <>
                {cover.description}{" "}
                <Link href="/rental" className="inline-flex items-center gap-1 font-semibold text-deep hover:underline">
                  {cover.link} <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </>
            }
          />
          <CoverComparison amc={amc} copy={cover} className="mt-12 lg:mt-14" />
        </Container>
      </section>

      <FaqSection faqs={amcFaqs(amc)} title={faq.title} />
      <CtaBand copy={cta} href={amcEnquiryHref(recommended)} />
    </>
  );
}
