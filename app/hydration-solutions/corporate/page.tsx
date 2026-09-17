import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
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
import { ArchCta } from "@/components/sections/arch-cta";
import { FaqSection } from "@/components/sections/faq-section";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PixelCluster, Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectors } from "@/content/clients";
import { faqs } from "@/content/faqs";
import { leadForms } from "@/content/forms";
import { photos } from "@/content/images";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Hydration Solutions",
  description:
    "One partner for your workplace hydration: consultation, UF or RO recommendation, installation, preventive maintenance and account management, for one site or many.",
  path: "/hydration-solutions/corporate",
});

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

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

export default function CorporateHydrationPage() {
  const corporateFaqs = faqs.filter((faq) => /companies|locations/i.test(faq.q));
  const contact = [
    { icon: Phone, label: site.contact.phoneDisplay, href: site.contact.phoneHref },
    { icon: Mail, label: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Clock, label: site.contact.hours },
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
          provider: { "@type": "Organization", name: site.name, url: site.url },
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
        title={
          <>
            One partner for your <Highlight>workplace hydration</Highlight>
          </>
        }
        description="One solution for your entire workplace. For offices, factories, hotels, schools, hospitals and commercial organisations."
        actions={
          <>
            <ButtonLink href="#proposal" variant="dark" size="lg" arrow>
              Request a business quote
            </ButtonLink>
            <a href={site.contact.phoneHref} className={buttonClasses({ variant: "outline", size: "lg" })}>
              <Phone aria-hidden className="size-4" />
              Call our team
            </a>
          </>
        }
      >
        <Container className="mt-12 lg:mt-16">
          <div
            className="rise relative aspect-[4/5] overflow-hidden rounded-card-xl bg-frost sm:aspect-[16/9] lg:aspect-[21/8]"
            style={delay(300)}
          >
            <Image
              src={photos.corporateTeam.src}
              alt={photos.corporateTeam.alt}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1320px) 1224px, 100vw"
              className="object-cover object-[50%_40%]"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 sm:top-6 sm:left-6">
              <Pill variant="glass">Single office</Pill>
              <Pill variant="glass">Multi-location</Pill>
            </div>
            <div className="corner-tab max-w-[86%] px-5 py-4 pr-6 [--tab-r:28px] sm:px-7 sm:py-5 sm:pr-8">
              <p className="text-lg leading-tight font-medium text-ink sm:text-h3">Your hydration infrastructure, managed</p>
              <p className="mt-1 text-sm text-muted">From consultation and installation to maintenance and account management.</p>
            </div>
          </div>
        </Container>
      </PageHero>

      <section className="py-14 lg:py-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Single-office and multi-location"
              title={
                <>
                  One location or <Highlight>many</Highlight>
                </>
              }
            />
            <p className="max-w-sm text-muted lg:pb-2">
              Whether you run one office or many branches, LUSAKO plans and looks after the drinking water at every site.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {scale.map((item, i) => (
              <article
                key={item.title}
                className={cn("relative flex min-h-[23rem] flex-col overflow-hidden rounded-card-xl p-6 sm:p-8", i === 0 ? "bg-frost" : "bg-pastel")}
              >
                {i > 0 && <Rings className="absolute -right-24 -bottom-24 size-[22rem] text-white" />}
                <div className="relative flex -space-x-3">
                  {Array.from({ length: item.pins }, (_, pin) => (
                    <IconBadge key={pin} variant="white" framed className={cn(item.pins > 1 && "ring-4 ring-pastel")}>
                      <MapPin />
                    </IconBadge>
                  ))}
                </div>
                <div className="relative mt-auto pt-16">
                  <h3 className="text-h3 font-medium text-ink">{item.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] text-muted">{item.body}</p>
                  <ul className="mt-6 grid gap-2.5">
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[15px] text-ink">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-brand" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="relative mt-4 overflow-hidden rounded-card-xl bg-ocean p-7 text-white sm:p-10 lg:p-14">
            <Rings className="absolute -top-32 -right-32 size-[28rem] text-aqua/25" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <p className="max-w-3xl text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] leading-[1.12] font-medium tracking-[-0.03em]">
                <span className="text-white/65">Need 15 machines across 5 branches?</span> LUSAKO can manage your complete hydration
                infrastructure.
              </p>
              <ButtonLink href="#proposal" variant="white" size="lg" arrow className="w-full sm:w-auto">
                Request a business quote
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="What we manage"
            title={
              <>
                Everything your workplace needs, <Highlight>from one partner</Highlight>
              </>
            }
            description="More than equipment: LUSAKO plans, installs and looks after drinking water for your whole organisation."
          />
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex min-h-56 flex-col rounded-card bg-frost p-6">
                <IconBadge variant="white">
                  <Icon />
                </IconBadge>
                <h3 className="mt-auto pt-10 text-lg leading-snug font-medium tracking-[-0.01em] text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                From consultation to <Highlight>ongoing care</Highlight>
              </>
            }
          />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li key={step.title} className={cn("flex min-h-64 flex-col rounded-card p-6", i === steps.length - 1 ? "bg-pastel" : "bg-frost")}>
                <span
                  aria-hidden
                  className="text-[3.25rem] leading-none font-medium tracking-[-0.04em] text-outline [--outline-c:var(--color-brand)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-auto pt-10 text-lg leading-snug font-medium tracking-[-0.01em] text-ink">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="sectors-title" className="py-14 lg:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-card-xl bg-pastel px-6 py-14 text-center sm:px-10 lg:py-20">
            <Rings className="absolute -bottom-40 -left-32 size-[26rem] text-white" />
            <PixelCluster variant="b" className="absolute top-8 right-8 size-10 sm:size-12" />
            <h2 id="sectors-title" className="relative mx-auto max-w-2xl text-h2 font-medium text-ink">
              Built for every kind of workplace
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lead text-muted">From a single office to organisations with many sites.</p>
            <ul className="relative mt-9 flex flex-wrap justify-center gap-2">
              {sectors.map((sector) => {
                const Icon = sectorIcons[sector] ?? Building2;
                return (
                  <li key={sector} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-ink">
                    <Icon aria-hidden className="size-4 text-brand" strokeWidth={1.75} />
                    {sector}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      <section id="proposal" className="py-14 lg:py-20">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Business quote"
                title={
                  <>
                    Request a <Highlight>business quote</Highlight>
                  </>
                }
                description={leadForms.corporate.description}
              />
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">{leadForms.corporate.successNote}</p>
              <div className="mt-10 rounded-card border border-line p-6">
                <h3 className="text-lg font-medium text-ink">Prefer to talk?</h3>
                <ul className="mt-3 grid gap-1 text-[15px]">
                  {contact.map(({ icon: Icon, label, href }) => (
                    <li key={label}>
                      {href ? (
                        <a href={href} className="inline-flex min-h-11 items-center gap-3 text-ink transition-colors hover:text-brand">
                          <Icon aria-hidden className="size-4 shrink-0 text-brand" />
                          {label}
                        </a>
                      ) : (
                        <span className="inline-flex min-h-11 items-center gap-3 text-muted">
                          <Icon aria-hidden className="size-4 shrink-0 text-brand" />
                          {label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-card-xl bg-frost p-5 sm:p-8 lg:col-span-7 lg:p-10">
            <h3 className="text-h3 font-medium text-ink">Tell us about your organisation</h3>
            <p className="mt-2 mb-8 text-[15px] text-muted">Your sites, your teams and what you need. We’ll plan the rest with you.</p>
            <LeadForm type="corporate" />
          </div>
        </Container>
      </section>

      <FaqSection faqs={corporateFaqs} title="Corporate questions, answered" />
      <ArchCta
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
        image={photos.officePantry}
      />
    </>
  );
}
