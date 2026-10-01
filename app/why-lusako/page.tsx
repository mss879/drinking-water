import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
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
import { splitWords } from "@/components/motion/split-words";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rule, WaveLines } from "@/components/ui/decor";
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
            <ButtonLink href="/find-my-solution" variant="primary" size="lg" arrow>
              Find my solution
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg" arrow>
              Get a quote
            </ButtonLink>
          </>
        }
      />

      <section className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-10" data-no-reveal>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <SectionHeading
                eyebrow="The complete proposition"
                title={
                  <>
                    Not just a machine. <Highlight className="inline-block">The whole result.</Highlight>
                  </>
                }
                description="A purifier is only as good as the advice, installation and care behind it. LUSAKO takes responsibility for all of it."
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Rule />
            <ol data-stagger>
              {proposition.map((item, i) => (
                <li key={item.title}>
                  <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 py-8 sm:gap-x-10 sm:py-10">
                    <span
                      aria-hidden
                      className="row-span-2 w-[2.2ch] font-sans text-[3rem] leading-none font-extralight tracking-[-0.04em] text-brand sm:text-[3.75rem]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-h3 font-bold text-ink">{item.title}</h3>
                    <p className="max-w-lg leading-relaxed text-muted">{item.body}</p>
                  </div>
                  <Rule />
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Pill variant="glass">BUY • RENT • HYDRATE • CARE</Pill>
                <h2 data-split className="split mt-5 max-w-2xl text-h2 font-bold">
                  {splitWords("Better water. Better way.")}
                </h2>
              </div>
              <p data-reveal="up" className="max-w-sm text-white lg:pb-2">
                Four ways LUSAKO brings better water to homes, offices and organisations, all backed by LUSAKO Care.
              </p>
            </div>
            <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar, i) => (
                <li key={pillar.name}>
                  <Link
                    href={pillar.href}
                    className="group/card flex h-full flex-col rounded-card bg-white/10 p-6 sm:min-h-64 ring-1 ring-white/20 backdrop-blur-sm transition-colors duration-300 hover:bg-white/15"
                  >
                    <span aria-hidden className="font-sans text-4xl leading-none font-extralight tracking-[-0.04em] text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 font-display text-[2rem] leading-none font-bold">{pillar.name}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white">{pillar.line}</p>
                    <span className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm font-semibold">
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

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Trust"
            title={
              <>
                What you can <Highlight>count on</Highlight>
              </>
            }
            description="The essentials every LUSAKO customer can rely on, from the first question to years of service."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {trust.map(({ icon: Icon, title, body, href }) => {
              const inner = (
                <>
                  <span className="flex items-start justify-between gap-4">
                    <span className="grid size-16 place-items-center rounded-card-sm bg-tint transition-colors duration-300 group-hover/card:bg-white">
                      <IconBadge size="sm">
                        <Icon />
                      </IconBadge>
                    </span>
                    {href && <ArrowCircle variant="tint" className="size-10" />}
                  </span>
                  <span className="mt-8 block font-display text-lg leading-snug font-bold text-ink">{title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">{body}</span>
                </>
              );
              return (
                <li key={title}>
                  {href ? (
                    <Link
                      href={href}
                      className="group/card card-line flex h-full flex-col p-6 transition-colors duration-300 hover:border-brand hover:bg-tint"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="card-line flex h-full flex-col p-6">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <p data-reveal="up" className="mt-8 text-sm text-muted">
            Client names, logos and stories are published only with each client’s approval.{" "}
            <Link
              href="/clients"
              className="font-semibold text-deep underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:decoration-deep"
            >
              See our clients
            </Link>
            .
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-20 lg:py-28">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Your next step"
            title={
              <>
                One clear next action <Highlight className="inline-block">for every visitor</Highlight>
              </>
            }
            description="Buying for a home, renting for an office, planning for an organisation or looking after a system you already have: start here."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {nextActions.map((action) => (
              <li key={action.title}>
                <Link
                  href={action.href}
                  className="group/card card-line flex h-full flex-col p-2.5 transition-colors duration-300 hover:border-brand"
                >
                  <span className="relative block aspect-[4/3.4] overflow-hidden rounded-card-sm">
                    <Image
                      src={action.photo.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      data-no-parallax
                      className={cn("object-cover transition-transform duration-700 ease-emph group-hover/card:scale-[1.04]", action.position)}
                    />
                    <Pill variant="white" className="absolute top-3 left-3">
                      {action.audience}
                    </Pill>
                  </span>
                  <span className="flex flex-1 flex-col px-3 pt-5 pb-3">
                    <h3 className="font-display text-h3 font-bold text-ink">{action.title}</h3>
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted">{action.body}</span>
                    <span className="mt-auto flex items-center gap-3 pt-6 text-sm font-semibold text-deep">
                      <ArrowCircle variant="deep" className="size-10" />
                      {action.cta}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
