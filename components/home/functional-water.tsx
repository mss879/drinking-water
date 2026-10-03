import { FunctionalWaterGrid } from "@/components/sections/functional-water-grid";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";

/** Functional water solutions on the home page (client: "highlight our functional water solutions more clearly"). */
export function FunctionalWater() {
  return (
    <section aria-labelledby="functional-water-title" className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          layout="split"
          eyebrow="Functional water"
          title={
            <span id="functional-water-title">
              More than pure. <Highlight className="inline-block">Functional water on tap.</Highlight>
            </span>
          }
          description="Sparkling, hydrogen and alkaline water from a LUSAKO system, purified first, then made just the way you like it."
          action={
            <ButtonLink href="/functional-water" variant="outline" arrow>
              Explore functional water
            </ButtonLink>
          }
        />
        <FunctionalWaterGrid className="mt-12 lg:mt-14" />
      </Container>
    </section>
  );
}
