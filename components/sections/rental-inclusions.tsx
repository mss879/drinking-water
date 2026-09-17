import { ArrowUpRight } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { rentalInclusions } from "@/content/services";

/** "One Monthly Payment. Complete Water Care." — laid out like the reference "Get Involved" list. */
export function RentalInclusions({ showCta = true }: { showCta?: boolean }) {
  return (
    <section id="included" className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-3xl text-h2 font-medium text-ink">
            One monthly payment. Complete water care.{" "}
            <ArrowUpRight aria-hidden className="inline size-[0.8em] align-[-0.1em] text-brand" strokeWidth={1.5} />
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-muted lg:pb-2">
            Rental is a service, not just a machine lease: equipment, installation, preventive maintenance and support according to your
            agreed plan.
          </p>
        </div>
        <Accordion
          className="mt-10"
          defaultOpen={1}
          items={rentalInclusions.map((item) => ({
            title: item.lead,
            content: (
              <>
                <strong className="font-medium text-ink">{item.title}.</strong> {item.body}
              </>
            ),
          }))}
        />
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-subtle">Exact inclusions are confirmed in your rental agreement.</p>
          {showCta && (
            <ButtonLink href="/rental" variant="dark" arrow className="w-full sm:w-auto">
              Explore rental
            </ButtonLink>
          )}
        </div>
      </Container>
    </section>
  );
}
