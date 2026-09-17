import { CalendarCheck, Headset, MapPin, Receipt, ShieldCheck, Wrench } from "lucide-react";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import type { BrandIconName } from "@/content/brand-icons";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectors } from "@/content/clients";

const sectorIcons: Record<string, BrandIconName> = {
  "Corporate offices": "office",
  Factories: "factory",
  Hotels: "hotel",
  Schools: "school",
  Hospitals: "hospital",
  "Commercial organisations": "store",
};

const trust = [
  { icon: ShieldCheck, label: "Warranty on purchases" },
  { icon: Wrench, label: "Professional installation" },
  { icon: CalendarCheck, label: "Preventive maintenance" },
  { icon: Headset, label: "Technical support" },
  { icon: Receipt, label: "Transparent rental terms" },
  { icon: MapPin, label: "Contactable local support" },
];

/** Client success / trust. Real logos and stories slot in once LUSAKO approves them (brief §10). */
export function Trust() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Our clients"
              title={
                <>
                  Real installations. <Highlight>Real relationships.</Highlight>
                </>
              }
              description="LUSAKO looks after drinking water for homes, offices and organisations. These are the places we serve every day."
            />
            <ButtonLink href="/clients" variant="outline" arrow className="mt-8">
              Client success stories
            </ButtonLink>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7 lg:self-end">
            {sectors.map((sector) => (
              <li key={sector} className="flex aspect-[4/3] flex-col justify-between rounded-card bg-frost p-5">
                <BrandIcon name={sectorIcons[sector] ?? "office"} size={52} />
                <span className="text-[15px] leading-snug font-medium text-ink">{sector}</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-10 sm:grid-cols-3 lg:grid-cols-6">
          {trust.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-ink">
              <Icon aria-hidden className="size-5 shrink-0 text-brand" strokeWidth={1.5} />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
