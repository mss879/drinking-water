import { ProductCard } from "@/components/products/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { SnapRow } from "@/components/ui/snap-row";
import { products } from "@/content/products";

export function FeaturedProducts() {
  return (
    <section className="py-14 lg:py-20">
      <Container className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Water purifiers"
          title={
            <>
              Find the right system for your <Highlight>water and lifestyle</Highlight>
            </>
          }
        />
        <ButtonLink href="/water-purifiers" variant="outline" arrow className="w-fit">
          View all purifiers
        </ButtonLink>
      </Container>
      <SnapRow label="LUSAKO water purifiers" className="mt-12">
        {products.map((product) => (
          <li key={product.slug} className="w-[80vw] shrink-0 snap-start sm:w-[330px]">
            <ProductCard product={product} />
          </li>
        ))}
      </SnapRow>
    </section>
  );
}
