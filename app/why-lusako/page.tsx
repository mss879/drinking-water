import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  FlaskConical,
  Headset,
  MapPin,
  MessagesSquare,
  Receipt,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ArchCta } from "@/components/sections/arch-cta";
import { PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { photos } from "@/content/images";
import { rentalCharges } from "@/content/pricing";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Why LUSAKO",
  description:
    "LUSAKO is a professional hydration partner, not a catalogue of imported appliances: the right purification technology, professional installation, preventive maintenance, technical support and long-term care.",
  path: "/why-lusako",
});

/** The complete proposition (brief Doc 2 §4, "Why LUSAKO"). */
const proposition = [
  {
    title: "Suitable purification technology",
    body: "UF for treated city water, RO for well water and higher TDS. We recommend the right one, so you never have to work it out alone.",
  },
  {
    title: "Professional installation",
    body: "Trained LUSAKO technicians connect your system to your existing water supply and check everything before handing over.",
  },
  { title: "Preventive maintenance", body: "Scheduled service visits keep your system performing at its best, year after year." },
  { title: "Technical support", body: "Diagnosis and repair by technicians who know LUSAKO systems inside out." },
  {
    title: "Long-term customer care",
    body: "Service plans and Annual Maintenance Contracts for purchased systems, and dedicated support for rental customers.",
  },
];

const pillars = [
  { name: "Buy", line: "Own your water purification system.", href: "/water-purifiers", cta: "Explore purifiers" },
  { name: "Rent", line: "Complete hydration for one predictable monthly payment.", href: "/rental", cta: "Explore rental" },
  {
    name: "Hydrate",
    line: "Hydration solutions for offices and organisations, across one site or many.",
    href: "/hydration-solutions",
    cta: "Hydration solutions",
  },
  { name: "Care", line: "Professional installation, maintenance and technical support.", href: "/service-support", cta: "LUSAKO Care" },
];

/** Trust elements from brief Doc 2 §16 that are true today. Client proof is added once approved. */
const trust: { icon: LucideIcon; title: string; body: string; href?: string }[] = [
  {
    icon: ShieldCheck,
    title: "Warranty information",
    body: "Every purchased system comes with a product warranty, shown on its product page.",
    href: "/water-purifiers",
  },
  { icon: Wrench, title: "Professional installation", body: "Connected to your existing water supply by trained LUSAKO technicians." },
  { icon: CalendarCheck, title: "Preventive maintenance", body: "Scheduled visits keep every system performing as it should." },
  {
    icon: Headset,
    title: "Technical support",
    body: "Help when you need it, by phone, WhatsApp or an online service request.",
    href: "/service-support",
  },
  {
    icon: Receipt,
    title: "Transparent rental terms",
    body: `Monthly rental + VAT, a one-time ${formatLKR(rentalCharges.initialPaymentPerUnit)} initial payment per unit, and any regional charge on its own line.`,
    href: "/rental",
  },
  {
    icon: FlaskConical,
    title: "Clear UF/RO recommendation",
    body: "Answer three quick questions and we recommend UF or RO for your water.",
    href: "/find-my-solution",
  },
  {
    icon: MessagesSquare,
    title: "Frequently asked questions",
    body: "Straight answers on UF and RO, buying, rental and service.",
    href: "/faq",
  },
  { icon: MapPin, title: "Contactable local support", body: "A local team you can call, message on WhatsApp or email.", href: "/contact" },
];

const nextActions = [
  {
    audience: "For homes",
    title: "Buy",
    body: "Own your water purification system.",
    cta: "Explore purifiers",
    href: "/water-purifiers",
    photo: photos.heroHome,
    position: "object-[50%_65%]",
  },
  {
    audience: "For offices",
    title: "Rent",
    body: "Complete hydration for one predictable monthly payment.",
    cta: "Explore rental",
    href: "/rental",
    photo: photos.officePantry,
    position: "object-center",
  },
  {
    audience: "For organisations",
    title: "Corporate solution",
    body: "One partner for your workplace hydration, across one site or many.",
    cta: "Request a corporate solution",
    href: "/hydration-solutions/corporate",
    photo: photos.corporateTeam,
    position: "object-center",
  },
  {
    audience: "Existing customers",
    title: "Contact service",
    body: "Keep your LUSAKO system performing at its best.",
    cta: "Contact service",
    href: "/service-support",
    photo: photos.careTechnician,
    position: "object-center",
  },
];

