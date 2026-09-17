import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Droplets, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import { FindMySolution } from "@/components/forms/find-my-solution";
import { PageHero } from "@/components/sections/page-hero";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find My Solution",
  description:
    "Answer three quick questions about where you live, your water source and what you need. LUSAKO recommends UF or RO and the right water purification system.",
  path: "/find-my-solution",
});

const reasons = [
  {
    icon: MapPin,
    title: "Where you live",
    body: "Outside the Western Province, rentals include a Regional Hydration Service for regional support, always shown as its own line.",
  },
  {
    icon: Droplets,
    title: "Your water source",
    body: "Treated city water suits UF. Well water and water with higher dissolved solids (TDS) usually need RO.",
  },
  {
    icon: Users,
    title: "What you need",
    body: "Homes are best served by owning a system, offices by rental, and larger organisations by a corporate proposal.",
  },
];

export default function FindMySolutionPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Find my solution", href: "/find-my-solution" }]}
        eyebrow="Find my solution"
        title={
          <>
            The right system in <Highlight>three questions</Highlight>
          </>
        }
        description="Tell us where you live, your water source and what you need. We’ll recommend UF or RO and the right LUSAKO system."
      />

      <div className="pb-16 lg:pb-24">
        <Container>
          <FindMySolution />
        </Container>
      </div>

      <section className="pb-16 lg:pb-24">
        <Container>
          <div className="grid gap-10 border-t border-line pt-12 lg:grid-cols-12 lg:gap-12 lg:pt-16">
            <div className="lg:col-span-4">
              <Pill>Why we ask</Pill>
              <h2 className="mt-5 max-w-sm text-h3 font-medium text-ink">Three answers are all it takes to recommend the right system.</h2>
            </div>
            <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-8">
              {reasons.map(({ icon: Icon, title, body }) => (
                <li key={title}>
                  <IconBadge variant="pastel">
                    <Icon />
                  </IconBadge>
                  <h3 className="mt-5 text-lg font-medium text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
        <Container>
          <div className="relative flex flex-col gap-8 overflow-hidden rounded-card-xl bg-pastel p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <Rings className="absolute -right-20 -bottom-28 size-96 text-white" />
            <div className="relative max-w-xl">
              <h2 className="text-h3 font-medium text-ink">Prefer to talk it through?</h2>
              <p className="mt-3 text-muted">
                Our team can recommend a system by phone or on WhatsApp, or you can{" "}
                <Link href="/contact" className="font-medium text-ink underline decoration-sky underline-offset-4 transition-colors hover:decoration-brand">
                  send us an enquiry
                </Link>
                .
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <Clock aria-hidden className="size-4 shrink-0 text-brand" />
                {site.contact.hours}
              </p>
            </div>
            <div className="relative flex flex-col gap-3 sm:flex-row">
              <a href={site.contact.phoneHref} className={buttonClasses({ variant: "dark", size: "lg" })}>
                <Phone aria-hidden className="size-4" />
                {site.contact.phoneDisplay}
              </a>
              <a
                href={site.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "white", size: "lg" })}
              >
                <MessageCircle aria-hidden className="size-4" />
                WhatsApp us
                <span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
