import { BrandIcon } from "@/components/ui/brand-icon";
import { Container } from "@/components/ui/container";
import type { BrandIconName } from "@/content/brand-icons";

/** What "without the hassle" means, one complaint per item with its 3D icon. */
const problems: { text: string; icon: BrandIconName }[] = [
  { text: "No more bottled-water deliveries.", icon: "truck" },
  { text: "No heavy bottles.", icon: "nobottle" },
  { text: "No unnecessary storage.", icon: "warehouse" },
  { text: "No maintenance headaches.", icon: "wrench" },
];

/** The four hassles LUSAKO removes, as a quiet strip between the hero film and the rest of the home page. */
export function Problems() {
  return (
    <section className="border-b border-line">
      <Container>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 py-10 lg:grid-cols-4 lg:gap-x-0 lg:py-12">
          {problems.map((problem) => (
            <li
              key={problem.text}
              className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 lg:border-l lg:border-line lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-tint-2">
                <BrandIcon name={problem.icon} size={36} />
              </span>
              <span className="font-display text-[15px] leading-snug font-semibold text-balance text-ink">{problem.text}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
