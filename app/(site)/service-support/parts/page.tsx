import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, MessageCircle, ScanSearch } from "lucide-react";
import { CtaBand } from "@/components/sections/cta-band";
import { HeroStrip, PageHero } from "@/components/sections/page-hero";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { partCategories, type Part } from "@/content/parts";
import { getAmc, getParts, getSiteSettings } from "@/lib/cms/content";
import { whatsappHref } from "@/lib/contact";
import { formatLKR, keepLastWords } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { heroImages } from "@/content/images";

export const metadata: Metadata = pageMetadata({
  title: "Filters, Parts & Accessories",
  description:
    "Genuine LUSAKO water filter cartridges with prices: sediment, carbon, UF, RO and mineral filters, plus purifier spare parts and accessories, fitted for you.",
  path: "/service-support/parts",
});

/** The service form, set to "Filters, spare parts or accessories", with the part named in the message. */
function partHref(part?: Pick<Part, "name">) {
  const query = new URLSearchParams({ type: "service", serviceType: "parts" });
  if (part) query.set("issue", `I’d like a price for: ${part.name}.`);
  return `/contact?${query}#quote`;
}

export default async function PartsPage() {
  const [parts, { contact }, amc] = await Promise.all([getParts(), getSiteSettings(), getAmc()]);
  const filterOff = Math.max(...amc.plans.map((plan) => plan.filterDiscount));
  const partsOff = Math.max(...amc.plans.map((plan) => plan.partsDiscount));
  const discountNote = (category: Part["category"]) => {
    if (category === "filters" && filterOff > 0) return ` AMC customers save up to ${filterOff}% on eligible filters.`;
    if (category === "spare-parts" && partsOff > 0) return ` AMC customers save up to ${partsOff}% on eligible spare parts.`;
    return "";
  };

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Service & support", href: "/service-support" },
          { label: "Filters, parts & accessories", href: "/service-support/parts" },
        ]}
        eyebrow="Genuine LUSAKO parts"
        title={["Filters, parts", <>&amp; <Highlight>accessories</Highlight></>]}
        description="Genuine filter cartridges, spare parts and accessories that keep your purifier performing, fitted by LUSAKO technicians if you need us."
        actions={[
          { label: "Ask for a part", href: partHref() },
          ...(contact.whatsappSales
            ? [{ label: "WhatsApp us", href: whatsappHref(contact.whatsappSales, "Hi LUSAKO, I’m looking for a filter or spare part."), icon: MessageCircle, external: true, srLabel: "(opens WhatsApp)" }]
            : []),
        ]}
        image={{ src: heroImages.parts, position: "object-right" }}
      />
      <HeroStrip
        title="The right part for your model"
        description="Tell us your model and serial number and we’ll match the part, or fit it for you."
        pills={partCategories.map((category) => category.short)}
      />

      <section aria-label="Categories" className="pt-12 md:pt-16 lg:pt-20">
        <Container>
          <ul className="grid gap-4 md:grid-cols-3 lg:gap-5">
            {partCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`#${category.id}`}
                  className="group/card card-line flex h-full flex-col p-6 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-7"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="grid size-16 place-items-center rounded-card-sm bg-tint-2">
                      <BrandIcon name={category.icon} size={48} />
                    </span>
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-deep text-white transition-transform duration-300 ease-emph group-hover/card:translate-y-1">
                      <ArrowDown className="size-[18px]" strokeWidth={1.75} />
                    </span>
                  </span>
                  <span className="mt-auto block pt-10 font-display text-h3 font-bold text-ink">{category.title}</span>
                  <span className="mt-2 block text-[15px] leading-relaxed text-muted">{category.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {partCategories.map((category) => {
        const items = parts.filter((part) => part.category === category.id);
        return (
          <section key={category.id} id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-24 py-16 md:py-20 lg:py-24">
            <Container>
              <SectionHeading
                layout="split"
                eyebrow={category.short}
                title={<span id={`${category.id}-title`}>{category.title}</span>}
                description={category.body}
                action={
                  <ButtonLink href={partHref({ name: category.title.toLowerCase() })} variant="outline" arrow>
                    Ask about {category.short.toLowerCase()}
                  </ButtonLink>
                }
              />
              {items.length > 0 ? (
                <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
                  {items.map((part) => (
                    <li key={part.id}>
                      <Link
                        href={partHref(part)}
                        className="group/card card-line flex h-full items-center gap-5 p-4 pr-5 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-5"
                      >
                        <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-card-sm bg-tint-2">
                          {part.image ? (
                            <Image src={part.image} alt="" fill sizes="80px" className="object-contain p-2" />
                          ) : (
                            <BrandIcon name={category.icon} size={44} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg leading-snug font-bold text-ink">{keepLastWords(part.name)}</span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted">{keepLastWords(part.description)}</span>
                          <span className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
                            <span className="font-semibold text-deep">{part.price ? formatLKR(part.price) : "Ask for a price"}</span>
                            {part.life && <span className="text-[13px] text-muted">Typical life about {part.life} months</span>}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-10 rounded-card-sm border border-dashed border-line p-6 text-muted">
                  Ask our team for the {category.short.toLowerCase()} that fit your purifier.
                </p>
              )}
              {items.some((part) => part.price || part.life) && (
                <p className="mt-5 text-sm leading-relaxed text-muted">
                  {items.some((part) => part.price) && "Standard prices, excluding applicable taxes."}
                  {items.some((part) => part.life) && " Replacement intervals vary with water quality, usage and operating conditions."}
                  {discountNote(category.id)}{" "}
                  {discountNote(category.id) && (
                    <Link href="/service-support/amc#plans" className="font-semibold text-deep underline-offset-4 hover:underline">
                      See AMC plans
                    </Link>
                  )}
                </p>
              )}
            </Container>
          </section>
        );
      })}

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <div data-expand className="relative isolate flex flex-col gap-8 overflow-hidden rounded-card-xl bg-tint-2 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-brand/35" />
            <div className="relative flex max-w-2xl gap-5">
              <IconBadge variant="white" size="lg" framed brand={false} className="hidden sm:inline-grid">
                <ScanSearch />
              </IconBadge>
              <div>
                <h2 className="text-h2 font-semibold text-ink">Not sure which part you need?</h2>
                <p className="mt-3 text-lead text-muted">
                  Send us the model and serial number from your purifier. Our technicians will identify the right part, and fit it for you if
                  you like.
                </p>
              </div>
            </div>
            <ButtonLink href={partHref()} size="lg" arrow className="relative w-full sm:w-auto">
              Ask for a part
            </ButtonLink>
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow="LUSAKO Care"
        title={
          <>
            Filters due for a change?
            <br className="hidden sm:block" /> Let us take care of it.
          </>
        }
        description="An AMC plans filter changes and maintenance for the year ahead, so your purifier keeps performing."
        href="/service-support/amc"
        buttonLabel="See AMC plans"
      />
    </>
  );
}
