import type { Metadata } from "next";
import {
  Building2,
  Check,
  ClipboardList,
  Clock,
  Droplets,
  Factory,
  Gauge,
  Hospital,
  Hotel,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  ReceiptText,
  School,
  Store,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroStrip, PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rule, WaveLines } from "@/components/ui/decor";
import { IconBadge } from "@/components/ui/icon-badge";
import { marked } from "@/components/ui/marked";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectors } from "@/content/clients";
import {
  corporateCapabilities,
  corporateCta,
  corporateFaq,
  corporateHero,
  corporateProposal,
  corporateScale,
  corporateSectors,
  corporateSeo,
  corporateStatement,
  corporateSteps,
  corporateStrip,
} from "@/content/copy/corporate";
import { getCopy, getFaqs, getPhotos, getSiteSettings } from "@/lib/cms/content";
import { telHref } from "@/lib/contact";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";
import { organizationRef, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(corporateSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/hydration-solutions/corporate" });
}

/** Map pins on the two scale cards, by position: one location, then many (their wording is corporate.scale). */
const scalePins = [1, 3];

/** The eight capabilities' icons, by position (brief Doc 2 §12; their wording is corporate.capabilities). */
const capabilityIcons: LucideIcon[] = [MapPinned, Users, Droplets, Gauge, ClipboardList, Wrench, UserCog, ReceiptText];

const sectorIcons: Record<string, LucideIcon> = {
  "Corporate offices": Building2,
  Factories: Factory,
  Hotels: Hotel,
  Schools: School,
  Hospitals: Hospital,
  "Commercial organisations": Store,
};

export default async function CorporateHydrationPage() {
  const [photos, settings, faqs, hero, strip, scaleCopy, statement, capabilitiesCopy, stepsCopy, sectorsCopy, proposal, faqCopy, cta] =
    await Promise.all([
      getPhotos(),
      getSiteSettings(),
      getFaqs(),
      getCopy(corporateHero),
      getCopy(corporateStrip),
      getCopy(corporateScale),
      getCopy(corporateStatement),
      getCopy(corporateCapabilities),
      getCopy(corporateSteps),
      getCopy(corporateSectors),
      getCopy(corporateProposal),
      getCopy(corporateFaq),
      getCopy(corporateCta),
    ]);
  const phone = settings.contact.phones[0];
  const corporateFaqs = faqs.filter((faq) => faq.corporate);
  const scale = scaleCopy.cards.map((card, i) => ({
    title: card.title,
    body: card.body,
    points: [card.point1, card.point2, card.point3],
    pins: scalePins[i] ?? 1,
  }));
  const capabilities = capabilitiesCopy.cards.map((card, i) => ({ icon: capabilityIcons[i] ?? Building2, title: card.title, body: card.body }));
  const steps = stepsCopy.steps;
  const contact = [
    ...settings.contact.phones.map((number) => ({ icon: Phone, label: number, href: telHref(number) as string | undefined })),
    ...(settings.contact.salesEmail ? [{ icon: Mail, label: settings.contact.salesEmail, href: `mailto:${settings.contact.salesEmail}` }] : []),
    ...(settings.contact.hours ? [{ icon: Clock, label: settings.contact.hours, href: undefined }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Corporate Hydration Solutions",
          serviceType: "Workplace drinking-water management",
          description:
            "Drinking-water infrastructure for offices, factories, hotels, schools, hospitals and commercial organisations, from consultation and installation to preventive maintenance and account management.",
          url: new URL("/hydration-solutions/corporate", site.url).toString(),
          provider: organizationRef,
          areaServed: { "@type": "Country", name: "Sri Lanka" },
          audience: { "@type": "BusinessAudience", audienceType: sectors.join(", ") },
        }}
      />

      <PageHero
        crumbs={[
          { label: "Hydration solutions", href: "/hydration-solutions" },
          { label: "Corporate", href: "/hydration-solutions/corporate" },
        ]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.quoteButton, href: "#proposal" },
          ...(phone ? [{ label: hero.callButton, href: telHref(phone), icon: Phone }] : []),
        ]}
        image={{ src: photos.corporateTeam.src, position: "object-[50%_40%]" }}
      />
      <HeroStrip title={strip.title} description={strip.description} pills={strip.pills} />

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={scaleCopy.eyebrow}
            title={marked(scaleCopy.title)}
            description={scaleCopy.description}
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14 lg:gap-5">
            {scale.map((item, i) => (
              <article
                key={i}
                className={cn(
                  "relative flex min-h-[23rem] flex-col overflow-hidden p-6 sm:p-8",
                  i === 0 ? "card-line" : "rounded-card bg-tint-2",
                )}
              >
                {i > 0 && <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand/40" />}
                <div className="relative flex -space-x-3">
                  {Array.from({ length: item.pins }, (_, pin) => (
                    <IconBadge key={pin} variant="white" framed className={cn(item.pins > 1 && "ring-4 ring-tint-2")}>
                      <MapPin />
                    </IconBadge>
                  ))}
                </div>
                <div className="relative mt-auto pt-16">
                  <h3 className="font-display text-h3 font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] text-muted">{item.body}</p>
                  <ul className="mt-6 grid gap-2.5">
                    {item.points.map((point, p) => (
                      <li key={p} className="flex gap-3 text-[15px] text-ink">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-deep" strokeWidth={2.5} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div data-expand className="relative isolate mt-4 overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10 lg:mt-5 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <p className="max-w-3xl font-display text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] leading-[1.12] font-semibold tracking-[-0.025em]">
                <span className="block text-mist">{statement.question}</span> {statement.statement}
              </p>
              <ButtonLink href="#proposal" variant="white" size="lg" arrow className="w-full sm:w-auto">
                {statement.button}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={capabilitiesCopy.eyebrow}
            title={marked(capabilitiesCopy.title)}
            description={capabilitiesCopy.description}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, body }, i) => (
              <li key={i} className="card-line flex flex-col p-6 sm:min-h-60">
                <span className="grid size-16 place-items-center rounded-card-sm bg-tint">
                  <IconBadge size="sm">
                    <Icon />
                  </IconBadge>
                </span>
                <h3 className="mt-auto pt-6 font-display text-lg leading-snug font-bold text-ink sm:pt-10">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={stepsCopy.eyebrow} title={marked(stepsCopy.title)} />
          <Rule className="mt-12 lg:mt-14" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li
                key={i}
                className={cn(
                  "flex gap-5 py-7 sm:min-h-64 sm:flex-col sm:gap-0 sm:px-6 sm:py-8 lg:px-5 lg:py-10 lg:first:pl-0 lg:last:pr-0",
                  i > 0 && "border-t border-line sm:border-t-0 lg:border-l",
                )}
              >
                <span
                  aria-hidden
                  className="w-16 shrink-0 font-sans text-[3rem] leading-none font-extralight tracking-[-0.04em] text-brand sm:w-auto sm:text-[3.75rem]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="sm:mt-auto sm:pt-10">
                  <h3 className="font-display text-lg leading-snug font-bold text-ink lg:text-base xl:text-lg">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Rule />
        </Container>
      </section>

      <section aria-labelledby="sectors-title" className="py-16 md:py-20 lg:py-28">
        <Container>
          <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-tint-2 px-6 py-14 text-center sm:px-10 lg:py-20">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-brand/35" />
            <h2 id="sectors-title" className="relative mx-auto max-w-2xl text-h2 font-semibold text-ink">
              {sectorsCopy.title}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lead text-muted">{sectorsCopy.description}</p>
            <ul className="relative mt-9 flex flex-wrap justify-center gap-2">
              {sectors.map((sector) => {
                const Icon = sectorIcons[sector] ?? Building2;
                return (
                  <li key={sector} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-ink shadow-soft">
                    <Icon aria-hidden className="size-4 text-deep" strokeWidth={1.75} />
                    {sector}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      <section id="proposal" className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12" data-no-reveal>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <SectionHeading eyebrow={proposal.eyebrow} title={marked(proposal.title)} description={proposal.description} />
              <p data-reveal="up" className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">{proposal.note}</p>
              <div data-reveal="up" className="card-line mt-10 p-6">
                <h3 className="font-display text-lg font-bold text-ink">{proposal.talkTitle}</h3>
                <ul className="mt-3 grid gap-1 text-[15px]">
                  {contact.map(({ icon: Icon, label, href }) => (
                    <li key={label}>
                      {href ? (
                        <a href={href} className="inline-flex min-h-11 items-center gap-3 text-ink transition-colors hover:text-deep">
                          <Icon aria-hidden className="size-4 shrink-0 text-deep" />
                          {label}
                        </a>
                      ) : (
                        <span className="inline-flex min-h-11 items-center gap-3 text-muted">
                          <Icon aria-hidden className="size-4 shrink-0 text-deep" />
                          {label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div data-reveal="up" className="card-line rounded-card-xl p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <h3 className="font-display text-h3 font-bold text-ink">{proposal.formTitle}</h3>
            <p className="mt-2 mb-8 text-[15px] text-muted">{proposal.formIntro}</p>
            <LeadForm type="corporate" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={corporateFaqs} title={faqCopy.title} />
      <CtaBand copy={cta} href="#proposal" />
    </>
  );
}
