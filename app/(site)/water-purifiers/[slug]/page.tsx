import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CircleCheck,
  ConciergeBell,
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
import { PurchaseOptions } from "@/components/products/purchase-options";
import { ProductCard } from "@/components/products/product-card";
import { TrackView } from "@/components/products/track-view";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroCard } from "@/components/sections/hero-card";
import { Breadcrumbs } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { SnapRow } from "@/components/ui/snap-row";
import {
  productCare,
  productFacts,
  productFaqs,
  productFeatures,
  productFiltration,
  productHero,
  productOptions,
  productOthers,
  productSpecs,
  productWhoFor,
} from "@/content/copy/product";
import { purifiersCard } from "@/content/copy/purifiers";
import { fill, pieces, plain, runs } from "@/content/copy/schema";
import type { Faq } from "@/content/faqs";
import {
  productCodes,
  productFiltrations,
  productMaintenanceNote,
  productPriceFrom,
  productRentalFrom,
  productTypeLabel,
  type Product,
} from "@/content/products";
import { site } from "@/content/site";
import { getCopy, getFaqs, getPricing, getProduct, getProducts, getRentalPrices } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { JsonLd } from "@/lib/jsonld";
import { organizationRef, pageMetadata } from "@/lib/seo";

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

/** The plain-language UF / RO cards, in this order. Their wording (from content/faqs) is the product.filtration block. */
const guideCodes = ["UF", "RO"] as const;

/** A monthly rental as the brief writes it, with its terms: "LKR 4,990/month + VAT". */
const monthly = (amount: number) => `${formatLKR(amount)}/month + VAT`;

/**
 * A heading from Page text: the *marked* phrase through `mark`, each {token} filled in as a piece of its own, and the
 * product's name (with any punctuation right after it) kept on one line in an inline-block span, as designed.
 */
