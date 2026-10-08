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
import { Container } from "@/components/ui/container";
import { Rule, WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { fill } from "@/content/copy/schema";
import { whyHero, whyNextSteps, whyPillars, whyProposition, whySeo, whyTrust } from "@/content/copy/why";
import type { Photos } from "@/content/images";
import { getCopy, getPhotos, getRentalPrices } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(whySeo);
  return pageMetadata({ title: seo.title, absolute: true, description: seo.description, path: "/why-lusako" });
}

/** Where each Buy / Rent / Hydrate / Care card leads, by position (their wording is the why.pillars block). */
const pillarLinks = ["/water-purifiers", "/rental", "/hydration-solutions", "/service-support"];

/**
 * Trust elements from brief Doc 2 §16 that are true today: each card's icon and link, by position (their wording is
 * the why.trust block). Client proof is added once approved.
 */
const trustPlaces: { icon: LucideIcon; href?: string }[] = [
  { icon: ShieldCheck, href: "/water-purifiers" },
  { icon: Wrench },
  { icon: CalendarCheck },
  { icon: Headset, href: "/service-support" },
  { icon: Receipt, href: "/rental" },
  { icon: FlaskConical, href: "/find-my-solution" },
  { icon: MessagesSquare, href: "/faq" },
  { icon: MapPin, href: "/contact" },
];

/** The card whose text names the initial payment while it's shown ("Transparent rental terms"). */
const RENTAL_TERMS = 4;

/** Each next-step card's link and photo, by position (their wording is the why.nextSteps block). */
const nextActionPlaces = (photos: Photos) => [
  { href: "/water-purifiers", photo: photos.heroHome, position: "object-[50%_65%]" },
  { href: "/rental", photo: photos.officePantry, position: "object-center" },
  { href: "/hydration-solutions/corporate", photo: photos.corporateTeam, position: "object-center" },
  { href: "/service-support", photo: photos.careTechnician, position: "object-center" },
];

export default async function WhyLusakoPage() {
  const [photos, rentalPrices, hero, proposition, pillars, trust, nextSteps] = await Promise.all([
    getPhotos(),
    getRentalPrices(),
    getCopy(whyHero),
    getCopy(whyProposition),
    getCopy(whyPillars),
    getCopy(whyTrust),
    getCopy(whyNextSteps),
  ]);
  const trustCards = trustPlaces.map((place, i) => {
    const { title, body } = trust.cards[i];
    // While the initial payment is shown, the rental terms card names it.
    const text =
      i === RENTAL_TERMS && rentalPrices.initial !== null ? fill(trust.rentalTermsWithPrice, { price: formatLKR(rentalPrices.initial) }) : body;
    return { ...place, title, body: text };
  });
  const places = nextActionPlaces(photos);
  const nextActions = nextSteps.cards.map((card, i) => ({ ...card, ...places[i] }));
  return (
    <>
      <PageHero
        crumbs={[{ label: "Why LUSAKO", href: "/why-lusako" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        actions={[
          { label: hero.findButton, href: "/find-my-solution" },
          { label: hero.quoteButton, href: "/contact" },
        ]}
        image={{ src: photos.pageWhy.src, position: "object-right" }}
      />

      <section className="py-16 md:py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-10" data-no-reveal>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <SectionHeading
                eyebrow={proposition.eyebrow}
                title={marked(proposition.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
                description={proposition.description}
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Rule />
            <ol data-stagger>
              {proposition.items.map((item, i) => (
                <li key={i}>
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
                <Pill variant="glass">{pillars.tag}</Pill>
                <h2 data-split className="split mt-5 max-w-2xl text-h2 font-bold">
                  {splitWords(pillars.title)}
                </h2>
              </div>
              <p data-reveal="up" className="max-w-sm text-white lg:pb-2">
                {pillars.description}
              </p>
            </div>
            <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.cards.map((pillar, i) => (
                <li key={i}>
                  <Link
                    href={pillarLinks[i]}
                    className="group/card flex h-full flex-col rounded-card bg-white/10 p-6 sm:min-h-64 ring-1 ring-white/20 backdrop-blur-sm transition-colors duration-300 hover:bg-white/15"
                  >
                    <span aria-hidden className="font-sans text-4xl leading-none font-extralight tracking-[-0.04em] text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 font-display text-[2rem] leading-none font-bold">{pillar.name}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white">{pillar.line}</p>
                    <span className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm font-semibold">
                      {pillar.link}
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
            eyebrow={trust.eyebrow}
            title={marked(trust.title)}
            description={trust.description}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {trustCards.map(({ icon: Icon, title, body, href }, i) => {
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
                <li key={i}>
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
            eyebrow={nextSteps.eyebrow}
            title={marked(nextSteps.title, { mark: (phrase) => <Highlight className="inline-block">{phrase}</Highlight> })}
            description={nextSteps.description}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {nextActions.map((action, i) => (
              <li key={i}>
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
                      {action.link}
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
