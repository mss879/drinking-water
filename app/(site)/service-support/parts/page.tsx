import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, MessageCircle, ScanSearch } from "lucide-react";
import { CtaBand } from "@/components/sections/cta-band";
import { partsCategories, partsCta, partsHelp, partsHero, partsList, partsSeo, partsStrip } from "@/content/copy/parts";
import { HeroStrip, PageHero } from "@/components/sections/page-hero";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { IconBadge } from "@/components/ui/icon-badge";
import { marked } from "@/components/ui/marked";
import { SectionHeading } from "@/components/ui/section-heading";
import { fill } from "@/content/copy/schema";
import { partCategories, type Part } from "@/content/parts";
import { getAmc, getCopy, getParts, getPhotos, getSiteSettings } from "@/lib/cms/content";
import { whatsappHref } from "@/lib/contact";
import { formatLKR, keepLastWords } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(partsSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/service-support/parts" });
}

/** The service form, set to "Filters, spare parts or accessories", with `issue` (the part asked about) as its message. */
function partHref(issue?: string) {
  const query = new URLSearchParams({ type: "service", serviceType: "parts" });
  if (issue) query.set("issue", issue);
  return `/contact?${query}#quote`;
}

/** Fills {tokens} in as separate runs of text, the way a value written into JSX renders. */
function withValues(text: string, values: Record<string, string | number>): string[] {
  return text
    .split(/(\{[a-zA-Z]+\})/)
    .filter(Boolean)
    .map((run) => (/^\{[a-zA-Z]+\}$/.test(run) ? fill(run, values) : run));
}

export default async function PartsPage() {
  const [parts, { contact }, amc, photos, hero, strip, groups, list, help, cta] = await Promise.all([
    getParts(),
    getSiteSettings(),
    getAmc(),
    getPhotos(),
    getCopy(partsHero),
    getCopy(partsStrip),
    getCopy(partsCategories),
    getCopy(partsList),
    getCopy(partsHelp),
    getCopy(partsCta),
  ]);
  // The groups stay fixed (ids, order, icons); their names and descriptions come from Page text.
  const categories = partCategories.map((category, i) => ({ ...category, ...groups.categories[i] }));
  const enquiryHref = (name: string) => partHref(fill(list.enquiry, { part: name }));
  const filterOff = Math.max(...amc.plans.map((plan) => plan.filterDiscount));
  const partsOff = Math.max(...amc.plans.map((plan) => plan.partsDiscount));
  const discountNote = (category: Part["category"]) => {
    if (category === "filters" && filterOff > 0) return ` ${fill(list.filterDiscount, { percent: filterOff })}`;
    if (category === "spare-parts" && partsOff > 0) return ` ${fill(list.partsDiscount, { percent: partsOff })}`;
    return "";
  };

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Service & support", href: "/service-support" },
          { label: "Filters, parts & accessories", href: "/service-support/parts" },
        ]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.askButton, href: partHref() },
          ...(contact.whatsappSales
            ? [{ label: hero.whatsappButton, href: whatsappHref(contact.whatsappSales, hero.whatsappMessage), icon: MessageCircle, external: true, srLabel: "(opens WhatsApp)" }]
            : []),
        ]}
        image={{ src: photos.pageParts.src, position: "object-right" }}
      />
      <HeroStrip title={strip.title} description={strip.description} pills={categories.map((category) => category.short)} />

      <section aria-label="Categories" className="pt-12 md:pt-16 lg:pt-20">
        <Container>
          <ul className="grid gap-4 md:grid-cols-3 lg:gap-5">
            {categories.map((category) => (
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

      {categories.map((category) => {
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
                  <ButtonLink href={enquiryHref(category.title.toLowerCase())} variant="outline" arrow>
                    {withValues(list.askAbout, { category: category.short.toLowerCase() })}
                  </ButtonLink>
                }
              />
              {items.length > 0 ? (
                <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
                  {items.map((part) => (
                    <li key={part.id}>
                      <Link
                        href={enquiryHref(part.name)}
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
                            <span className="font-semibold text-deep">{part.price ? formatLKR(part.price) : list.noPrice}</span>
                            {part.life && <span className="text-[13px] text-muted">{withValues(list.life, { months: part.life })}</span>}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-10 rounded-card-sm border border-dashed border-line p-6 text-muted">
                  {withValues(list.empty, { category: category.short.toLowerCase() })}
                </p>
              )}
              {items.some((part) => part.price || part.life) && (
                <p className="mt-5 text-sm leading-relaxed text-muted">
                  {items.some((part) => part.price) && list.pricesNote}
                  {items.some((part) => part.life) && ` ${list.lifeNote}`}
                  {discountNote(category.id)}{" "}
                  {discountNote(category.id) && (
                    <Link href="/service-support/amc#plans" className="font-semibold text-deep underline-offset-4 hover:underline">
                      {list.amcLink}
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
                <h2 className="text-h2 font-semibold text-ink">{help.title}</h2>
                <p className="mt-3 text-lead text-muted">{help.body}</p>
              </div>
            </div>
            <ButtonLink href={partHref()} size="lg" arrow className="relative w-full sm:w-auto">
              {help.button}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <CtaBand copy={cta} href="/service-support/amc" />
    </>
  );
}
