import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Faq } from "@/content/faqs";
import { waterRibbon } from "@/content/images";

/**
 * FAQs as the StomDent black block: the questions ruled on near-black with the open one lifted onto deep blue,
 * the water ribbon glowing beside the heading. The block opens out to the full width as it scrolls in.
 */
export function FaqSection({
  faqs,
  eyebrow = "FAQs",
  title = "Questions, answered",
  showAllLink = true,
}: {
  faqs: Faq[];
  eyebrow?: string;
  title?: ReactNode;
  showAllLink?: boolean;
}) {
  return (
    <section id="faqs" className="py-6 lg:py-8">
      <div data-expand="full" data-surface="dark" className="relative isolate overflow-hidden bg-ink py-16 text-white md:py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12" data-no-reveal>
          <div className="flex flex-col lg:col-span-5">
            <SectionHeading tone="dark" eyebrow={eyebrow} title={title} />
            <p data-reveal="up" className="mt-6 max-w-sm text-mist">
              Can’t find your answer?{" "}
              <Link
                href="/contact"
                className="font-semibold text-white underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand"
              >
                Talk to our team
              </Link>
              .
            </p>
            {showAllLink && (
              <div data-reveal="up" className="mt-8">
                <ButtonLink href="/faq" variant="glass" arrow>
                  See all FAQs
                </ButtonLink>
              </div>
            )}
            <div data-rotate="10" className="relative mt-12 hidden aspect-[2534/1134] w-full max-w-md lg:mt-auto lg:block">
              <Image src={waterRibbon.src} alt="" fill sizes="448px" className="object-contain opacity-90" />
            </div>
          </div>
          <Accordion
            tone="dark"
            className="lg:col-span-7"
            defaultOpen={0}
            items={faqs.map((faq) => ({ title: faq.q, content: faq.a }))}
          />
        </Container>
      </div>
    </section>
  );
}
