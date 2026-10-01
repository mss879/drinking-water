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
  ShieldCheck,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { RentalCalculator } from "@/components/rental/rental-calculator";
import { CtaBand } from "@/components/sections/cta-band";
import { BuyVsRent } from "@/components/sections/buy-vs-rent";
import { FaqSection } from "@/components/sections/faq-section";
import { HowItWorks } from "@/components/sections/how-it-works";
import { HeroMedia, PageHero } from "@/components/sections/page-hero";
import { PurificationChooser } from "@/components/sections/purification-chooser";
import { RentalInclusions } from "@/components/sections/rental-inclusions";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/faqs";
import { leadForms } from "@/content/forms";
import { photos } from "@/content/images";
import { planFor, rentalCharges, rentalPlans } from "@/content/pricing";
import { getProduct } from "@/content/products";
import { howItWorks } from "@/content/services";
import { site } from "@/content/site";
import { formatLKR } from "@/lib/format";
import { JsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rental",
  description:
    "Rent a LUSAKO water purifier for your office or company: one predictable monthly payment for the equipment and ongoing service. PureFlow UF and RO plans.",
  path: "/rental",
});

/** The rental message from the brief (Doc 1 §13): sell convenience, not a machine. */
const benefits = [
  { icon: GlassWater, title: "Convenience", body: "Pure water on tap, with no bottle deliveries to arrange or store." },
  { icon: CalendarClock, title: "Predictability", body: "One predictable monthly payment that’s easy to budget for." },
  { icon: Wallet, title: "No large investment", body: "A low upfront cost, so your capital stays in your business." },
  { icon: Wrench, title: "Maintenance", body: "Scheduled preventive maintenance, according to your rental agreement." },
  { icon: Headset, title: "Service", body: "Technical support from LUSAKO whenever your team needs it." },
  { icon: KeyRound, title: "No ownership headache", body: "The equipment remains LUSAKO’s, and so does looking after it." },
];

const regionalCoverage = [
  { icon: Settings2, label: "Additional technical service" },
  { icon: CalendarCheck, label: "Preventive maintenance" },
  { icon: MapPinned, label: "Regional support" },
];

