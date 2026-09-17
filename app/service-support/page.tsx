import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Check, Headset, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { ArchCta } from "@/components/sections/arch-cta";
import { ChannelRow, contactChannels } from "@/components/sections/contact-channels";
import { FaqSection } from "@/components/sections/faq-section";
import { PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/faqs";
import { photos } from "@/content/images";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Service & Support",
  description:
    "LUSAKO Care: professional installation, preventive maintenance, filter replacement, technical service, AMC and rental customer support. Request a service visit online.",
  path: "/service-support",
});

const amcIncludes = ["Scheduled preventive maintenance", "Filter replacement on schedule", "Technical support from LUSAKO technicians"];

const rentalIncludes = [
  "Professional installation",
  "Scheduled preventive maintenance",
  "Filter replacement, according to your agreement",
  "Technical support throughout the rental period",
];

const channels = contactChannels({ whatsapp: "Message our service team", address: "Service centre" });

function Checklist({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-snug">
          <span
            aria-hidden
            className={cn("mt-px grid size-5 shrink-0 place-items-center rounded-full", dark ? "bg-white/15 text-aqua" : "bg-white text-brand")}
          >
            <Check className="size-3" strokeWidth={2.5} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

const cardTitle = "text-[clamp(1.75rem,1.4rem+1.3vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]";

export default function ServiceSupportPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Service & support", href: "/service-support" }]}
        eyebrow="LUSAKO Care"
        title={
          <>
            Keep your system <Highlight>performing at its best</Highlight>
          </>
        }
        description="Professional installation, preventive maintenance, filter replacement and technical support from one LUSAKO team, for systems you own and systems you rent."
        actions={
          <>
            <ButtonLink href="#request" variant="dark" size="lg" arrow>
              Request a service
            </ButtonLink>
            <a
              href={site.contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              <MessageCircle aria-hidden className="size-4" />
              WhatsApp us
              <span className="sr-only"> (opens WhatsApp)</span>
            </a>
          </>
        }
      >
        <Container className="mt-12 lg:mt-16">
          <div
            className="rise relative aspect-[4/5] overflow-hidden rounded-card-xl sm:aspect-[16/9] lg:aspect-[2.2/1]"
            style={{ "--d": "300ms" } as CSSProperties}
          >
            <Image
              src={photos.careTechnician.src}
              alt={photos.careTechnician.alt}
              fill
              sizes="(min-width: 1320px) 1224px, 100vw"
              className="object-cover"
            />
            <span className="absolute top-4 left-4 flex flex-wrap gap-1.5 sm:top-5 sm:left-5">
              <Pill variant="glass">Installation</Pill>
              <Pill variant="glass">Maintenance</Pill>
              <Pill variant="glass">Support</Pill>
            </span>
            <div className="corner-tab max-w-[76%] p-5 pr-7 [--tab-r:28px] sm:max-w-md sm:p-7 sm:pr-9">
              <p className="text-h3 font-medium text-ink">Care that comes with every system</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">Trained LUSAKO technicians, scheduled visits and genuine spare parts.</p>
            </div>
            <a href="#request" aria-label="Request a service" className="group/card corner-action p-2.5 [--tab-r:28px]">
              <ArrowCircle variant="ink" />
            </a>
          </div>
        </Container>
      </PageHero>

      <section className="py-14 lg:py-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="What LUSAKO Care covers"
              title={
                <>
                  Everything your system needs, <Highlight>from one team</Highlight>
                </>
              }
            />
            <p className="max-w-sm text-muted lg:pb-2">
              From installation day to every scheduled visit after it, LUSAKO looks after your drinking water.
            </p>
          </div>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ id, title, body, icon: Icon }) => (
              <li key={id} className="flex flex-col gap-8 rounded-card bg-frost p-6 sm:p-7">
                <IconBadge variant="white">
                  <Icon />
                </IconBadge>
                <div className="mt-auto">
                  <h3 className="text-xl leading-snug font-medium tracking-[-0.015em] text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
        <Container className="grid gap-4 lg:grid-cols-2">
          <article className="relative flex min-h-[30rem] flex-col overflow-hidden rounded-card-xl bg-pastel p-7 text-ink sm:p-10">
            <Rings className="absolute -right-24 -bottom-24 size-[26rem] text-white" />
            <Pill variant="white" className="relative">
              <ShieldCheck aria-hidden className="text-brand" />
              Purchased systems
            </Pill>
            <div className="relative mt-auto pt-16">
              <h2 className={cardTitle}>Annual Maintenance Contract</h2>
              <p className="mt-3 max-w-md text-muted">
                Own a LUSAKO system? An AMC plans the year’s care in advance, so your purifier keeps performing without you having to
                remember.
              </p>
              <div className="mt-6">
                <Checklist items={amcIncludes} />
              </div>
              <p className="mt-6 text-sm text-muted">Exact AMC inclusions are confirmed in your contract.</p>
              <ButtonLink href="#request" variant="dark" arrow className="mt-8 w-full sm:w-auto">
                Ask about an AMC
              </ButtonLink>
            </div>
          </article>

          <article className="relative flex min-h-[30rem] flex-col overflow-hidden rounded-card-xl bg-ocean p-7 text-white sm:p-10">
            <Rings className="absolute -right-24 -bottom-24 size-[26rem] text-aqua/25" />
            <Pill variant="glass" className="relative">
              <Headset aria-hidden />
              Rental customers
            </Pill>
            <div className="relative mt-auto pt-16">
              <h2 className={cardTitle}>Renting? We look after it</h2>
              <p className="mt-3 max-w-md text-white/80">
                Rental systems are maintained by LUSAKO throughout the rental period, according to your agreement. If something needs
                attention, tell us and we’ll take care of it.
              </p>
              <div className="mt-6">
                <Checklist items={rentalIncludes} dark />
              </div>
              <p className="mt-6 text-sm text-white/70">Exact inclusions are confirmed in your rental agreement.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="#request" variant="white" arrow>
                  Request a service
                </ButtonLink>
                <a href={site.contact.phoneHref} className={buttonClasses({ variant: "glass" })}>
                  <Phone aria-hidden className="size-4" />
                  {site.contact.phoneDisplay}
                </a>
              </div>
            </div>
          </article>
        </Container>
      </section>

      <section id="request" className="py-14 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Request a service"
              title={
                <>
                  Tell us what’s <Highlight>happening</Highlight>
                </>
              }
              description="Existing LUSAKO customers can raise a request here. Our service team will contact you to confirm a visit time."
            />
            <ul className="mt-10 grid gap-1">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <ChannelRow channel={channel} />
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-card-sm bg-ice p-5 text-sm leading-relaxed text-muted">
              <strong className="font-medium text-ink">Tip:</strong> have your model and serial or asset number handy if you can. It
              helps our technicians prepare for the visit.
            </p>
          </div>
          <div className="rounded-card-xl bg-frost p-5 sm:p-8 lg:col-span-7 lg:p-10">
            <LeadForm type="service" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={faqs.filter((faq) => faq.topic === "service")} title="Service questions, answered" />
      <ArchCta />
    </>
  );
}
