import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { MessageCircle } from "lucide-react";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { faqTopics, faqs } from "@/content/faqs";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQs",
  description:
    "Answers to common questions about LUSAKO: UF vs RO, city and well water, buying or renting, rental charges, the Regional Hydration Service, installation, service and warranty.",
  path: "/faq",
});

const groups = faqTopics
  .map((topic) => ({ ...topic, items: faqs.filter((faq) => faq.topic === topic.id) }))
  .filter((group) => group.items.length > 0);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHero
        crumbs={[{ label: "FAQs", href: "/faq" }]}
        eyebrow="FAQs"
        title={
          <>
            Questions, <Highlight>answered</Highlight>
          </>
        }
        description="UF or RO, buying or renting, installation and service: straight answers to the questions we hear most."
      >
        <Container className="mt-10">
          <nav aria-label="FAQ topics" className="rise" style={{ "--d": "280ms" } as CSSProperties}>
            <ul className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full border border-line bg-white pr-2 pl-5 text-sm font-semibold text-ink transition-colors hover:border-deep hover:text-deep"
                  >
                    {group.label}
                    <span aria-hidden className="grid h-8 min-w-8 place-items-center rounded-full bg-deep px-2 text-xs text-white">
                      {group.items.length}
                    </span>
                    <span className="sr-only">, {group.items.length} questions</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </PageHero>

      {groups.map((group, i) => (
        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`} className="py-12 lg:py-16">
          <Container>
            <div data-no-reveal className={cn("grid gap-8 lg:grid-cols-12 lg:gap-12", i > 0 && "border-t border-line pt-12 lg:pt-16")}>
              <div data-reveal="up" className="lg:col-span-4">
                <p aria-hidden className="font-sans text-[3.75rem] leading-none font-extralight tracking-[-0.04em] text-brand">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 id={`${group.id}-heading`} className="mt-4 font-display text-h3 font-bold text-ink">
                  {group.label}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {group.items.length} {group.items.length === 1 ? "question" : "questions"}
                </p>
              </div>
              <Accordion
                className="lg:col-span-8"
                defaultOpen={i === 0 ? 0 : null}
                items={group.items.map((faq) => ({ title: faq.q, content: faq.a }))}
              />
            </div>
          </Container>
        </section>
      ))}

      <section className="pt-12 lg:pt-16">
        <Container>
          <div data-reveal="up" className="card-line flex flex-col gap-6 rounded-card-xl p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-h3 font-bold text-ink">Still have a question?</h2>
              <p className="mt-2 text-muted">Our team is happy to help. {site.contact.hours}.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/contact" variant="primary" arrow>
                Ask our team
              </ButtonLink>
              <a
                href={site.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "outline" })}
              >
                <MessageCircle aria-hidden className="size-4" />
                WhatsApp us
                <span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