function heading(
  text: string,
  values: Record<string, string>,
  mark: (phrase: ReactNode) => ReactNode = (phrase) => <Highlight>{phrase}</Highlight>,
): ReactNode {
  return runs(text).map((run, i) =>
    run.marked ? (
      <Fragment key={i}>{mark(pieces(run.text, values))}</Fragment>
    ) : (
      <Fragment key={i}>
        {run.text.split(/(\{name\}[^\s*{]*)/).map((part, j) =>
          part.startsWith("{name}") && values.name !== undefined ? (
            <span key={j} className="inline-block">
              {values.name}
              {part.slice("{name}".length)}
            </span>
          ) : (
            <Fragment key={j}>{pieces(part, values)}</Fragment>
          ),
        )}
      </Fragment>
    ),
  );
}

/** Icons are matched to the product copy by keyword, so products added in the admin get fitting icons too. */
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

function matchIcon(title: string, rules: [RegExp, LucideIcon][], fallback: LucideIcon) {
  return rules.find(([pattern]) => pattern.test(title))?.[1] ?? fallback;
}

function filtrationTitle(product: Product, copy: typeof productFiltration.defaults): ReactNode {
  const filtrations = productFiltrations(product);
  const mark = (phrase: ReactNode) => <Highlight className="text-mist">{phrase}</Highlight>;
  if (filtrations.length > 1) return marked(copy.titleSeveral, { mark });
  if (filtrations.length === 1) return heading(copy.titleOne, { filtration: filtrations[0] }, mark);
  return marked(copy.titleNone, { mark });
}

/**
 * Product FAQs, worked out from the product data and its shown rent price, then the general warranty answer and the
 * product's own questions from the admin.
 */
function questionsFor(
  product: Product,
  {
    copy,
    maintenance,
    initialPayment,
    more,
  }: { copy: typeof productFaqs.defaults; maintenance: string; initialPayment: number | null; more: Faq[] },
): Faq[] {
  const { name } = product;
  const note = product.filtrationNote;

  const filtrations = productFiltrations(product);
  const filtration: Faq =
    filtrations.length > 1
      ? { topic: "purification", q: copy.filtrationSeveralQuestion, a: fill(copy.filtrationSeveralAnswer, { note }) }
      : filtrations.length === 1
        ? { topic: "purification", q: fill(copy.filtrationOneQuestion, { name }), a: fill(copy.filtrationOneAnswer, { note }) }
        : { topic: "purification", q: fill(copy.filtrationNoneQuestion, { name }), a: note };

  // While the rent price is hidden the answer explains how rental is charged; once shown it leads with the price. The
  // initial payment is shown separately, so each case has its own wording.
  const rent = productRentalFrom(product);
  const initial = initialPayment ? formatLKR(initialPayment) : null;
  const rental: Faq = {
    topic: "rental",
    q: fill(copy.rentalQuestion, { name }),
    a: rent
      ? initial
        ? fill(copy.rentalAnswerWithPrices, { name, price: monthly(rent), initial })
        : fill(copy.rentalAnswerWithPrice, { name, price: monthly(rent) })
      : initial
        ? fill(copy.rentalAnswerWithInitial, { name, initial })
        : fill(copy.rentalAnswer, { name }),
  };

  return [
    filtration,
    rental,
    { topic: "service", q: copy.installationQuestion, a: product.installationNote },
    { topic: "service", q: copy.maintenanceQuestion, a: maintenance },
    ...more,
  ];
}

// Products added in the admin after a build are rendered on their first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

/** The summary, plus where and how to get the purifier when that still fits the ~160 characters search results show. */
function withPlace(summary: string) {
  const longer = `${summary.trim().replace(/\.?$/, ".")} Buy or rent in Sri Lanka.`;
  return longer.length <= 160 ? longer : summary;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  // The admin's own search title and description win; otherwise they're worked out from the product.
  return pageMetadata({
    title: product.seoTitle || `${product.name} – ${product.tagline}`,
    description: product.seoDescription || withPlace(product.summary),
    path: `/water-purifiers/${product.slug}`,
    image: { url: `/og/products/${product.slug}`, width: 1200, height: 630, alt: `${product.name}: ${product.tagline}` },
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [
    product,
    products,
    pricing,
    rentalPrices,
    faqs,
    heroCopy,
    factsCopy,
    optionsCopy,
    featuresCopy,
    specsCopy,
    filtrationCopy,
    whoForCopy,
    careCopy,
    faqsCopy,
    othersCopy,
    cardCopy,
  ] = await Promise.all([
    getProduct(slug),
    getProducts(),
    getPricing(),
    getRentalPrices(),
    getFaqs(),
    getCopy(productHero),
    getCopy(productFacts),
    getCopy(productOptions),
    getCopy(productFeatures),
    getCopy(productSpecs),
    getCopy(productFiltration),
    getCopy(productWhoFor),
    getCopy(productCare),
    getCopy(productFaqs),
    getCopy(productOthers),
    getCopy(purifiersCard),
  ]);
  if (!product) notFound();

  const path = `/water-purifiers/${product.slug}`;
  const url = new URL(path, site.url).toString();
  // Shown prices only: each is null while the admin keeps it hidden.
  const rent = productRentalFrom(product);
  const price = productPriceFrom(product);
  const filtrations = productFiltrations(product);
  const category = productTypeLabel(product.types[0]);
  const codes = productCodes(product);
  const others = products.filter((item) => item.slug !== product.slug);
  const name = { name: product.name };
  const maintenance = productMaintenanceNote(product, careCopy.maintenanceNote);

  const facts: { label: string; value: string; icon: LucideIcon }[] = [
    { label: factsCopy.facts[0], value: product.purification, icon: Droplets },
    { label: factsCopy.facts[1], value: product.temperatures.join(" · "), icon: Thermometer },
    { label: factsCopy.facts[2], value: product.installation, icon: Wrench },
    { label: factsCopy.facts[3], value: product.warranty, icon: ShieldCheck },
  ];

  // The standard rows, then any the admin added to this product.
  const specs: { label: string; value: ReactNode }[] = [
    {
      label: codes.length > 1 ? specsCopy.modelNumbers : specsCopy.modelNumber,
      value: codes.length ? (
        <ul className="grid gap-1">
          {product.variants
            .filter((variant) => variant.code)
            .map((variant) => (
              <li key={variant.code}>
                {variant.code} <span className="text-muted">· {variant.label}</span>
              </li>
            ))}
        </ul>
      ) : (
        specsCopy.noModel
      ),
    },
    { label: specsCopy.category, value: product.types.map(productTypeLabel).join(" · ") },
    { label: specsCopy.purification, value: product.purification },
    { label: specsCopy.water, value: product.temperatures.join(" · ") },
    { label: specsCopy.installation, value: product.installation },
    { label: specsCopy.warranty, value: product.warranty },
    ...(product.specs ?? []),
  ];

  // Product data only once there's a purchase price: search engines treat a Product without offers as an error, and a
  // rental price in its place would read as the price of the machine.
  const productJsonLd = price
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.summary,
        image: new URL(product.image, site.url).toString(),
        brand: { "@type": "Brand", name: site.name },
        category,
        url,
        ...(codes[0] ? { sku: codes[0], mpn: codes[0] } : {}),
        offers: product.variants
          .filter((variant) => variant.price)
          .map((variant) => ({
            "@type": "Offer",
            name: `${product.name} ${variant.label}`,
            ...(variant.code ? { sku: variant.code } : {}),
            url: `${url}#options`,
            price: variant.price,
            priceCurrency: "LKR",
            itemCondition: "https://schema.org/NewCondition",
            availability: "https://schema.org/InStock",
            seller: organizationRef,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: variant.price,
              priceCurrency: "LKR",
              valueAddedTaxIncluded: false,
            },
          })),
      }
    : null;

  return (
    <>
      {productJsonLd && <JsonLd data={productJsonLd} />}
      <TrackView slug={product.slug} name={product.name} />

      {/* Hero: the compact dark card every page opens with, the purifier standing on a soft blue glow. On phones the
          name comes first, then the product, then the facts and the two CTAs. */}
      <HeroCard labelledBy="page-title">
        <WaveLines lines={4} className="absolute inset-x-0 bottom-0 -z-10 h-1/2 w-full text-brand/25" />
        <div className="grid items-center gap-y-8 px-5 pt-[calc(var(--header-h)+2rem)] pb-10 sm:px-8 sm:pb-12 lg:min-h-[min(38rem,70svh)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-x-12 lg:px-[calc(var(--edge)-5px)] lg:pb-14">
          <div className="max-w-[36rem] lg:col-start-1 lg:row-start-1 lg:self-end">
            <Breadcrumbs
              items={[
                { label: "Water purifiers", href: "/water-purifiers" },
                { label: product.name, href: path },
              ]}
              tone="dark"
              className="rise mb-6"
            />
            <div className="rise mb-6" style={delay(40)}>
              <Pill variant="glass">{category}</Pill>
            </div>
            <h1
              id="page-title"
              className="font-display text-[length:clamp(1.85rem,1.25rem+2.6vw,3rem)] leading-[1.08] font-bold tracking-[-0.03em] wrap-break-word"
            >
              <span className="line-mask line-in">
                <span className="line" style={delay(120)}>
                  {product.name}
                </span>
              </span>
            </h1>
            <p className="rise mt-3 font-display text-lead font-semibold text-mist" style={delay(200)}>
              {product.tagline}
            </p>
          </div>

          <div className="film-enter relative mx-auto aspect-square w-full max-w-[20rem] sm:max-w-[24rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-[32rem]">
            <span aria-hidden className="absolute inset-[16%] rounded-full bg-brand/40 blur-3xl" />
            <Image
              src={product.image}
              alt={`${product.name}, ${product.tagline.toLowerCase()}`}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 32rem, 24rem"
              data-no-parallax
              className="object-contain p-[7%] drop-shadow-float"
            />
          </div>

          <div className="max-w-[36rem] lg:col-start-1 lg:row-start-2 lg:self-start">
            {/* While its prices are hidden (client, October 2026) buying and renting are both quoted. Once one is
                shown, the rental promotion leads (client: "promote rental from LKR …") and the buy price follows. */}
            <ul className="rise flex flex-wrap gap-2" style={delay(260)}>
              {rent || price ? (
                <>
                  <li>
                    <Pill variant="white">{rent ? fill(heroCopy.rentPillWithPrice, { price: monthly(rent) }) : heroCopy.rentPillOnRequest}</Pill>
                  </li>
                  <li>
                    <Pill variant="glass">
                      {price
                        ? fill(product.variants.length > 1 ? heroCopy.buyPillWithPrice : heroCopy.buyPillWithPriceOne, {
                            price: `${formatLKR(price)} + VAT`,
                          })
                        : heroCopy.buyPillOnRequest}
                    </Pill>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Pill variant="white">{heroCopy.pill}</Pill>
                  </li>
                  {product.warranty && (
                    <li>
                      <Pill variant="glass">{pieces(heroCopy.warrantyPill, { warranty: product.warranty })}</Pill>
                    </li>
                  )}
                </>
              )}
              {filtrations.length > 1 && (
                <li>
                  <Pill variant="glass">{product.variants.map((variant) => variant.label).join(" · ")}</Pill>
                </li>
              )}
            </ul>
            <div className="rise mt-8 flex flex-wrap gap-3" style={delay(320)}>
              <ButtonLink href="#options" variant="white" size="lg" arrow className="w-full sm:w-auto">
                {heroCopy.quoteButton}
              </ButtonLink>
              <ButtonLink
                href={`/contact?type=rental&preferredMachine=${product.slug}#quote`}
                variant="glass"
                size="lg"
                arrow
                className="w-full sm:w-auto"
              >
                {heroCopy.rentButton}
              </ButtonLink>
            </div>
          </div>
        </div>
      </HeroCard>

      {/* The facts and the brief's Buy / Rent cards, right under the hero. */}
      <section className="py-16 md:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12" data-no-reveal>
          <div data-reveal="up" className="lg:col-span-5">
            <p className="label">
              {category} · {product.purification}
            </p>
            <p className="mt-5 max-w-xl text-lead text-muted">{product.summary}</p>
            {codes.length > 0 && (
              <p className="mt-4 text-sm text-muted">
                {codes.length > 1 ? factsCopy.modelSeveral : factsCopy.modelOne} {codes.join(" / ")}
              </p>
            )}
            <dl className="mt-8 grid grid-cols-2 gap-2 sm:gap-3">
              {facts.map(({ label, value, icon: Icon }, i) => (
                <div key={i} className="card-line rounded-card-sm p-3.5 sm:p-5">
                  <dt className="flex items-center gap-1.5 font-display text-xs font-bold tracking-[0.1em] text-deep uppercase sm:gap-2 sm:tracking-[0.14em]">
                    <Icon aria-hidden className="size-3.5 shrink-0 text-brand max-[349px]:hidden" strokeWidth={2} />
                    {label}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-snug font-semibold text-ink sm:text-base">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div id="options" data-reveal="up" className="scroll-mt-28 lg:col-span-7">
            {/* Buy UF, buy RO or rent (client request): the options side by side, the quote buttons follow the choice. */}
            <PurchaseOptions
              slug={product.slug}
              name={product.name}
              variants={product.variants}
              copy={optionsCopy}
              koko={pricing.koko}
              initialPayment={rentalPrices.initial}
            />

            <p className="mt-5 text-[15px] text-muted">
              {factsCopy.notSure}{" "}
              <Link href="/find-my-solution" className="group -my-2.5 inline-flex items-center gap-1 py-2.5 font-semibold text-deep">
                {factsCopy.finderLink}
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
              eyebrow={featuresCopy.eyebrow}
              title={heading(featuresCopy.title, name, (phrase) => <Highlight className="inline-block">{phrase}</Highlight>)}
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
                const Icon = matchIcon(feature.title, featureRules, CircleCheck);
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
                eyebrow={specsCopy.eyebrow}
                title={heading(specsCopy.title, name)}
              />
              <p data-reveal="up" className="mt-5 max-w-sm text-muted">{specsCopy.text}</p>
              <div data-reveal="up" className="mt-6">
                <ButtonLink href={`/contact?type=buy&model=${product.slug}`} variant="outline" arrow>
                  {specsCopy.button}
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="card-line overflow-hidden rounded-card-xl">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">{product.name} specifications</caption>
                  <tbody data-stagger>
                    {specs.map((row, i) => (
                      <tr key={`${i}-${row.label}`} className={cn(i > 0 && "border-t border-line")}>
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
                  <Pill variant="glass">{filtrationCopy.pill}</Pill>
                  <h2 className="mt-5 text-h2 font-bold">{filtrationTitle(product, filtrationCopy)}</h2>
                  <p className="mt-5 text-lead text-white">{product.filtrationNote}</p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <ButtonLink href="/find-my-solution" variant="white" arrow className="w-full sm:w-auto">
                      {filtrationCopy.button}
                    </ButtonLink>
                    <p className="text-sm text-white/85">{filtrationCopy.buttonNote}</p>
                  </div>
                </div>
                <ul data-stagger className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:self-end">
                  {guideCodes.map((code, i) => {
                    const guide = { code, ...filtrationCopy.guide[i] };
                    const onModel = filtrations.includes(guide.code);
                    const model = product.variants.find((item) => item.filtration === guide.code && item.code);
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
                          {onModel
                            ? model?.code
                              ? fill(filtrationCopy.onModelCode, { code: model.code })
                              : filtrationCopy.onModel
                            : filtrationCopy.otherModels}
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
              eyebrow={whoForCopy.eyebrow}
              title={heading(whoForCopy.title, name, (phrase) => <Highlight className="inline-block">{phrase}</Highlight>)}
            />
            <ul className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-14 lg:gap-5">
              {product.whoFor.map((audience) => {
                const Icon = matchIcon(audience.title, audienceRules, Users);
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
              eyebrow={careCopy.eyebrow}
              title={marked(careCopy.title)}
              description={careCopy.description}
            />
            <div className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-3 lg:gap-5">
              <article id="installation" className="card-line flex flex-col md:scroll-mt-44 rounded-card-xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <IconBadge>
                    <Wrench />
                  </IconBadge>
                  <Pill variant="tint">{product.installation}</Pill>
                </div>
                <h3 className="mt-10 font-display text-h3 font-bold text-ink">{careCopy.installationTitle}</h3>
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
                <h3 className="relative mt-10 font-display text-h3 font-bold">{careCopy.warrantyTitle}</h3>
                <p className="relative mt-3 text-[15px] leading-relaxed text-white">{careCopy.warrantyText}</p>
              </article>

              <article id="maintenance" className="card-line flex flex-col md:scroll-mt-44 rounded-card-xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <IconBadge>
                    <CalendarCheck />
                  </IconBadge>
                  <Pill variant="tint">{careCopy.maintenancePill}</Pill>
                </div>
                <h3 className="mt-10 font-display text-h3 font-bold text-ink">{careCopy.maintenanceTitle}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{maintenance}</p>
                <div className="mt-auto pt-6">
                  <Link
                    href="/service-support"
                    className="group inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-deep transition-colors hover:text-brand"
                  >
                    {careCopy.serviceLink}
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:rotate-45" />
                  </Link>
                </div>
              </article>
            </div>
          </Container>
        </section>

        <FaqSection
          faqs={questionsFor(product, {
            copy: faqsCopy,
            maintenance,
            initialPayment: rentalPrices.initial,
            more: [
              ...faqs.filter((faq) => faq.key === "warranty"),
              ...(product.faqs ?? []).map(({ q, a }): Faq => ({ topic: "buying", q, a })),
            ],
          })}
          title={heading(faqsCopy.title, name)}
        />
      </div>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={othersCopy.eyebrow}
            title={marked(othersCopy.title)}
            action={
              <ButtonLink href="/water-purifiers" variant="outline" arrow>
                {othersCopy.button}
              </ButtonLink>
            }
          />
        </Container>
        <SnapRow label={plain(othersCopy.title)} className="mt-12">
          {others.map((item) => (
            <li key={item.slug} className="w-[80vw] shrink-0 snap-start sm:w-[340px]">
              <ProductCard product={item} copy={cardCopy} />
            </li>
          ))}
        </SnapRow>
      </section>

      <CtaBand />
    </>
  );
}
