import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { marked } from "@/components/ui/marked";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { sharedBuyVsRent } from "@/content/copy/shared";
import { getCopy } from "@/lib/cms/content";
import { cn } from "@/lib/cn";

/**
 * "Should You Buy or Rent?" — the comparison the brief calls a top converting section. Outlined comparison table;
 * the Rent column is the solid deep-blue feature column. Phones get one card per column instead. Both read the same
 * wording (the shared block, content/copy/shared.ts); the buttons' destinations stay here.
 */
export async function BuyVsRent() {
  const copy = await getCopy(sharedBuyVsRent);
  const { rows } = copy;
  const modes = [
    { id: "buy", title: copy.buyTitle, subtitle: copy.buySubtitle, href: "/water-purifiers", cta: copy.buyButton },
    { id: "rent", title: copy.rentTitle, subtitle: copy.rentSubtitle, href: "/rental", cta: copy.rentButton },
  ] as const;
  const [buy, rent] = modes;

  return (
    <section id="buy-or-rent" className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading align="center" eyebrow={copy.eyebrow} title={marked(copy.title)} description={copy.description} />

        <div className="card-line mt-12 hidden overflow-hidden rounded-card-xl sm:block lg:mt-14">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Buying compared with renting a LUSAKO water purifier</caption>
            <thead>
              <tr>
                <td className="w-[30%] p-6 align-bottom lg:p-8">
                  <span className="label">{copy.compareLabel}</span>
                </td>
                <th scope="col" className="p-6 align-top font-normal lg:p-8">
                  <span className="block font-display text-h3 font-bold text-ink">{buy.title}</span>
                  <span className="mt-1 block text-sm text-muted">{buy.subtitle}</span>
                </th>
                <th scope="col" className="bg-deep p-6 align-top font-normal text-white lg:p-8">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-h3 font-bold">{rent.title}</span>
                    <Pill variant="white">{copy.rentTag}</Pill>
                  </span>
                  <span className="mt-1 block text-sm">{rent.subtitle}</span>
                </th>
              </tr>
            </thead>
            <tbody data-stagger>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-line">
                  <th scope="row" className="px-6 py-4 text-[15px] font-medium text-muted lg:px-8">
                    {row.label}
                  </th>
                  <td className="px-6 py-4 text-[15px] text-ink lg:px-8">{row.buy}</td>
                  <td className="border-t border-white/15 bg-deep px-6 py-4 text-[15px] font-medium text-white lg:px-8">{row.rent}</td>
                </tr>
              ))}
              <tr className="border-t border-line">
                <td />
                <td className="px-6 py-6 lg:px-8">
                  <ButtonLink href={buy.href} variant="outline" size="sm" arrow>
                    {buy.cta}
                  </ButtonLink>
                </td>
                <td className="border-t border-white/15 bg-deep px-6 py-6 lg:px-8">
                  <ButtonLink href={rent.href} variant="white" size="sm" arrow>
                    {rent.cta}
                  </ButtonLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-4 sm:hidden">
          {modes.map((mode) => {
            const isRent = mode.id === "rent";
            return (
              <div key={mode.id} className={cn("p-6", isRent ? "rounded-card bg-deep text-white" : "card-line")}>
                <p className="font-display text-h3 font-bold">{mode.title}</p>
                <p className={cn("text-sm", isRent ? "text-white" : "text-muted")}>{mode.subtitle}</p>
                <dl className="mt-5 grid gap-3">
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className={cn("flex justify-between gap-4 border-t pt-3 text-sm", isRent ? "border-white/20" : "border-line")}
                    >
                      <dt className={isRent ? "text-white" : "text-muted"}>{row.label}</dt>
                      <dd className="text-right font-semibold">{row[mode.id]}</dd>
                    </div>
                  ))}
                </dl>
                <ButtonLink href={mode.href} variant={isRent ? "white" : "outline"} arrow className="mt-6 w-full">
                  {mode.cta}
                </ButtonLink>
              </div>
            );
          })}
        </div>

        <div data-reveal="up" className="mt-12 flex flex-col items-center gap-5 text-center">
          <p className="font-display text-2xl font-semibold text-ink">{copy.closing}</p>
          <ButtonLink href="/find-my-solution" size="lg" arrow>
            {copy.closingButton}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