export default function RentalPage() {
  const uf = planFor("UF");
  const aquaspark = rentalPlans.find((plan) => plan.id === "aquaspark");
  const sparklingProduct = getProduct("aquaspark-elite");
  const regional = rentalCharges.regionalServiceMonthlyPerUnit;
  const rentalFaqs = faqs.filter((faq) => faq.topic === "rental");
  const nextSteps = [
    { title: "Site assessment", body: howItWorks.rent[1]?.body ?? "We check your water source and where the machines should go." },
    { title: "Proposal", body: "A clear proposal with the machines, the monthly rental and every charge listed separately." },
    { title: "Installation", body: howItWorks.rent[2]?.body ?? "Professional installation, ready for your team on day one." },
  ];

  const charges = [
    {
      icon: Receipt,
      title: "One-time initial payment",
      amount: formatLKR(rentalCharges.initialPaymentPerUnit),
      unit: "per unit",
      body: "Payable only in the first month. From the second month onwards, you pay only the monthly rental.",
    },
    {
      icon: ShieldCheck,
      title: "Refundable security deposit",
      amount: formatLKR(rentalCharges.domesticDepositPerUnit),
      unit: "home rentals only",
      body: "Applies to domestic rentals only, and is refundable according to your rental agreement.",
    },
    {
      icon: MapPinned,
      title: "Regional Hydration Service",
      amount: regional === null ? "Confirmed in your quote" : formatLKR(regional),
      unit: regional === null ? "" : "per unit, per month",
      body: "Outside the Western Province only. Always shown as a separate line, never hidden inside the rental.",
    },
  ];

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
          provider: { "@type": "Organization", name: site.name, url: site.url },
          areaServed: { "@type": "Country", name: "Sri Lanka" },
          offers: rentalPlans
            .filter((plan) => plan.fromMonthly !== null)
            .map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              description: plan.description,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                minPrice: plan.fromMonthly,
                priceCurrency: "LKR",
                unitCode: "MON",
                valueAddedTaxIncluded: false,
              },
            })),
        }}
      />

      <PageHero
        crumbs={[{ label: "Rental", href: "/rental" }]}
        eyebrow="LUSAKO Hydration Solutions"
        title={
          <>
            Your water purifier. <Highlight>Our responsibility.</Highlight>
          </>
        }
        description="For one predictable monthly payment, LUSAKO provides the equipment and ongoing service required to keep your drinking-water system operating."
        actions={
          <>
            <ButtonLink href="#calculator" variant="primary" size="lg" arrow>
              Calculate my rental
            </ButtonLink>
            <ButtonLink href="#enquiry" variant="outline" size="lg" arrow>
              Rent for your office
            </ButtonLink>
          </>
        }
      >
        <HeroMedia image={photos.officePantry} priority position="object-[50%_45%]">
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 sm:top-6 sm:left-6">
            <Pill variant="white">Offices</Pill>
            <Pill variant="white">Companies</Pill>
          </div>
          {uf.fromMonthly && (
            <span className="absolute top-4 right-4 hidden sm:top-6 sm:right-6 sm:block">
              <Pill variant="white">PureFlow from {formatLKR(uf.fromMonthly)}/month + VAT</Pill>
            </span>
          )}
          <div className="absolute bottom-4 left-4 max-w-[86%] rounded-card-sm bg-white px-5 py-4 pr-6 shadow-float sm:bottom-6 sm:left-6 sm:px-7 sm:py-5 sm:pr-8">
            <p className="font-display text-lg leading-tight font-bold text-ink sm:text-h3">Pure water. Zero ownership hassle.</p>
            <p className="mt-1 text-sm text-muted">Equipment and ongoing service, for one predictable monthly payment.</p>
          </div>
        </HeroMedia>
      </PageHero>

      <section className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12" data-no-reveal>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <SectionHeading
                eyebrow="Why rent with LUSAKO"
                title={
                  <>
                    <span className="block">Enjoy better water.</span> <Highlight>Leave the maintenance to us.</Highlight>
                  </>
                }
                description="You’re not simply renting equipment. LUSAKO provides an ongoing hydration solution, so your team just enjoys the water."
              />
              <div data-reveal="up" className="mt-8">
                <ButtonLink href="#calculator" variant="outline" arrow>
                  See what it costs
                </ButtonLink>
              </div>
            </div>
          </div>
          <ul data-stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {benefits.map(({ icon: Icon, title, body }) => (
              <li key={title} className="card-line flex flex-col p-6 sm:min-h-52">
                <span className="grid size-14 place-items-center rounded-card-sm bg-tint">
                  <IconBadge size="sm">
                    <Icon />
                  </IconBadge>
                </span>
                <h3 className="mt-auto pt-6 font-display text-xl font-bold text-ink sm:pt-10">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
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
                  <span className="block text-sm text-muted">Rental</span>
                  <span className="font-display text-lg font-bold text-deep">
                    {aquaspark.fromMonthly ? `From ${formatLKR(aquaspark.fromMonthly)}/month + VAT` : "Price on request"}
                  </span>
                </p>
                <ButtonLink
                  href={`/contact?type=rental&preferredSolution=${aquaspark.id}`}
                  variant="primary"
                  arrow
                  className="w-full sm:w-auto"
                >
                  Ask about {aquaspark.name}
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
            eyebrow="Rental calculator"
            title={
              <>
                See your costs, <Highlight>clearly</Highlight>
              </>
            }
            description="Start with your province. Every charge is shown as its own line, so you know what you pay in the first month and every month after."
          />

          <RentalCalculator className="mt-12 lg:mt-14" />

          <div className="mt-16 lg:mt-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="font-display text-h3 font-bold text-ink">Transparent charges</h3>
              <p className="text-sm text-muted">Shown before you enquire. All amounts exclude VAT.</p>
            </div>
            <ul className="mt-6 grid gap-4 lg:grid-cols-3 lg:gap-5">
              {charges.map(({ icon: Icon, title, amount, unit, body }) => (
                <li key={title} className="card-line flex flex-col p-6">
                  <div className="flex items-center gap-3">
                    <IconBadge size="sm">
                      <Icon />
                    </IconBadge>
                    <h4 className="font-display text-[15px] font-bold text-ink">{title}</h4>
                  </div>
                  <p className="mt-6 lg:mt-8">
                    <span className="font-sans text-[2rem] leading-tight font-light tracking-[-0.03em] text-deep">{amount}</span>
                    {unit && <span className="ml-1.5 text-sm text-muted">{unit}</span>}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section id="regional-service" aria-labelledby="regional-service-title" className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <div data-expand className="relative isolate grid gap-10 overflow-hidden rounded-card-xl bg-deep p-6 text-white sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="relative lg:col-span-7">
              <Pill variant="glass">Regional Hydration Service</Pill>
              <h2 id="regional-service-title" className="mt-5 max-w-2xl text-h2 font-bold">
                The same standard of care, wherever you are
              </h2>
              <p className="mt-5 max-w-xl text-lead text-white">
                For customers outside the Western Province, a Regional Hydration Service charge applies to cover additional technical
                service, preventive maintenance and regional support requirements.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {regionalCoverage.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-ink">
                    <Icon aria-hidden className="size-4 text-deep" strokeWidth={1.75} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex flex-col gap-3 lg:col-span-5 lg:justify-center">
              <h3 className="font-display text-sm font-bold tracking-[0.14em] text-white uppercase">How it shows on your quote</h3>
              <div className="rounded-card bg-white p-5 text-ink sm:p-6">
                <p className="text-sm text-muted">Western Province</p>
                <p className="mt-1 font-display text-xl font-bold text-ink">Rental only</p>
                <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-[15px] text-ink">
                  <Check aria-hidden className="size-4 text-deep" strokeWidth={2.5} /> Monthly rental
                </p>
              </div>
              <div className="rounded-card bg-white p-5 text-ink sm:p-6">
                <p className="text-sm text-muted">Outside the Western Province</p>
                <p className="mt-1 font-display text-xl font-bold text-ink">Rental + Regional Hydration Service</p>
                <ul className="mt-4 grid gap-2 border-t border-line pt-4 text-[15px] text-ink">
                  <li className="flex items-center gap-2">
                    <Check aria-hidden className="size-4 text-deep" strokeWidth={2.5} /> Monthly rental
                  </li>
                  <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Check aria-hidden className="size-4 text-deep" strokeWidth={2.5} /> Regional Hydration Service
                    <span className="text-sm text-muted">
                      {regional === null ? "· separate line, confirmed in your quote" : `· ${formatLKR(regional)} per unit, per month`}
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
            <SectionHeading
              eyebrow="Office rental"
              title={
                <>
                  Rent LUSAKO for <Highlight>your office</Highlight>
                </>
              }
              description={leadForms.rental.description}
            />

            <h3 data-reveal="up" className="label mt-10">What happens next</h3>
            <ol data-stagger className="mt-5 grid gap-5">
              {nextSteps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
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
              <Link
                href="/hydration-solutions/corporate"
                className="group/card card-line flex items-center gap-4 p-4 pr-5 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-5"
              >
                <IconBadge>
                  <Building2 />
                </IconBadge>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-bold text-ink">Renting across several locations?</span>
                  <span className="mt-0.5 block text-sm text-muted">
                    Get a corporate proposal, so you don’t have to choose machines one by one.
                  </span>
                </span>
                <ArrowCircle variant="deep" />
              </Link>
              <Link
                href="/water-purifiers"
                className="group/card card-line flex items-center gap-4 p-4 pr-5 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-5"
              >
                <IconBadge>
                  <House />
                </IconBadge>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-bold text-ink">Renting for your home?</span>
                  <span className="mt-0.5 block text-sm text-muted">Buying is usually the better long-term value.</span>
                </span>
                <ArrowCircle variant="deep" />
              </Link>
            </div>
          </div>

          <div data-reveal="up" className="card-line rounded-card-xl p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <h3 className="font-display text-h3 font-bold text-ink">Tell us about your workplace</h3>
            <p className="mt-2 mb-8 text-[15px] text-muted">
              Share your team size, locations and water source. We’ll reply with next steps and arrange a site assessment.
            </p>
            <LeadForm type="rental" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={rentalFaqs} title="Rental questions, answered" />
      <CtaBand />
    </>
  );
}
