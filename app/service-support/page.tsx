import type { Metadata } from "next";
import { Check, Headset, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { CtaBand } from "@/components/sections/cta-band";
import { ChannelRow, contactChannels } from "@/components/sections/contact-channels";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroMedia, PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
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
            className={cn("mt-px grid size-5 shrink-0 place-items-center rounded-full", dark ? "bg-white text-deep" : "bg-deep text-white")}
          >
            <Check className="size-3" strokeWidth={2.5} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

const cardTitle = "font-display text-[clamp(1.75rem,1.4rem+1.3vw,2.5rem)] leading-tight font-bold tracking-[-0.025em]";

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
            <ButtonLink href="#request" variant="primary" size="lg" arrow>
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
        <HeroMedia image={photos.careTechnician} priority>
          <span className="absolute top-4 left-4 flex flex-wrap gap-1.5 sm:top-5 sm:left-5">
            <Pill variant="white">Installation</Pill>
            <Pill variant="white">Maintenance</Pill>
            <Pill variant="white">Support</Pill>
          </span>
          <div className="absolute right-4 bottom-4 left-4 rounded-card-sm bg-white p-5 shadow-float sm:right-auto sm:bottom-6 sm:left-6 sm:max-w-md sm:p-7 sm:pr-9">
            <p className="font-display text-h3 font-bold text-ink">Care that comes with every system</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">Trained LUSAKO technicians, scheduled visits and genuine spare parts.</p>
          </div>
          <a href="#request" aria-label="Request a service" className="group/card absolute right-6 bottom-6 hidden sm:block">
            <ArrowCircle variant="deep" className="size-14 shadow-float" />
          </a>
        </HeroMedia>
      </PageHero>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="What LUSAKO Care covers"
            title={
              <>
                Everything your system needs, <Highlight className="inline-block">from one team</Highlight>
              </>
            }
            description="From installation day to every scheduled visit after it, LUSAKO looks after your drinking water."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
            {services.map(({ id, title, body, icon: Icon }) => (
              <li key={id} className="card-line flex flex-col gap-8 p-6 sm:p-7">
                <span className="grid size-16 place-items-center rounded-card-sm bg-tint">
                  <IconBadge size="sm">
                    <Icon />
                  </IconBadge>
                </span>
                <div className="mt-auto">
                  <h3 className="font-display text-xl leading-snug font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <article className="relative flex min-h-[30rem] flex-col overflow-hidden rounded-card-xl bg-tint-2 p-7 text-ink sm:p-10">
            <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand/35" />
            <Pill variant="white" className="relative">
              <ShieldCheck aria-hidden className="text-deep" />
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
              <ButtonLink href="#request" variant="primary" arrow className="mt-8 w-full sm:w-auto">
                Ask about an AMC
              </ButtonLink>
            </div>
          </article>

          <article className="relative flex min-h-[30rem] flex-col overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10">
            <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />
            <Pill variant="glass" className="relative">
              <Headset aria-hidden />
              Rental customers
            </Pill>
            <div className="relative mt-auto pt-16">
              <h2 className={cardTitle}>Renting? We look after it</h2>
              <p className="mt-3 max-w-md text-white">
                Rental systems are maintained by LUSAKO throughout the rental period, according to your agreement. If something needs
                attention, tell us and we’ll take care of it.
              </p>
              <div className="mt-6">
                <Checklist items={rentalIncludes} dark />
              </div>
              <p className="mt-6 text-sm text-white/85">Exact inclusions are confirmed in your rental agreement.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

      <section id="request" className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12" data-no-reveal>
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
            <ul data-stagger className="mt-10 grid gap-1">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <ChannelRow channel={channel} />
                </li>
              ))}
            </ul>
            <p data-reveal="up" className="mt-8 rounded-card-sm border border-line bg-tint p-5 text-sm leading-relaxed text-muted">
              <strong className="font-semibold text-deep">Tip:</strong> have your model and serial or asset number handy if you can. It
              helps our technicians prepare for the visit.
            </p>
          </div>
          <div data-reveal="up" className="card-line rounded-card-xl p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <LeadForm type="service" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={faqs.filter((faq) => faq.topic === "service")} title="Service questions, answered" />
      <CtaBand />
    </>
  );
}
