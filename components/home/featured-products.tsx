import { ProductRail } from "@/components/products/product-rail";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/content/products";

/**
 * The purifier range as the StomDent carousel. On large screens the section holds still while the cards slide
 * past sideways with the scroll (`data-hscroll`, components/motion/motion-root.tsx).
 */
export function FeaturedProducts() {
  return (
    <section data-hscroll className="relative overflow-x-clip">
      <div
        data-hscroll-stage
        className="py-16 md:py-20 lg:overflow-hidden lg:py-28 motion-safe:lg:sticky motion-safe:lg:top-(--header-h) motion-safe:lg:flex motion-safe:lg:h-[calc(100svh-var(--header-h))] motion-safe:lg:min-h-[640px] motion-safe:lg:flex-col motion-safe:lg:justify-center motion-safe:lg:py-8"
      >
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Water purifiers"
            title={
              <>
                Find the right system for your <Highlight>water and lifestyle</Highlight>
              </>
            }
            action={
              <ButtonLink href="/water-purifiers" variant="outline" arrow>
                View all purifiers
              </ButtonLink>
            }
          />
        </Container>
        <div className="mt-12 lg:mt-10">
          <ProductRail products={products} label="LUSAKO water purifiers" />
        </div>
      </div>
    </section>
  );
}
