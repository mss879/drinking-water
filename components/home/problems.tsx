import { BrandIcon } from "@/components/ui/brand-icon";
import { Container } from "@/components/ui/container";
import type { BrandIconName } from "@/content/brand-icons";
import { homeProblems } from "@/content/copy/home";
import { getCopy } from "@/lib/cms/content";

/** What "without the hassle" means: each hassle's 3D icon, by position (their wording is the home.problems block). */
const icons: BrandIconName[] = ["truck", "nobottle", "warehouse", "wrench"];

/** The four hassles LUSAKO removes, as a quiet strip between the hero film and the rest of the home page. */
export async function Problems() {
  const { items } = await getCopy(homeProblems);
  const problems = items.map((text, i) => ({ text, icon: icons[i] }));
  return (
    <section className="border-b border-line">
      <Container>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 py-10 lg:grid-cols-4 lg:gap-x-0 lg:py-12">
          {problems.map((problem) => (
            <li
              key={problem.icon}
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
