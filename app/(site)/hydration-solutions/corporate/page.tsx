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
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectors } from "@/content/clients";
import { faqs } from "@/content/faqs";
import { leadForms } from "@/content/forms";
import { getPhotos, getSiteSettings } from "@/lib/cms/content";
import { telHref } from "@/lib/contact";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";
import { organizationRef, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Hydration Solutions",
  description:
    "One partner for workplace hydration: consultation, UF or RO recommendation, installation, preventive maintenance and account management, for one site or many.",
  path: "/hydration-solutions/corporate",
});

const scale = [
  {
    title: "One location",
    body: "A complete hydration setup for a single office, factory, hotel or school.",
    points: ["Consultation based on your number of users", "UF or RO, matched to your water source", "Maintenance and support according to contract"],
    pins: 1,
  },
  {
    title: "Multiple locations",
    body: "Consistent hydration across every branch and site, planned as one programme.",
    points: [
      "Machines selected site by site, by expected consumption",
      "Installation and service planning across locations",
      "Centralised account management",
    ],
    pins: 3,
  },
];

/** The eight Corporate Hydration Solutions capabilities (brief Doc 2 §12). */
const capabilities: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: MapPinned, title: "Single-office and multi-location solutions", body: "One site or many, planned and supported as a whole." },
  { icon: Users, title: "Employee and user-based consultation", body: "We size your solution around the people who use it." },
  { icon: Droplets, title: "UF or RO, matched to your water", body: "Recommended by water source and site conditions." },
  { icon: Gauge, title: "Machines matched to demand", body: "Selected for expected consumption and the environment." },
  { icon: ClipboardList, title: "Installation and service planning", body: "A clear plan for installation and ongoing service at every site." },
  { icon: Wrench, title: "Preventive maintenance and technical support", body: "Delivered according to your contract." },
  { icon: UserCog, title: "Centralised account management", body: "One point of contact for your corporate account." },
  { icon: ReceiptText, title: "Custom quotation", body: "A tailored quote for organisations that need multiple units." },
];

const steps = [
  { title: "Consultation", body: "We learn about your sites, your teams and the number of users at each location." },
  { title: "UF or RO recommendation", body: "Based on each site’s water source and conditions." },
  { title: "Machine selection", body: "Matched to expected consumption and the environment." },
  { title: "Installation & service planning", body: "Professional installation, with a service plan for every site." },
  {
    title: "Preventive maintenance & account management",
    body: "Maintenance and technical support according to contract, with centralised account management.",
  },
];

const sectorIcons: Record<string, LucideIcon> = {
  "Corporate offices": Building2,
  Factories: Factory,
  Hotels: Hotel,
  Schools: School,
  Hospitals: Hospital,
  "Commercial organisations": Store,
};

export default async function CorporateHydrationPage() {
  const [photos, settings] = await Promise.all([getPhotos(), getSiteSettings()]);
  const phone = settings.contact.phones[0];
  const corporateFaqs = faqs.filter((faq) => /companies|locations/i.test(faq.q));
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
        eyebrow="Corporate Hydration Solutions"
        title={["One partner for your", <Highlight key="workplace">workplace hydration</Highlight>]}
        description="One solution for your entire workplace. For offices, factories, hotels, schools, hospitals and commercial organisations."
        actions={[
          { label: "Request a business quote", href: "#proposal" },
          ...(phone ? [{ label: "Call our team", href: telHref(phone), icon: Phone }] : []),
        ]}
        image={{ src: photos.corporateTeam.src, position: "object-[50%_40%]" }}
      />
      <HeroStrip
        title="Your hydration infrastructure, managed"
        description="From consultation and installation to maintenance and account management."
        pills={["Single office", "Multi-location"]}
      />

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Single-office and multi-location"
            title={
              <>
                One location or <Highlight>many</Highlight>
              </>
            }
            description="Whether you run one office or many branches, LUSAKO plans and looks after the drinking water at every site."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14 lg:gap-5">
            {scale.map((item, i) => (
              <article
                key={item.title}
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
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[15px] text-ink">
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
                <span className="block text-mist">Need 15 machines across 5 branches?</span> LUSAKO can manage your complete hydration
                infrastructure.
              </p>
              <ButtonLink href="#proposal" variant="white" size="lg" arrow className="w-full sm:w-auto">
                Request a business quote
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="What we manage"
            title={
              <>
                Everything your workplace needs, <Highlight>from one partner</Highlight>
              </>
            }
            description="More than equipment: LUSAKO plans, installs and looks after drinking water for your whole organisation."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <li key={title} className="card-line flex flex-col p-6 sm:min-h-60">
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
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                From consultation to <Highlight>ongoing care</Highlight>
              </>
            }
          />
          <Rule className="mt-12 lg:mt-14" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li
                key={step.title}
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
              Built for every kind of workplace
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lead text-muted">From a single office to organisations with many sites.</p>
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
              <SectionHeading
                eyebrow="Business quote"
                title={
                  <>
                    Request a <Highlight>business quote</Highlight>
                  </>
                }
                description={leadForms.corporate.description}
              />
              <p data-reveal="up" className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">{leadForms.corporate.successNote}</p>
              <div data-reveal="up" className="card-line mt-10 p-6">
                <h3 className="font-display text-lg font-bold text-ink">Prefer to talk?</h3>
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
            <h3 className="font-display text-h3 font-bold text-ink">Tell us about your organisation</h3>
            <p className="mt-2 mb-8 text-[15px] text-muted">Your sites, your teams and what you need. We’ll plan the rest with you.</p>
            <LeadForm type="corporate" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={corporateFaqs} title="Corporate questions, answered" />
      <CtaBand
        eyebrow="Corporate Hydration Solutions"
        title={
          <>
            Let’s plan your
            <br className="hidden sm:block" /> workplace hydration
          </>
        }
        description="Tell us about your sites and your teams. A LUSAKO business consultant will prepare a proposal for your organisation."
        href="#proposal"
        buttonLabel="Get a proposal"
      />
    </>
  );
}
