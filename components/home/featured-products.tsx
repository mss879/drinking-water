import { ProductRail } from "@/components/products/product-rail";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { marked } from "@/components/ui/marked";
import { SectionHeading } from "@/components/ui/section-heading";
import { homeFeatured } from "@/content/copy/home";
import { purifiersCard } from "@/content/copy/purifiers";
import type { Product } from "@/content/products";
import { getCopy } from "@/lib/cms/content";

/**
 * The purifier range as the StomDent carousel. On large screens the section holds still while the cards slide
 * past sideways with the scroll (`data-hscroll`, components/motion/motion-root.tsx). The cards ask for a quote
 * unless the admin lets shown prices onto the home page (`showPrices`). Its heading is the home.featured block; the
 * cards' Buy and Rent tile wording is the catalogue's (purifiers.card).
 */
export async function FeaturedProducts({ products, showPrices = false }: { products: Product[]; showPrices?: boolean }) {
  const [copy, card] = await Promise.all([getCopy(homeFeatured), getCopy(purifiersCard)]);
  return (
    <section data-hscroll className="relative overflow-x-clip">
      <div
        data-hscroll-stage
        className="py-16 md:py-20 lg:overflow-hidden lg:py-28 motion-safe:lg:sticky motion-safe:lg:top-(--header-h) motion-safe:lg:flex motion-safe:lg:h-[calc(100svh-var(--header-h))] motion-safe:lg:min-h-[640px] motion-safe:lg:flex-col motion-safe:lg:justify-center motion-safe:lg:py-8"
      >
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={copy.eyebrow}
            title={marked(copy.title)}
            action={
              <ButtonLink href="/water-purifiers" variant="outline" arrow>
                {copy.button}
              </ButtonLink>
            }
          />
        </Container>
        <div className="mt-12 lg:mt-10">
          <ProductRail products={products} label="LUSAKO water purifiers" showPrices={showPrices} cardCopy={card} />
        </div>
      </div>
    </section>
  );
}
