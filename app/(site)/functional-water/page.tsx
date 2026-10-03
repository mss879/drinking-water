import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { CtaBand } from "@/components/sections/cta-band";
import { FunctionalWaterGrid } from "@/components/sections/functional-water-grid";
import { HeroStrip, PageHero } from "@/components/sections/page-hero";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { Pill } from "@/components/ui/pill";
import { functionalWaters, type FunctionalWater } from "@/content/functional-water";
import { findProduct } from "@/content/products";
import { getProducts } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";
import { heroImages } from "@/content/images";

export const metadata: Metadata = pageMetadata({
  title: "Functional Water Solutions",
  description:
    "Sparkling, hydrogen and alkaline water on tap from LUSAKO: purified first, then made the way you like it, for homes, offices and hospitality.",
  path: "/functional-water",
});

/** The buy form, with the kind of water already named in the message. */
function askHref(water: FunctionalWater, productSlug?: string) {
  const query = new URLSearchParams({ type: "buy", message: `I’m interested in ${water.name.toLowerCase()}.` });
  if (productSlug) query.set("model", productSlug);
  return `/contact?${query}#quote`;
}

export default async function FunctionalWaterPage() {
  const products = await getProducts();

  return (
    <>
      <PageHero
        crumbs={[{ label: "Functional water", href: "/functional-water" }]}
        eyebrow="Functional water solutions"
        title={["More than pure:", <Highlight key="functional">functional water</Highlight>]}
        description="Sparkling, hydrogen and alkaline water from a LUSAKO system. Purified first, then made just the way you like it."
        actions={[
          { label: "Explore the options", href: "#options" },
          { label: "Ask our team", href: "/contact?type=buy&message=I%E2%80%99m%20interested%20in%20functional%20water.#quote" },
        ]}
        image={{ src: heroImages.functionalWater, position: "object-right" }}
      />
      <HeroStrip
        title="Functional water, without the bottles"
        description="Made fresh at the point of use, for homes, offices and hospitality."
        pills={["Sparkling", "Hydrogen", "Alkaline"]}
      />

      <section id="options" aria-label="Functional water options" className="scroll-mt-24 pt-12 md:pt-16 lg:pt-20">
        <Container>
          <FunctionalWaterGrid />
        </Container>
      </section>

      {functionalWaters.map((water, i) => {
        const product = water.productSlug ? findProduct(products, water.productSlug) : undefined;
        const flip = i % 2 === 1;
        return (
          <section key={water.id} id={water.id} aria-labelledby={`${water.id}-title`} className="scroll-mt-24 py-16 md:py-20 lg:py-24">
            <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16" data-no-reveal>
              <div data-reveal="up" className={cn("lg:col-span-6", flip && "lg:order-2")}>
                <Pill variant="tint">{String(i + 1).padStart(2, "0")} · Functional water</Pill>
                <h2 id={`${water.id}-title`} className="mt-5 text-h2 font-semibold text-ink">
                  {water.name}
                </h2>
                <p className="mt-4 max-w-xl text-lead text-muted">{water.body}</p>
                <ul className="mt-7 grid gap-2.5">
                  {water.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] text-ink">
                      <span aria-hidden className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-deep text-white">
                        <Check className="size-3" strokeWidth={2.5} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ButtonLink href={askHref(water, product?.slug)} arrow>
                    Ask about {water.id === "other" ? "functional water" : water.name.toLowerCase()}
                  </ButtonLink>
                  {product && (
                    <ButtonLink href={`/water-purifiers/${product.slug}`} variant="outline" arrow>
                      View {product.name}
                    </ButtonLink>
                  )}
                </div>
              </div>

              <div data-reveal="up" className={cn("lg:col-span-6", flip && "lg:order-1")}>
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-card-xl bg-tint-2">
                  <WaveLines lines={5} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand/40" />
                  {product ? (
                    <Image
                      src={product.image}
                      alt={`${product.name}, ${product.tagline.toLowerCase()}`}
                      fill
                      sizes="(min-width: 1024px) 45vw, 90vw"
                      className="object-contain p-10 drop-shadow-float"
                    />
                  ) : (
                    <span className="relative grid size-48 place-items-center rounded-full bg-white/70 shadow-soft backdrop-blur-sm sm:size-56">
                      <BrandIcon name={water.icon} size={128} />
                    </span>
                  )}
                  {product && <Pill className="absolute top-4 left-4">{product.name}</Pill>}
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      <CtaBand
        eyebrow="Functional water"
        title={
          <>
            Which functional water
            <br className="hidden sm:block" /> suits your space?
          </>
        }
        description="Tell us who will drink it and where. LUSAKO recommends the right functional water solution and purification for your water."
        href="/contact?type=buy&message=I%E2%80%99m%20interested%20in%20functional%20water.#quote"
        buttonLabel="Ask our team"
      />
    </>
  );
}
