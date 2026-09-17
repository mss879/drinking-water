import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { photos } from "@/content/images";
import { cn } from "@/lib/cn";

/** LUSAKO Hydration Solutions: For Homes (buy) · For Offices (rent) · For Companies (corporate). */
export const solutions = [
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

export function SolutionsTrio({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        {showHeading && (
          <SectionHeading
            align="center"
            eyebrow="LUSAKO Hydration Solutions"
            title={
              <>
                The right solution for <Highlight>every space</Highlight>
              </>
            }
            description="Buy for your home, rent for your office, or let us manage hydration across your whole organisation."
          />
        )}
        <ul className={cn("grid gap-4 md:grid-cols-3", showHeading && "mt-12")}>
          {solutions.map((solution) => (
            <li key={solution.label}>
              <Link href={solution.href} className="group/card relative block aspect-[4/5] overflow-hidden rounded-card-xl bg-frost">
                <Image
                  src={solution.photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={`object-cover transition-transform duration-700 ease-emph group-hover/card:scale-[1.04] ${solution.position}`}
                />
                <span aria-hidden className="absolute inset-0 bg-linear-to-b from-ink/30 via-transparent to-transparent" />
                <Pill variant="glass" className="absolute top-5 left-5">
                  {solution.label}
                </Pill>
                <span className="corner-tab max-w-[88%] p-5 pr-6 [--tab-r:28px] sm:p-6">
                  <h3 className="text-h3 font-medium text-ink">{solution.title}</h3>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">{solution.body}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-ink">
                    {solution.cta}
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover/card:rotate-45" />
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
