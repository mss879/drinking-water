import type { Metadata } from "next";
import Image from "next/image";
import {
  Building2,
  CircleAlert,
  ClipboardList,
  Droplets,
  Factory,
  Headset,
  Hospital,
  Hotel,
  Info,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  Store,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { caseStudies, clientLogos, sectors, type CaseStudy } from "@/content/clients";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Clients & Success Stories",
  description:
    "How LUSAKO looks after drinking water for offices, factories, hotels, schools, hospitals and commercial organisations, from the first challenge to ongoing support.",
  path: "/clients",
});

const sectorDetails: Record<string, { icon: LucideIcon; hint: string }> = {
  "Corporate offices": { icon: Building2, hint: "Pantries, meeting floors and reception areas." },
  Factories: { icon: Factory, hint: "Canteens and production floors with shift teams." },
  Hotels: { icon: Hotel, hint: "Restaurants, lounges and staff areas." },
  Schools: { icon: School, hint: "Pure water for students, staff and visitors." },
  Hospitals: { icon: Hospital, hint: "Clinics and waiting areas that need water all day." },
  "Commercial organisations": { icon: Store, hint: "Branches, showrooms and customer areas." },
};

type StoryKey = "challenge" | "requirement" | "solution" | "implementation" | "support" | "result";

/** Case study template, brief Doc 2 §11: Challenge → Requirement → Solution → Implementation → Support → Result. */
const storySteps: { key: StoryKey; label: string; icon: LucideIcon }[] = [
  { key: "challenge", label: "Challenge", icon: CircleAlert },
  { key: "requirement", label: "Requirement", icon: ClipboardList },
  { key: "solution", label: "LUSAKO solution", icon: Droplets },
  { key: "implementation", label: "Implementation", icon: Wrench },
  { key: "support", label: "Ongoing support", icon: Headset },
  { key: "result", label: "Result", icon: Sparkles },
];

function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  const model = study.solution.split(" · ")[0];
  const titleId = `${study.slug}-title`;
  return (
    <article aria-labelledby={titleId} className="card-line grid gap-8 rounded-card-xl p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
      <div className="lg:col-span-4">
        <div className="flex flex-wrap gap-2">
          {study.sample && <Pill variant="tint">Sample story</Pill>}
          <Pill>{model}</Pill>
        </div>
        <p
          aria-hidden
          className="mt-8 font-sans text-[3.75rem] leading-none font-extralight tracking-[-0.04em] text-brand"
        >
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 id={titleId} className="mt-4 font-display text-h3 font-bold text-ink">
          {/* Keep each "·" with the word before it, so a wrapped line never starts with it. */}
          {study.industry.replaceAll(" · ", "\u00a0· ")}
        </h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <MapPin aria-hidden className="size-4 shrink-0 text-brand" />
          {study.location}
        </p>
      </div>

      <ol className="lg:col-span-8">
        {storySteps.map(({ key, label, icon: Icon }, i) => {
          const last = i === storySteps.length - 1;
          return (
            <li key={key} className="relative flex gap-4 pb-6 last:pb-0 sm:gap-5">
              {!last && <span aria-hidden className="absolute top-12 bottom-1 left-5 w-px bg-line" />}
              <IconBadge variant={last ? "deep" : "tint"} size="sm" brand={false}>
                <Icon />
              </IconBadge>
              <div className={cn("min-w-0 flex-1", last ? "rounded-card-sm bg-tint-2 px-4 py-3" : "pt-1")}>
                <p className="font-display text-xs font-bold tracking-[0.16em] text-deep uppercase">{label}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink">{study[key]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

export default function ClientsPage() {
  const hasSamples = caseStudies.some((study) => study.sample);

  return (
    <>
      <PageHero
        crumbs={[{ label: "Our clients", href: "/clients" }]}
        eyebrow="Our clients"
        title={
          <>
            Our clients & <Highlight>success stories</Highlight>
          </>
        }
        description="From single offices to multi-site organisations, LUSAKO plans, installs and looks after drinking water. Here’s how that work comes together."
      />

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Sectors we serve"
            title={
              <>
                From corporate offices <Highlight>to hospitals</Highlight>
              </>
            }
            description="Every sector uses water differently. We match machines, placement and service to how your people drink."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
            {sectors.map((sector) => {
              const detail = sectorDetails[sector];
              const Icon = detail?.icon ?? Building2;
              return (
                <li
                  key={sector}
                  className="card-line flex gap-4 p-5 transition-colors duration-300 hover:border-brand hover:bg-tint sm:min-h-56 sm:flex-col sm:justify-between sm:gap-8 sm:p-7"
                >
                  <span className="grid size-16 shrink-0 place-items-center rounded-card-sm bg-tint-2">
                    <IconBadge size="sm">
                      <Icon />
                    </IconBadge>
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-snug font-bold text-ink sm:text-xl">{sector}</h3>
                    {detail && <p className="mt-1.5 text-sm leading-relaxed text-muted">{detail.hint}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            eyebrow="Client logos"
            title={
              <>
                The organisations <Highlight>we work with</Highlight>
              </>
            }
          />
          {clientLogos.length > 0 ? (
            <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {clientLogos.map((logo) => (
                <li key={logo.name} className="card-line grid aspect-[3/2] place-items-center p-6">
                  <span className="relative block size-full">
                    <Image src={logo.src} alt={`${logo.name} logo`} fill sizes="(min-width: 1024px) 200px, 40vw" className="object-contain" />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div data-reveal="up" className="relative mt-12 overflow-hidden rounded-card-xl bg-tint p-6 sm:p-10">
              <ul aria-hidden className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <li key={i} className="aspect-[3/2] rounded-card-sm border border-dashed border-brand/30 bg-white" />
                ))}
              </ul>
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="flex max-w-md flex-col items-center rounded-card bg-white p-6 text-center shadow-float sm:p-8">
                  <IconBadge size="lg">
                    <ShieldCheck />
                  </IconBadge>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">Published with permission</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    We show a client’s name or logo only with their written approval. Approved logos will appear here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      <section className="pb-16 md:pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow="Success stories"
            title={
              <>
                From challenge <Highlight>to result</Highlight>
              </>
            }
            description="Every LUSAKO project follows the same path: understand the challenge, match the solution, install it properly and keep it performing."
          />
          {hasSamples && (
            <p className="mt-10 flex items-start gap-3 rounded-card-sm border border-line bg-tint p-4 text-sm leading-relaxed text-ink sm:items-center sm:px-5">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-deep sm:mt-0" />
              Stories marked “Sample story” show how a typical LUSAKO project runs. They will be replaced with approved client stories.
            </p>
          )}
          <div data-stagger className="mt-6 grid gap-4 lg:gap-5">
            {caseStudies.map((study, i) => (
              <CaseStudyCard key={study.slug} study={study} index={i} />
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-4">
        <Container>
          <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="relative max-w-2xl">
              <Pill variant="glass">Corporate hydration</Pill>
              <h2 className="mt-5 text-h2 font-bold">Planning water for a whole organisation?</h2>
              <p className="mt-4 text-lead text-white">
                One partner for your workplace hydration: site assessment, the right mix of machines, installation and ongoing service,
                across one site or many.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href="/hydration-solutions/corporate" variant="white" size="lg" arrow>
                  Explore corporate hydration
                </ButtonLink>
                <ButtonLink href="/contact?type=corporate" variant="glass" size="lg">
                  Request a business quote
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
