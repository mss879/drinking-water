import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Faq } from "@/content/faqs";

export function FaqSection({
  faqs,
  eyebrow = "FAQs",
  title = "Questions, answered",
  showAllLink = true,
}: {
  faqs: Faq[];
  eyebrow?: string;
  title?: string;
  showAllLink?: boolean;
}) {
  return (
    <section id="faqs" className="py-14 lg:py-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <p className="mt-5 max-w-sm text-muted">
            Can’t find your answer?{" "}
            <Link href="/contact" className="font-medium text-ink underline decoration-sky underline-offset-4 transition-colors hover:decoration-brand">
              Talk to our team
            </Link>
            .
          </p>
          {showAllLink && (
            <ButtonLink href="/faq" variant="outline" arrow className="mt-8">
              See all FAQs
            </ButtonLink>
          )}
        </div>
        <Accordion className="lg:col-span-8" defaultOpen={0} items={faqs.map((faq) => ({ title: faq.q, content: faq.a }))} />
      </Container>
    </section>
  );
}
