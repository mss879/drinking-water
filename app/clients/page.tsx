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
import { ArchCta } from "@/components/sections/arch-cta";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
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
    <article aria-labelledby={titleId} className="grid gap-8 rounded-card-xl border border-line p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
      <div className="lg:col-span-4">
        <div className="flex flex-wrap gap-2">
          {study.sample && <Pill variant="pastel">Sample story</Pill>}
          <Pill>{model}</Pill>
        </div>
        <p
          aria-hidden
          className="mt-8 text-[3.25rem] leading-none font-medium tracking-[-0.04em] text-outline [--outline-c:var(--color-brand)]"
        >
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 id={titleId} className="mt-4 text-h3 font-medium text-ink">
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
              <IconBadge variant={last ? "ocean" : "pastel"} size="sm" brand={false}>
                <Icon />
              </IconBadge>
              <div className={cn("min-w-0 flex-1", last ? "rounded-card-sm bg-pastel px-4 py-3" : "pt-1")}>
                <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">{label}</p>
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

      <section className="pb-14 lg:pb-20">
        <Container>
          <SectionHeading
            eyebrow="Sectors we serve"
            title={
              <>
                From corporate offices <Highlight>to hospitals</Highlight>
              </>
            }
            description="Every sector uses water differently. We match machines, placement and service to how your people drink."
          />
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector) => {
              const detail = sectorDetails[sector];
              const Icon = detail?.icon ?? Building2;
              return (
                <li key={sector} className="flex gap-4 rounded-card bg-frost p-5 sm:min-h-52 sm:flex-col sm:justify-between sm:gap-8 sm:p-7">
                  <IconBadge variant="white">
                    <Icon />
                  </IconBadge>
                  <div>
                    <h3 className="text-lg leading-snug font-medium text-ink sm:text-xl">{sector}</h3>
                    {detail && <p className="mt-1.5 text-sm leading-relaxed text-muted">{detail.hint}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
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
                <li key={logo.name} className="grid aspect-[3/2] place-items-center rounded-card bg-frost p-6">
                  <span className="relative block size-full">
                    <Image src={logo.src} alt={`${logo.name} logo`} fill sizes="(min-width: 1024px) 200px, 40vw" className="object-contain" />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="relative mt-12 overflow-hidden rounded-card-xl bg-frost p-6 sm:p-10">
              <ul aria-hidden className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <li key={i} className="aspect-[3/2] rounded-card-sm border border-dashed border-ink/15" />
                ))}
              </ul>
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="max-w-md rounded-card bg-white p-6 text-center shadow-soft sm:p-8">
                  <IconBadge variant="pastel">
                    <ShieldCheck />
                  </IconBadge>
                  <h3 className="mt-4 text-xl font-medium text-ink">Published with permission</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    We show a client’s name or logo only with their written approval. Approved logos will appear here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Success stories"
              title={
                <>
                  From challenge <Highlight>to result</Highlight>
                </>
              }
            />
            <p className="max-w-sm text-muted lg:pb-2">
              Every LUSAKO project follows the same path: understand the challenge, match the solution, install it properly and keep it
              performing.
            </p>
          </div>
          {hasSamples && (
            <p className="mt-8 flex items-start gap-3 rounded-card-sm bg-ice p-4 text-sm leading-relaxed text-muted sm:items-center sm:px-5">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-brand sm:mt-0" />
              Stories marked “Sample story” show how a typical LUSAKO project runs. They will be replaced with approved client stories.
            </p>
          )}
          <div className="mt-8 grid gap-4">
            {caseStudies.map((study, i) => (
              <CaseStudyCard key={study.slug} study={study} index={i} />
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-4">
        <Container>
          <div className="relative overflow-hidden rounded-card-xl bg-ocean p-7 text-white sm:p-10 lg:p-14">
            <Rings count={9} className="absolute -right-32 -bottom-40 size-[32rem] text-aqua/20" />
            <div className="relative max-w-2xl">
              <Pill variant="glass">Corporate hydration</Pill>
              <h2 className="mt-5 text-h2 font-medium">Planning water for a whole organisation?</h2>
              <p className="mt-4 text-lead text-white/80">
                One partner for your workplace hydration: site assessment, the right mix of machines, installation and ongoing service,
                across one site or many.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

      <ArchCta />
    </>
  );
}