export default function WhyLusakoPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Why LUSAKO", href: "/why-lusako" }]}
        eyebrow="Why LUSAKO"
        title={
          <>
            A hydration partner, <Highlight>not a catalogue</Highlight>
          </>
        }
        description="LUSAKO is a water purification and hydration solutions company. We match the right technology to your water, install it properly and look after it for years."
        actions={
          <>
            <ButtonLink href="/find-my-solution" variant="dark" size="lg" arrow>
              Find my solution
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg" arrow>
              Get a quote
            </ButtonLink>
          </>
        }
      />

      <section className="py-14 lg:py-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="The complete proposition"
                title={
                  <>
                    Not just a machine. <Highlight>The whole result.</Highlight>
                  </>
                }
                description="A purifier is only as good as the advice, installation and care behind it. LUSAKO takes responsibility for all of it."
              />
            </div>
          </div>
          <ol className="lg:col-span-7">
            {proposition.map((item, i) => (
              <li
                key={item.title}
                className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-line py-8 first:border-t-0 first:pt-0 last:pb-0 sm:gap-x-10 sm:py-10"
              >
                <span
                  aria-hidden
                  className="row-span-2 text-[2.75rem] leading-none font-medium tracking-[-0.04em] text-outline [--outline-c:var(--color-brand)] sm:text-[3.25rem]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-h3 font-medium text-ink">{item.title}</h3>
                <p className="text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
        <Container>
          <div className="relative overflow-hidden rounded-card-xl bg-ocean p-7 text-white sm:p-10 lg:p-14">
            <Rings count={9} className="absolute -top-40 -right-40 size-[34rem] text-aqua/20" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Pill variant="glass">BUY • RENT • HYDRATE • CARE</Pill>
                <h2 className="mt-5 max-w-2xl text-h2 font-medium">Better water. Better way.</h2>
              </div>
              <p className="max-w-sm text-white/75 lg:pb-2">
                Four ways LUSAKO brings better water to homes, offices and organisations, all backed by LUSAKO Care.
              </p>
            </div>
            <ul className="relative mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar, i) => (
                <li key={pillar.name}>
                  <Link
                    href={pillar.href}
                    className="group/card flex h-full min-h-64 flex-col rounded-card bg-white/5 p-6 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/10"
                  >
                    <span aria-hidden className="text-xs font-medium tracking-[0.18em] text-white/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-[2rem] leading-none font-medium tracking-[-0.03em]">{pillar.name}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/75">{pillar.line}</p>
                    <span className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm font-medium">
                      {pillar.cta}
                      <ArrowCircle />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Trust"
              title={
                <>
                  What you can <Highlight>count on</Highlight>
                </>
              }
            />
            <p className="max-w-sm text-muted lg:pb-2">
              The essentials every LUSAKO customer can rely on, from the first question to years of service.
            </p>
          </div>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(({ icon: Icon, title, body, href }) => {
              const inner = (
                <>
                  <span className="flex items-start justify-between gap-4">
                    <IconBadge variant="white">
                      <Icon />
                    </IconBadge>
                    {href && (
                      <ArrowUpRight
                        aria-hidden
                        className="size-5 text-subtle transition-transform duration-200 group-hover/card:rotate-45 group-hover/card:text-ink"
                      />
                    )}
                  </span>
                  <span className="mt-8 block text-lg leading-snug font-medium text-ink">{title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">{body}</span>
                </>
              );
              return (
                <li key={title}>
                  {href ? (
                    <Link href={href} className="group/card flex h-full flex-col rounded-card bg-frost p-6 transition-colors duration-300 hover:bg-ice">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col rounded-card bg-frost p-6">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-sm text-muted">
            Client names, logos and stories are published only with each client’s approval.{" "}
            <Link href="/clients" className="font-medium text-ink underline decoration-sky underline-offset-4 transition-colors hover:decoration-brand">
              See our clients
            </Link>
            .
          </p>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Your next step"
            title={
              <>
                One clear next action <Highlight>for every visitor</Highlight>
              </>
            }
            description="Buying for a home, renting for an office, planning for an organisation or looking after a system you already have: start here."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nextActions.map((action) => (
              <li key={action.title}>
                <Link href={action.href} className="group/card relative block aspect-[4/5] overflow-hidden rounded-card-xl bg-frost">
                  <Image
                    src={action.photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className={cn("object-cover transition-transform duration-700 ease-emph group-hover/card:scale-[1.04]", action.position)}
                  />
                  <span aria-hidden className="absolute inset-0 bg-linear-to-b from-ink/30 via-transparent to-transparent" />
                  <Pill variant="glass" className="absolute top-4 left-4">
                    {action.audience}
                  </Pill>
                  <span className="corner-tab max-w-[90%] p-5 pr-6 [--tab-r:28px]">
                    <h3 className="text-h3 font-medium text-ink">{action.title}</h3>
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted">{action.body}</span>
                    <span className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium text-ink">
                      {action.cta}
                      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover/card:rotate-45" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <ArchCta />
    </>
  );
}
