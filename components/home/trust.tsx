import Image from "next/image";
import { Check } from "lucide-react";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import type { BrandIconName } from "@/content/brand-icons";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectors, type ClientLogo } from "@/content/clients";

const sectorIcons: Record<string, BrandIconName> = {
  "Corporate offices": "office",
  Factories: "factory",
  Hotels: "hotel",
  Schools: "school",
  Hospitals: "hospital",
  "Commercial organisations": "store",
};

const trust = [
  "Warranty on purchases",
  "Professional installation",
  "Preventive maintenance",
  "Technical support",
  "Transparent rental terms",
  "Contactable local support",
];

/** Client success / trust. Approved client logos (added in the admin) appear as a strip once there are any (brief §10). */
export function Trust({ logos = [] }: { logos?: ClientLogo[] }) {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          layout="split"
          eyebrow="Our clients"
          title={
            <>
              Real installations. <Highlight>Real relationships.</Highlight>
            </>
          }
          description="LUSAKO looks after drinking water for homes, offices and organisations. These are the places we serve every day."
          action={
            <ButtonLink href="/clients" variant="outline" arrow>
              Client success stories
            </ButtonLink>
          }
        />
        {logos.length > 0 && (
          <ul aria-label="Some of the organisations we work with" className="mt-12 grid grid-cols-3 items-center gap-x-6 gap-y-4 sm:grid-cols-4 lg:mt-14 lg:grid-cols-6">
            {logos.slice(0, 12).map((logo) => (
              <li key={logo.id} className="relative h-14 sm:h-16">
                <Image src={logo.src} alt={`${logo.name} logo`} fill sizes="(min-width: 1024px) 180px, 28vw" className="object-contain opacity-70 grayscale" />
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-14 lg:grid-cols-6 lg:gap-4">
          {sectors.map((sector) => (
            <li
              key={sector}
              className="card-line group flex flex-col gap-3 p-4 transition-colors duration-300 hover:border-brand hover:bg-tint sm:gap-4 sm:p-5"
            >
              <span className="grid size-12 place-items-center rounded-card-sm bg-tint-2 transition-colors duration-300 group-hover:bg-white sm:size-14">
                <BrandIcon name={sectorIcons[sector] ?? "office"} size={40} />
              </span>
              <span className="font-display text-[15px] leading-snug font-semibold text-ink">{sector}</span>
            </li>
          ))}
        </ul>
        <ul data-stagger className="mt-10 grid gap-2.5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {trust.map((label) => (
            <li key={label} className="flex items-center gap-2.5 rounded-full border border-line py-1.5 pr-4 pl-1.5 text-sm font-medium text-ink">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-deep text-white">
                <Check aria-hidden className="size-3.5" strokeWidth={3} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
