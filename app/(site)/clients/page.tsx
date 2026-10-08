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
import { IconBadge } from "@/components/ui/icon-badge";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectors, type CaseStudy } from "@/content/clients";
import { clientsCorporate, clientsHero, clientsLogos, clientsSectors, clientsSeo, clientsStories } from "@/content/copy/clients";
import { getCaseStudies, getClientLogos, getCopy, getPhotos } from "@/lib/cms/content";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(clientsSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/clients" });
}

/** Each sector's icon, by its exact name (its line is the clients.sectors block); other names get the office icon. */
const sectorIcons: Record<string, LucideIcon> = {
  "Corporate offices": Building2,
  Factories: Factory,
  Hotels: Hotel,
  Schools: School,
  Hospitals: Hospital,
  "Commercial organisations": Store,
};

type StoryKey = "challenge" | "requirement" | "solution" | "implementation" | "support" | "result";

/**
 * Case study template, brief Doc 2 §11: Challenge → Requirement → Solution → Implementation → Support → Result. The
 * step names are the clients.stories block's, by position.
 */
const storySteps: { key: StoryKey; icon: LucideIcon }[] = [
  { key: "challenge", icon: CircleAlert },
  { key: "requirement", icon: ClipboardList },
  { key: "solution", icon: Droplets },
  { key: "implementation", icon: Wrench },
  { key: "support", icon: Headset },
  { key: "result", icon: Sparkles },
];

type StoriesCopy = typeof clientsStories.defaults;

function CaseStudyCard({ study, index, copy }: { study: CaseStudy; index: number; copy: StoriesCopy }) {
  // The model pill: the story's own, else the solution's first part ("Rental · PureFlow UF …" → "Rental").
  const model = study.model || study.solution.split(" · ")[0];
  const titleId = `${study.slug}-title`;
  return (
    <article aria-labelledby={titleId} className="card-line grid gap-8 rounded-card-xl p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
      <div className="lg:col-span-4">
        <div className="flex flex-wrap gap-2">
          {study.sample && <Pill variant="tint">{copy.samplePill}</Pill>}
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
        {storySteps.map(({ key, icon: Icon }, i) => {
          const last = i === storySteps.length - 1;
          return (
            <li key={key} className="relative flex gap-4 pb-6 last:pb-0 sm:gap-5">
              {!last && <span aria-hidden className="absolute top-12 bottom-1 left-5 w-px bg-line" />}
              <IconBadge variant={last ? "deep" : "tint"} size="sm" brand={false}>
                <Icon />
              </IconBadge>
              <div className={cn("min-w-0 flex-1", last ? "rounded-card-sm bg-tint-2 px-4 py-3" : "pt-1")}>
                <p className="font-display text-xs font-bold tracking-[0.16em] text-deep uppercase">{copy.steps[i]}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink">{study[key]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

export default async function ClientsPage() {
  const [clientLogos, photos, caseStudies, hero, sectorsCopy, logos, stories, corporate] = await Promise.all([
    getClientLogos(),
    getPhotos(),
    getCaseStudies(),
    getCopy(clientsHero),
    getCopy(clientsSectors),
    getCopy(clientsLogos),
    getCopy(clientsStories),
    getCopy(clientsCorporate),
  ]);
  const hasSamples = caseStudies.some((study) => study.sample);

  return (
    <>
      <PageHero
        crumbs={[{ label: "Our clients", href: "/clients" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        image={{ src: photos.pageClients.src, position: "object-right" }}
      />

      <section className="pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-28">
        <Container>
          <SectionHeading
            layout="split"
            eyebrow={sectorsCopy.eyebrow}
            title={marked(sectorsCopy.title)}
            description={sectorsCopy.description}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
            {sectors.map((sector, i) => {
              const hint = sectorsCopy.hints[i];
              const Icon = sectorIcons[sector] ?? Building2;
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
                    {hint && <p className="mt-1.5 text-sm leading-relaxed text-muted">{hint}</p>}
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
            eyebrow={logos.eyebrow}
            title={marked(logos.title)}
          />
          {clientLogos.length > 0 ? (
            // Any number of logos: the grid simply grows, row by row. Shown in greyscale, so the page keeps to the brand colours.
            <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {clientLogos.map((logo) => {
                const image = (
                  <span className="relative block size-full">
                    <Image
                      src={logo.src}
                      alt={`${logo.name} logo`}
                      fill
                      sizes="(min-width: 1024px) 200px, 40vw"
                      className="object-contain opacity-80 grayscale transition-opacity duration-300 hover:opacity-100"
                    />
                  </span>
                );
                return (
                  <li key={logo.id} className="card-line grid aspect-[3/2] place-items-center p-6">
                    {logo.url ? (
                      <a href={logo.url} target="_blank" rel="noopener noreferrer" className="block size-full" title={logo.name}>
                        {image}
                      </a>
                    ) : (
                      image
                    )}
                  </li>
                );
              })}
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
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">{logos.emptyTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{logos.emptyText}</p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Left out while no story is published (Client stories), so the heading never sits over nothing. */}
      {caseStudies.length > 0 && (
        <section className="pb-16 md:pb-20 lg:pb-28">
          <Container>
            <SectionHeading
              layout="split"
              eyebrow={stories.eyebrow}
              title={marked(stories.title)}
              description={stories.description}
            />
            {hasSamples && (
              <p className="mt-10 flex items-start gap-3 rounded-card-sm border border-line bg-tint p-4 text-sm leading-relaxed text-ink sm:items-center sm:px-5">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-deep sm:mt-0" />
                {stories.sampleNote}
              </p>
            )}
            <div data-stagger className="mt-6 grid gap-4 lg:gap-5">
              {caseStudies.map((study, i) => (
                <CaseStudyCard key={study.slug} study={study} index={i} copy={stories} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="pb-4">
        <Container>
          <div data-expand className="relative isolate overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10 lg:p-14">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="relative max-w-2xl">
              <Pill variant="glass">{corporate.tag}</Pill>
              <h2 className="mt-5 text-h2 font-bold">{corporate.title}</h2>
              <p className="mt-4 text-lead text-white">{corporate.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href="/hydration-solutions/corporate" variant="white" size="lg" arrow>
                  {corporate.exploreButton}
                </ButtonLink>
                <ButtonLink href="/contact?type=corporate" variant="glass" size="lg">
                  {corporate.quoteButton}
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
