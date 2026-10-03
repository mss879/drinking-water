import Image from "next/image";
import Link from "next/link";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Photos } from "@/content/images";
import { getPhotos } from "@/lib/cms/content";
import { cn } from "@/lib/cn";

/** LUSAKO Hydration Solutions: For Homes (buy) · For Offices (rent) · For Companies (corporate). */
const solutionsWith = (photos: Photos) => [
  {
    label: "For homes",
    title: "Buy a LUSAKO purifier",
    body: "Recommended option for domestic customers.",
    cta: "Explore products",
    href: "/water-purifiers",
    photo: photos.heroHome,
    position: "object-[50%_70%]",
  },
  {
    label: "For offices",
    title: "Rent a LUSAKO purifier",
    body: "Low upfront investment. Professional installation and ongoing service.",
    cta: "Explore rental",
    href: "/rental",
    photo: photos.officePantry,
    position: "object-center",
  },
  {
    label: "For companies",
    title: "Corporate Hydration Solutions",
    body: "One partner for your organisation’s drinking-water requirements.",
    cta: "Talk to our team",
    href: "/hydration-solutions/corporate",
    photo: photos.corporateTeam,
    position: "object-center",
  },
];

/** Three outlined photo cards (the StomDent doctor cards): black & white photo, then title, text and a link. */
export async function SolutionsTrio({ showHeading = true }: { showHeading?: boolean }) {
  const solutions = solutionsWith(await getPhotos());
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <Container>
        {showHeading && (
          <SectionHeading
            layout="split"
            eyebrow="LUSAKO Hydration Solutions"
            title={
              <>
                The right solution for <Highlight>every space</Highlight>
              </>
            }
            description="Buy for your home, rent for your office, or let us manage hydration across your whole organisation."
          />
        )}
        <ul className={cn("grid gap-4 md:grid-cols-3 lg:gap-5", showHeading && "mt-12 lg:mt-14")}>
          {solutions.map((solution) => (
            <li key={solution.label}>
              <Link
                href={solution.href}
                className="group/card card-line flex h-full flex-col p-2.5 transition-colors duration-300 hover:border-brand"
              >
                <span className="relative block aspect-[4/3] overflow-hidden rounded-card-sm">
                  <Image
                    src={solution.photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    data-no-parallax
                    className={`object-cover transition-transform duration-700 ease-emph group-hover/card:scale-[1.04] ${solution.position}`}
                  />
                  <Pill variant="white" className="absolute top-4 left-4">
                    {solution.label}
                  </Pill>
                </span>
                <span className="flex flex-1 flex-col px-3.5 pt-6 pb-4">
                  <h3 className="font-display text-h3 font-bold text-ink">{solution.title}</h3>
                  <span className="mt-2 block text-[15px] leading-relaxed text-muted">{solution.body}</span>
                  <span className="mt-auto flex items-center gap-3 pt-7 text-sm font-semibold text-deep">
                    <ArrowCircle variant="deep" className="size-10" />
                    {solution.cta}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
