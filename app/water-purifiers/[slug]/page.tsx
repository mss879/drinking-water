import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CircleCheck,
  ConciergeBell,
  Droplet,
  Droplets,
  Factory,
  Gem,
  GlassWater,
  HeartHandshake,
  Hotel,
  House,
  MapPin,
  Pointer,
  Refrigerator,
  Ruler,
  School,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tent,
  Thermometer,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { TrackView } from "@/components/products/track-view";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqSection } from "@/components/sections/faq-section";
import { Breadcrumbs } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill, Tag } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { SnapRow } from "@/components/ui/snap-row";
import { faqs, type Faq } from "@/content/faqs";
import { rentalCharges } from "@/content/pricing";
import { getProduct, productMaintenanceNote, productRentalFrom, productTypeLabel, products, type Product } from "@/content/products";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { JsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** The brief's universal product page structure (Doc 1 §15), kept identical for every product. */
const sections = [
  { id: "features", label: "Features" },
  { id: "specifications", label: "Specifications" },
  { id: "filtration", label: "Filtration" },
  { id: "who-its-for", label: "Who it’s for" },
  { id: "installation", label: "Installation" },
  { id: "warranty", label: "Warranty" },
  { id: "maintenance", label: "Maintenance" },
  { id: "faqs", label: "FAQs" },
];

/** Plain-language UF / RO explanation, worded from content/faqs. */
const purificationGuide = [
  {
    code: "UF",
    name: "Ultrafiltration",
    fit: "For treated city water",
    body: "A fine membrane removes particles, sediment and microorganisms while keeping naturally occurring minerals.",
  },
  {
    code: "RO",
    name: "Reverse osmosis",
    fit: "For well water and higher TDS",
    body: "A much finer membrane also reduces dissolved salts and other dissolved solids (TDS).",
  },
] as const;

/** Icons are matched to the product copy once, at module level, so render only does a lookup. */
const featureRules: [RegExp, LucideIcon][] = [
  [/sparkling/i, Sparkles],
  [/bottleless/i, GlassWater],
  [/temperature|hot and cold/i, Thermometer],
  [/matched|purification/i, Droplets],
  [/compact/i, Ruler],
  [/freestanding|floor-standing/i, Refrigerator],
  [/everyday/i, BadgeCheck],
  [/simple/i, Pointer],
  [/anywhere/i, MapPin],
  [/care/i, HeartHandshake],
  [/design|statement/i, Gem],
];

const audienceRules: [RegExp, LucideIcon][] = [
  [/home/i, House],
  [/hotel|hospitality|showroom/i, Hotel],
  [/clinic|waiting/i, Stethoscope],
  [/factor|canteen/i, Factory],
  [/school|institution/i, School],
  [/reception/i, ConciergeBell],
  [/event|pop-up/i, Tent],
  [/site|plumbing/i, Warehouse],
  [/office|executive|workplace|floor/i, Building2],
];

function iconMap(titles: string[], rules: [RegExp, LucideIcon][], fallback: LucideIcon): Record<string, LucideIcon> {
  return Object.fromEntries(titles.map((title) => [title, rules.find(([pattern]) => pattern.test(title))?.[1] ?? fallback]));
}

const featureIcons = iconMap(
  products.flatMap((product) => product.features.map((feature) => feature.title)),
  featureRules,
  CircleCheck,
);
const audienceIcons = iconMap(
  products.flatMap((product) => product.whoFor.map((audience) => audience.title)),
  audienceRules,
  Users,
);

function filtrationTitle(product: Product): ReactNode {
  if (product.filtration.length > 1) {
    return (
      <>
        UF or RO, <Highlight className="text-mist">matched to your water</Highlight>
      </>
    );
  }
  if (product.filtration.length === 1) {
    return (
      <>
        {product.filtration[0]} purification, <Highlight className="text-mist">built in</Highlight>
      </>
    );
  }
  return (
    <>
      Water from a <Highlight className="text-mist">bottled supply</Highlight>
    </>
  );
}

/** Product FAQs, derived only from the product and pricing data, plus the general warranty answer. */
function productFaqs(product: Product, rent: number | null): Faq[] {
  const { name } = product;
  const initial = formatLKR(rentalCharges.initialPaymentPerUnit);

  const filtration: Faq =
    product.filtration.length > 1
      ? {
          topic: "purification",
          q: "Should I choose the UF or RO version?",
          a: `${product.filtrationNote} Not sure about your water? Find My Solution recommends the right version, or our team can check your water for you.`,
        }
      : product.filtration.length === 1
        ? {
            topic: "purification",
            q: `Which water is the ${name} suited to?`,
            a: `${product.filtrationNote} If your home or workplace uses well water, talk to our team before you choose.`,
          }
        : { topic: "purification", q: `Does the ${name} purify water?`, a: product.filtrationNote };

  const rental: Faq = {
    topic: "rental",
    q: `Can I rent the ${name} instead of buying?`,
    a: rent
      ? `Yes. The ${name} is available to rent from ${formatLKR(rent)}/month + VAT, plus a one-time initial payment of ${initial} per unit in the first month. Home rentals also carry a refundable ${formatLKR(rentalCharges.domesticDepositPerUnit)} deposit, and outside the Western Province the Regional Hydration Service is added as a separate line. For most homes, buying is the better long-term value.`
      : `Rental of the ${name} is available on request: ask our team and we’ll recommend a monthly plan. Every rental starts with a one-time initial payment of ${initial} per unit, payable only in the first month.`,
  };

  return [
    filtration,
    rental,
    { topic: "service", q: "What does installation involve?", a: product.installationNote },
    { topic: "service", q: "What maintenance does it need?", a: productMaintenanceNote(product) },
    ...faqs.filter((faq) => faq.topic === "buying" && /warranty/i.test(faq.q)),
  ];
}

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return pageMetadata({
    title: `${product.name} – ${product.tagline}`,
    description: product.summary,
    path: `/water-purifiers/${product.slug}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const path = `/water-purifiers/${product.slug}`;
  const url = new URL(path, site.url).toString();
  const rent = productRentalFrom(product);
  const category = productTypeLabel(product.types[0]);
  const codes = product.models.map((model) => model.code);
  const others = products.filter((item) => item.slug !== product.slug);

  const facts: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Purification", value: product.purification, icon: Droplets },
    { label: "Water", value: product.temperatures.join(" · "), icon: Thermometer },
    { label: "Installation", value: product.installation, icon: Wrench },
    { label: "Warranty", value: product.warranty, icon: ShieldCheck },
  ];

  const specs: { label: string; value: ReactNode }[] = [
    {
      label: codes.length > 1 ? "Model numbers" : "Model number",
      value: codes.length ? (
        <ul className="grid gap-1">
          {product.models.map((model) => (
            <li key={model.code}>
              {model.code} <span className="text-muted">· {model.variant}</span>
            </li>
          ))}
        </ul>
      ) : (
        "Available on request"
      ),
    },
    { label: "Category", value: product.types.map(productTypeLabel).join(" · ") },
    { label: "Purification", value: product.purification },
    { label: "Water", value: product.temperatures.join(" · ") },
    { label: "Installation", value: product.installation },
    { label: "Warranty", value: product.warranty },
  ];

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image: new URL(product.image.src, site.url).toString(),
    brand: { "@type": "Brand", name: site.name },
    category,
    url,
    ...(codes[0] ? { sku: codes[0], mpn: codes[0] } : {}),
    ...(product.purchasePrice
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: product.purchasePrice,
            priceCurrency: "LKR",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: product.purchasePrice,
              priceCurrency: "LKR",
              valueAddedTaxIncluded: false,
            },
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <TrackView slug={product.slug} name={product.name} />

      {/* Hero. On mobile the name comes first, then the product, then facts and the two CTAs. */}
      <section className="relative isolate overflow-x-clip pt-6 pb-16 md:pb-20 lg:pt-10 lg:pb-28">
        <WaveLines lines={3} className="pointer-events-none absolute inset-x-0 top-24 -z-10 h-56 w-full text-brand/15" />
        <Container className="grid gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 xl:grid-cols-2 xl:gap-x-16">
          <div className="lg:col-start-2 lg:row-start-1 lg:pt-4">
            <Breadcrumbs
              items={[
                { label: "Water purifiers", href: "/water-purifiers" },
                { label: product.name, href: path },
              ]}
              className="rise [&_ol]:justify-start"
            />
            <div className="rise mt-7" style={delay(40)}>
              <Tag badge={site.name}>{category}</Tag>
            </div>
            <h1 className="rise mt-5 text-display font-bold wrap-break-word text-ink" style={delay(80)}>
              {product.name}
            </h1>
            <p className="rise mt-3 font-display text-lead font-semibold text-brand" style={delay(120)}>
              {product.tagline}
            </p>
          </div>

          <div className="rise relative lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start" style={delay(160)}>
            <div data-expand className="relative aspect-square overflow-hidden rounded-card-xl bg-tint-2 sm:aspect-[16/11] lg:aspect-[4/5]">
              <WaveLines lines={5} className="absolute inset-x-0 bottom-0 h-3/5 w-full text-brand/40" />
              <span
                aria-hidden
                className="absolute top-[54%] left-1/2 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
              />
              <span className="absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-full bg-deep text-white shadow-float sm:top-5 sm:left-5">
                <Droplet aria-hidden className="size-5" />
              </span>
              <Image
                src={product.image}
                alt={`${product.name}, ${product.tagline.toLowerCase()}`}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1280px) 580px, (min-width: 1024px) 40vw, 100vw"
                data-no-parallax
                className="object-contain px-[14%] pt-[13%] pb-[17%]"
              />
              <span className="absolute bottom-4 left-4 rounded-card-sm bg-white px-5 py-3.5 pr-6 shadow-float sm:bottom-5 sm:left-5">
                <span className="block font-display text-[15px] leading-tight font-bold text-ink">
                  {category} · {product.purification}
                </span>
                {codes.length > 0 && (
                  <span className="block text-xs text-muted">
                    {codes.length > 1 ? "Models" : "Model"} {codes.join(" / ")}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="rise lg:col-start-2 lg:row-start-2 lg:self-start" style={delay(200)}>
            <p className="max-w-xl text-muted">{product.summary}</p>

            <dl className="mt-8 grid grid-cols-2 gap-2 sm:gap-3">
              {facts.map(({ label, value, icon: Icon }) => (
                <div key={label} className="card-line rounded-card-sm p-3.5 sm:p-5">
                  <dt className="flex items-center gap-1.5 font-display text-xs font-bold tracking-[0.1em] text-deep uppercase sm:gap-2 sm:tracking-[0.14em]">
                    <Icon aria-hidden className="size-3.5 shrink-0 text-brand max-[349px]:hidden" strokeWidth={2} />
                    {label}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-snug font-semibold text-ink sm:text-base">{value}</dd>
                </div>
              ))}
            </dl>

            {/* The brief's two CTAs, side by side (Doc 1 §5). Prices only ever come from content/. */}
            <h2 className="sr-only">Buy or rent the {product.name}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="card-line flex flex-col p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-brand">Buy</h3>
                  <p className="text-sm text-muted">Own this system</p>
                </div>
                <p className="mt-4 font-display font-bold text-ink">
                  {product.purchasePrice ? (
                    <>
                      <span className="text-h3">{formatLKR(product.purchasePrice)}</span>
                      <span className="block text-sm font-normal text-muted">+ VAT</span>
                    </>
                  ) : (
                    <span className="text-lg">Price on request</span>
                  )}
                </p>
                <div className="mt-auto pt-6">
                  <ButtonLink href={`/contact?type=buy&model=${product.slug}`} variant="primary" arrow className="w-full">
                    Buy now
                  </ButtonLink>
                </div>
              </div>

              <div className="flex flex-col rounded-card bg-deep p-5 text-white sm:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">Rent</h3>
                  <p className="text-sm text-white">Monthly plan</p>
                </div>
                <p className="mt-4 font-display font-bold">
                  {rent ? (
                    <>
                      <span className="font-sans text-sm font-normal text-white">From </span>
                      <span className="text-h3">{formatLKR(rent)}</span>
                      <span className="block font-sans text-sm font-normal text-white">/month + VAT</span>
                    </>
                  ) : (
                    <span className="text-lg">Rental available on request</span>
                  )}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/85">
                  Plus a one-time {formatLKR(rentalCharges.initialPaymentPerUnit)} initial payment per unit.
                </p>
                <div className="mt-auto pt-6">
                  <ButtonLink href={`/contact?type=rental&preferredMachine=${product.slug}`} variant="white" arrow className="w-full">
                    {rent ? "Rent this model" : "Ask about rental"}
                  </ButtonLink>
                </div>
              </div>
            </div>

            <p className="mt-5 text-[15px] text-muted">
              Not sure which is right for you?{" "}
              <Link href="/find-my-solution" className="group -my-2.5 inline-flex items-center gap-1 py-2.5 font-semibold text-deep">
                Find my solution
                <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {/* The in-page nav sticks (from tablets up) only while the product detail sections are on screen. Its top
          padding fills the strip behind the floating navigation pill, so nothing scrolls between the two. On
          phones it stays in the flow: header + nav + the bottom action bar would cover a quarter of the screen. */}
      <div>
        <nav
          aria-label="On this page"
          className="z-30 border-y border-line bg-canvas md:sticky md:top-0 md:-mt-(--header-h) md:border-t-0 md:pt-(--header-h)"
        >
          <Container>
            <ul className="no-scrollbar -mx-(--gutter) flex gap-2 overflow-x-auto px-(--gutter) py-3 lg:mx-0 lg:px-0">
              {sections.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={`#${section.id}`}
                    className="inline-flex h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-medium whitespace-nowrap text-ink transition-colors duration-200 hover:border-deep hover:text-deep"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </nav>

        <section id="features" className="py-16 md:py-20 lg:py-28">
          <Container>
            <SectionHeading
              layout="split"
              eyebrow="Features"
              title={
                <>
                  Why choose the <Highlight className="inline-block">{product.name}</Highlight>
                </>
              }
              action={
                <ul aria-label="Highlights" className="flex flex-wrap gap-2 lg:justify-end">
                  {product.highlights.map((highlight) => (
                    <li key={highlight}>
                      <Pill variant="tint">{highlight}</Pill>
                    </li>
                  ))}
                </ul>
              }
            />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
              {product.features.map((feature) => {
                const Icon = featureIcons[feature.title] ?? CircleCheck;
                return (
                  <li key={feature.title} className="card-line flex flex-col p-6 sm:min-h-60">
                    <span className="grid size-16 place-items-center rounded-card-sm bg-tint">
                      <IconBadge size="sm">
                        <Icon />
                      </IconBadge>
                    </span>
                    <h3 className="mt-auto pt-6 font-display text-h3 font-bold text-ink sm:pt-10">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>

        <section id="specifications" className="py-16 md:py-20 lg:py-28">
          <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12" data-no-reveal>
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="Specifications"
                title={
                  <>
                    The <span className="inline-block">{product.name},</span> <Highlight>in detail</Highlight>
                  </>
                }
              />
              <p data-reveal="up" className="mt-5 max-w-sm text-muted">Full technical specifications are available on request.</p>
              <div data-reveal="up" className="mt-6">
                <ButtonLink href={`/contact?type=buy&model=${product.slug}`} variant="outline" arrow>
                  Request full specifications
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="card-line overflow-hidden rounded-card-xl">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">{product.name} specifications</caption>
                  <tbody data-stagger>
                    {specs.map((row, i) => (
                      <tr key={row.label} className={cn(i > 0 && "border-t border-line")}>
                        <th
                          scope="row"
                          className="w-2/5 px-5 py-4 align-top text-[15px] font-medium text-muted sm:w-1/3 sm:px-8 sm:py-5"
                        >
                          {row.label}
                        </th>
                        <td className="px-5 py-4 align-top text-[15px] font-medium text-ink sm:px-8 sm:py-5">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Container>
        </section>

        <section id="filtration" className="py-16 md:py-20 lg:py-28">
          <Container>
            <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-deep p-6 text-white sm:p-10 lg:p-14">
              <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
              <div className="relative grid gap-10 lg:grid-cols-12 lg:gap-12" data-no-reveal>
                <div data-reveal="up" className="lg:col-span-5">
                  <Pill variant="glass">Filtration</Pill>
                  <h2 className="mt-5 text-h2 font-bold">{filtrationTitle(product)}</h2>
                  <p className="mt-5 text-lead text-white">{product.filtrationNote}</p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <ButtonLink href="/find-my-solution" variant="white" arrow className="w-full sm:w-auto">
                      Check my water
                    </ButtonLink>
                    <p className="text-sm text-white/85">Three quick questions. We’ll recommend UF or RO.</p>
                  </div>
                </div>
                <ul data-stagger className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:self-end">
                  {purificationGuide.map((guide) => {
                    const onModel = product.filtration.includes(guide.code);
                    const model = product.models.find((item) => item.variant.startsWith(guide.code));
                    return (
                      <li
                        key={guide.code}
                        className="relative flex flex-col overflow-hidden rounded-card bg-white/10 p-6 sm:min-h-72 ring-1 ring-white/20 ring-inset backdrop-blur-sm"
                      >
                        <span
                          aria-hidden
                          className="absolute -top-2 right-4 font-display text-[5rem] leading-none font-extrabold tracking-[-0.05em] text-outline [--outline-c:var(--color-mist)] sm:text-[6.5rem]"
                        >
                          {guide.code}
                        </span>
                        <Pill variant={onModel ? "white" : "glass"} className="relative">
                          {onModel ? (model ? `Model ${model.code}` : "On this model") : "Other LUSAKO purifiers"}
                        </Pill>
                        <h3 className="relative mt-auto pt-10 font-display text-h3 font-bold sm:pt-14">
                          {guide.code} · {guide.name}
                        </h3>
                        <p className="relative mt-2 text-sm leading-relaxed text-white/85">
                          <span className="font-semibold text-white">{guide.fit}.</span> {guide.body}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        <section id="who-its-for" className="py-16 md:py-20 lg:py-28">
          <Container>
            <SectionHeading
              eyebrow="Who it’s for"
              title={
                <>
                  Where the <span className="inline-block">{product.name}</span> <Highlight className="inline-block">fits best</Highlight>
                </>
              }
            />
            <ul className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-14 lg:gap-5">
              {product.whoFor.map((audience) => {
                const Icon = audienceIcons[audience.title] ?? Users;
                return (
                  <li key={audience.title} className="relative flex min-h-56 flex-col overflow-hidden rounded-card bg-tint-2 p-6 sm:min-h-64 sm:p-7">
                    <WaveLines lines={4} className="absolute inset-x-0 top-4 h-2/5 w-full text-brand/35" />
                    <IconBadge variant="white" className="relative">
                      <Icon />
                    </IconBadge>
                    <div className="relative mt-auto pt-12">
                      <h3 className="font-display text-xl font-bold text-ink">{audience.title}</h3>
                      <p className="mt-4 text-[15px] leading-relaxed text-muted">{audience.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>

        {/* Installation, warranty and maintenance share one row; each card is its own nav target. */}
        <section className="py-16 md:py-20 lg:py-28">
          <Container>
            <SectionHeading
              layout="split"
              eyebrow="LUSAKO Care"
              title={
                <>
                  Set up, covered and <Highlight>cared for</Highlight>
                </>
              }
              description="Our team sets it up, a product warranty covers it, and LUSAKO Care keeps it performing."
            />
            <div className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-3 lg:gap-5">
              <article id="installation" className="card-line flex flex-col md:scroll-mt-44 rounded-card-xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <IconBadge>
                    <Wrench />
                  </IconBadge>
                  <Pill variant="tint">{product.installation}</Pill>
                </div>
                <h3 className="mt-10 font-display text-h3 font-bold text-ink">Installation</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{product.installationNote}</p>
              </article>

              <article id="warranty" className="relative flex flex-col md:scroll-mt-44 overflow-hidden rounded-card-xl bg-deep p-6 text-white sm:p-8">
                <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />
                <div className="relative flex items-start justify-between gap-4">
                  <IconBadge variant="white" framed>
                    <ShieldCheck />
                  </IconBadge>
                  <Pill variant="white">{product.warranty}</Pill>
                </div>
                <h3 className="relative mt-10 font-display text-h3 font-bold">Warranty</h3>
                <p className="relative mt-3 text-[15px] leading-relaxed text-white">
                  Every purchased LUSAKO system comes with a product warranty, plus access to LUSAKO after-sales service and Annual
                  Maintenance Contracts (AMC).
                </p>
              </article>

              <article id="maintenance" className="card-line flex flex-col md:scroll-mt-44 rounded-card-xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <IconBadge>
                    <CalendarCheck />
                  </IconBadge>
                  <Pill variant="tint">LUSAKO Care</Pill>
                </div>
                <h3 className="mt-10 font-display text-h3 font-bold text-ink">Maintenance</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{productMaintenanceNote(product)}</p>
                <div className="mt-auto pt-6">
                  <Link
                    href="/service-support"
                    className="group inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-deep transition-colors hover:text-brand"
                  >
                    Service & support
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:rotate-45" />
                  </Link>
                </div>
              </article>
            </div>
          </Container>
        </section>

        <FaqSection
          faqs={productFaqs(product, rent)}
          title={
            <>
              Questions about the <span className="inline-block">{product.name}</span>
            </>
          }
        />
      </div>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Explore the range"
            title={
              <>
                Other LUSAKO <Highlight>purifiers</Highlight>
              </>
            }
            action={
              <ButtonLink href="/water-purifiers" variant="outline" arrow>
                View all purifiers
              </ButtonLink>
            }
          />
        </Container>
        <SnapRow label="Other LUSAKO purifiers" className="mt-12">
          {others.map((item) => (
            <li key={item.slug} className="w-[80vw] shrink-0 snap-start sm:w-[340px]">
              <ProductCard product={item} />
            </li>
          ))}
        </SnapRow>
      </section>

      <CtaBand />
    </>
  );
}
