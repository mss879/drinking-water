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
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { chromeContactLabels } from "@/content/copy/chrome";
import {
  serviceAmc,
  serviceFaq,
  serviceHero,
  serviceParts,
  serviceRental,
  serviceRequest,
  serviceSeo,
  serviceServices,
  serviceStrip,
} from "@/content/copy/service";
import { getAmc, getCopy, getFaqs, getPhotos, getServices, getSiteSettings } from "@/lib/cms/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(serviceSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/service-support" });
}

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
  const [photos, { contact }, amc, services, faqs, hero, strip, servicesHeading, amcCopy, partsCard, rental, request, faqHeading, contactLabels] =
    await Promise.all([
      getPhotos(),
      getSiteSettings(),
      getAmc(),
      getServices(),
      getFaqs(),
      getCopy(serviceHero),
      getCopy(serviceStrip),
      getCopy(serviceServices),
      getCopy(serviceAmc),
      getCopy(serviceParts),
      getCopy(serviceRental),
      getCopy(serviceRequest),
      getCopy(serviceFaq),
      getCopy(chromeContactLabels),
    ]);
  // Service visitors are usually reporting a problem: the breakdown lines come first, under the names the rest of the
  // site gives them (Page text › Header, footer & contact panels › Contact details: names).
  const channels = contactChannels(contact, ["hotline", "whatsapp-emergency", "operations-email", "phone"], contactLabels.labels);
  const phone = contact.phones[0];
  return (
    <>
      <PageHero
        crumbs={[{ label: "Service & support", href: "/service-support" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.requestButton, href: "#request" },
          { label: hero.whatsappButton, href: whatsappHref(contact.whatsappEmergency || contact.whatsappSales), icon: MessageCircle, external: true, srLabel: "(opens WhatsApp)" },
        ]}
        image={{ src: photos.careTechnician.src, position: "object-[50%_35%]" }}
      />
      <HeroStrip title={strip.title} description={strip.description} pills={strip.pills} />

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={servicesHeading.eyebrow}
            title={marked(servicesHeading.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
            description={servicesHeading.description}
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
            eyebrow={amcCopy.eyebrow}
            title={
              <span id="amc-title">{marked(amcCopy.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}</span>
            }
            description={amcCopy.description}
            action={
              <ButtonLink href="/service-support/amc#compare" variant="outline" arrow>
                {amcCopy.button}
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
              {partsCard.pill}
            </Pill>
            <div className="relative mt-auto pt-16">
              <h2 className={cardTitle}>{partsCard.title}</h2>
              <p className="mt-3 max-w-md text-muted">{partsCard.body}</p>
              <div className="mt-6">
                <Checklist items={partsCard.checklist} />
              </div>
              <ButtonLink href="/service-support/parts" variant="primary" arrow className="mt-8 w-full sm:w-auto">
                {partsCard.button}
              </ButtonLink>
            </div>
          </article>

          <article className="relative flex min-h-[30rem] flex-col overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10">
            <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />
            <Pill variant="glass" className="relative">
              <Headset aria-hidden />
              {rental.pill}
            </Pill>
            <div className="relative mt-auto pt-16">
              <h2 className={cardTitle}>{rental.title}</h2>
              <p className="mt-3 max-w-md text-white">{rental.body}</p>
              <div className="mt-6">
                <Checklist items={rental.checklist} dark />
              </div>
              <p className="mt-6 text-sm text-white/85">Exact inclusions are confirmed in your rental agreement.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href="#request" variant="white" arrow>
                  {rental.button}
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
            <SectionHeading eyebrow={request.eyebrow} title={marked(request.title)} description={request.description} />
            <ul data-stagger className="mt-10 grid gap-1">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <ChannelRow channel={channel} />
                </li>
              ))}
            </ul>
            <p data-reveal="up" className="mt-8 rounded-card-sm border border-line bg-tint p-5 text-sm leading-relaxed text-muted">
              {marked(request.tip, { mark: (word) => <strong className="font-semibold text-deep">{word}</strong> })}
            </p>
          </div>
          <div data-reveal="up" className="card-line rounded-card-xl p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <LeadForm type="service" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={faqs.filter((faq) => faq.topic === "service")} title={faqHeading.title} />
      <CtaBand />
    </>
  );
}
