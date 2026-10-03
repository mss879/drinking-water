import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Droplets, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import { FindMySolution } from "@/components/forms/find-my-solution";
import { PageHero } from "@/components/sections/page-hero";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { getPhotos, getProducts, getSiteSettings } from "@/lib/cms/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find My Solution: UF or RO Water Purifier",
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

export default async function FindMySolutionPage() {
  const [photos, { contact }, products] = await Promise.all([getPhotos(), getSiteSettings(), getProducts()]);
  return (
    <>
      <PageHero
        crumbs={[{ label: "Find my solution", href: "/find-my-solution" }]}
        eyebrow="Find my solution"
        title={["The right system in", <Highlight key="three">three questions</Highlight>]}
        description="Tell us where you live, your water source and what you need. We’ll recommend UF or RO and the right LUSAKO system."
        image={{ src: photos.waterTest.src, position: "object-[50%_40%]" }}
      />

      <div className="pt-10 pb-16 md:pt-14 lg:pt-16 lg:pb-24">
        <Container>
          <FindMySolution products={products.map(({ slug, name, tagline, image }) => ({ slug, name, tagline, image }))} />
        </Container>
      </div>

      <section className="pb-16 lg:pb-24">
        <Container>
          <div data-no-reveal className="grid gap-10 border-t border-line pt-12 lg:grid-cols-12 lg:gap-12 lg:pt-16">
            <div data-reveal="up" className="lg:col-span-4">
              <span className="label">Why we ask</span>
              <h2 className="mt-5 max-w-sm font-display text-h3 font-bold text-ink">Three answers are all it takes to recommend the right system.</h2>
            </div>
            <ul data-stagger className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
              {reasons.map(({ icon: Icon, title, body }) => (
                <li key={title} className="card-line p-6">
                  <span className="grid size-14 place-items-center rounded-card-sm bg-tint">
                    <IconBadge size="sm">
                      <Icon />
                    </IconBadge>
                  </span>
                  <h3 className="mt-6 font-display text-lg font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
        <Container>
          <div data-expand className="relative isolate flex flex-col gap-8 overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-h3 font-bold">Prefer to talk it through?</h2>
              <p className="mt-3 text-white">
                Our team can recommend a system by phone or on WhatsApp, or you can{" "}
                <Link href="/contact" className="font-semibold text-white underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-mist">
                  send us an enquiry
                </Link>
                .
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm text-white">
                <Clock aria-hidden className="size-4 shrink-0 text-mist" />
                {contact.hours}
              </p>
            </div>
            <div className="relative flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={telHref(contact.phones[0] ?? contact.hotline)} className={buttonClasses({ variant: "white", size: "lg" })}>
                <Phone aria-hidden className="size-4" />
                {contact.phones[0] ?? contact.hotline}
              </a>
              <a
                href={whatsappHref(contact.whatsappSales)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "glass", size: "lg" })}
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
