import { FunctionalWaterGrid } from "@/components/sections/functional-water-grid";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { marked } from "@/components/ui/marked";
import { SectionHeading } from "@/components/ui/section-heading";
import { homeFunctionalWater } from "@/content/copy/home";
import { getCopy } from "@/lib/cms/content";

/**
 * Functional water solutions on the home page (client: "highlight our functional water solutions more clearly").
 * Its heading is the home.functionalWater block.
 */
export async function FunctionalWater() {
  const copy = await getCopy(homeFunctionalWater);
  return (
    <section aria-labelledby="functional-water-title" className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          layout="split"
          eyebrow={copy.eyebrow}
          title={
            <span id="functional-water-title">
              {marked(copy.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
            </span>
          }
          description={copy.description}
          action={
            <ButtonLink href="/functional-water" variant="outline" arrow>
              {copy.button}
            </ButtonLink>
          }
        />
        <FunctionalWaterGrid className="mt-12 lg:mt-14" />
      </Container>
    </section>
  );
}
