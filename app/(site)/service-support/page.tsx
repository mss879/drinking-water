import type { Metadata } from "next";
import Link from "next/link";
import { Check, Headset, MessageCircle, Package, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { AmcPlans } from "@/components/sections/amc-plans";
import { CtaBand } from "@/components/sections/cta-band";
import { ChannelRow, contactChannels } from "@/components/sections/contact-channels";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroStrip, PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/faqs";
import { getAmc, getPhotos, getSiteSettings } from "@/lib/cms/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { services } from "@/content/services";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Service & Support",
  description:
    "LUSAKO Care: installation, preventive maintenance, filter replacement, repairs, AMC plans and rental support for your purifier. Request a service online.",
  path: "/service-support",
});

const rentalIncludes = [
  "Professional installation",
  "Scheduled preventive maintenance",
  "Filter replacement, according to your agreement",
  "Technical support throughout the rental period",
];


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

export default async function ServiceSupportPage() {
  const [photos, { contact }, amc] = await Promise.all([getPhotos(), getSiteSettings(), getAmc()]);
  // Service visitors are usually reporting a problem: the breakdown lines come first.
  const channels = contactChannels(contact, ["hotline", "whatsapp-emergency", "operations-email", "phone"]);
  const phone = contact.phones[0];
  return (
    <>
      <PageHero
        crumbs={[{ label: "Service & support", href: "/service-support" }]}
        eyebrow="LUSAKO Care"
        title={["Keep your system", <Highlight key="best">performing at its best</Highlight>]}
        description="Professional installation, preventive maintenance, filter replacement and technical support from one LUSAKO team, for systems you own and systems you rent."
        actions={[
          { label: "Request a service", href: "#request" },
          { label: "WhatsApp us", href: whatsappHref(contact.whatsappEmergency || contact.whatsappSales), icon: MessageCircle, external: true, srLabel: "(opens WhatsApp)" },
        ]}
        image={{ src: photos.careTechnician.src, position: "object-[50%_35%]" }}
      />
      <HeroStrip
        title="Care that comes with every system"
        description="Trained LUSAKO technicians, scheduled visits and genuine spare parts."
        pills={["Installation", "Maintenance", "Support"]}
      />

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
            {services.map(({ id, title, body, icon: Icon, href }) => {
              const content = (
                <>
                  <span className="flex items-start justify-between gap-4">
                    <span className="grid size-16 place-items-center rounded-card-sm bg-tint">
                      <IconBadge size="sm">
                        <Icon />
                      </IconBadge>
                    </span>
                    {href && <ArrowCircle variant="deep" />}
                  </span>
                  <span className="mt-auto block">
                    <span className="block font-display text-xl leading-snug font-bold text-ink">{title}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted">{body}</span>
                  </span>
                </>
              );
              return (
                <li key={id}>
                  {href ? (
                    <Link
                      href={href}
                      className="group/card card-line flex h-full flex-col gap-8 p-6 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-7"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="card-line flex h-full flex-col gap-8 p-6 sm:p-7">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section id="amc" aria-labelledby="amc-title" className="scroll-mt-24 pb-16 md:pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="AMC & service plans"
            title={
              <span id="amc-title">
                Annual care for <Highlight className="inline-block">a purchased system</Highlight>
              </span>
            }
            description="Planned visits, tank sanitation and breakdown support, with discounts on filters and spare parts. Prefer to pay per visit? On-call service is always available."
            action={
              <ButtonLink href="/service-support/amc#compare" variant="outline" arrow>
                Compare the plans
              </ButtonLink>
            }
          />
          <AmcPlans plans={amc.plans} compact className="mt-12 lg:mt-14" />
        </Container>
      </section>

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <article className="relative flex min-h-[30rem] flex-col overflow-hidden rounded-card-xl bg-tint-2 p-7 text-ink sm:p-10">
            <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand/35" />
            <Pill variant="white" className="relative">
              <Package aria-hidden className="text-deep" />
              Genuine parts
            </Pill>
            <div className="relative mt-auto pt-16">
              <h2 className={cardTitle}>Filters, parts &amp; accessories</h2>
              <p className="mt-3 max-w-md text-muted">
                Genuine filter cartridges, spare parts and accessories for your LUSAKO purifier, fitted by our technicians if you need us.
              </p>
              <div className="mt-6">
                <Checklist items={["Water filter cartridges", "Water purifier spare parts", "Water purifier accessories"]} />
              </div>
              <ButtonLink href="/service-support/parts" variant="primary" arrow className="mt-8 w-full sm:w-auto">
                Browse parts
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
                {phone && (
                  <a href={telHref(phone)} className={buttonClasses({ variant: "glass" })}>
                    <Phone aria-hidden className="size-4" />
                    {phone}
                  </a>
                )}
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
                <li key={channel.id}>
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
