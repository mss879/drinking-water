import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Highlight } from "@/components/ui/highlight";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

/** "Should You Buy or Rent?" — the comparison the brief calls a top converting section. */
const rows = [
  { label: "Ownership", buy: "You own the system", rent: "LUSAKO rental" },
  { label: "Upfront investment", buy: "Higher", rent: "Low" },
  { label: "Monthly payment", buy: "No", rent: "Yes" },
  { label: "Installation", buy: "Available", rent: "Included according to plan" },
  { label: "Preventive maintenance", buy: "Service plan available", rent: "Included according to agreement" },
  { label: "Filter replacement", buy: "Customer responsibility / service plan", rent: "Included according to agreement" },
  { label: "Best for", buy: "Long-term ownership", rent: "Hassle-free hydration" },
  { label: "Upgrade", buy: "Customer decision", rent: "Available at renewal, subject to plan" },
];

const modes = [
  { id: "buy", title: "Buy", subtitle: "Own your system", href: "/water-purifiers", cta: "Explore purifiers" },
  { id: "rent", title: "Rent", subtitle: "From a monthly payment", href: "/rental", cta: "Explore rental" },
] as const;

/** Outlined comparison table; the Rent column is the solid deep-blue feature column. */
export function BuyVsRent() {
  return (
    <section id="buy-or-rent" className="py-16 md:py-20 lg:py-28">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Buy or rent?"
          title={
            <>
              Should you <Highlight>buy or rent?</Highlight>
            </>
          }
          description="Both give you better water. The difference is how you pay, and who looks after the system."
        />

        <div className="card-line mt-12 hidden overflow-hidden rounded-card-xl sm:block lg:mt-14">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Buying compared with renting a LUSAKO water purifier</caption>
            <thead>
              <tr>
                <td className="w-[30%] p-6 align-bottom lg:p-8">
                  <span className="label">Compare</span>
                </td>
                <th scope="col" className="p-6 align-top font-normal lg:p-8">
                  <span className="block font-display text-h3 font-bold text-ink">Buy</span>
                  <span className="mt-1 block text-sm text-muted">Own your system</span>
                </th>
                <th scope="col" className="bg-deep p-6 align-top font-normal text-white lg:p-8">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-h3 font-bold">Rent</span>
                    <Pill variant="white">Popular for offices</Pill>
                  </span>
                  <span className="mt-1 block text-sm">From a monthly payment</span>
                </th>
              </tr>
            </thead>
            <tbody data-stagger>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
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
                  <ButtonLink href="/water-purifiers" variant="outline" size="sm" arrow>
                    Explore purifiers
                  </ButtonLink>
                </td>
                <td className="border-t border-white/15 bg-deep px-6 py-6 lg:px-8">
                  <ButtonLink href="/rental" variant="white" size="sm" arrow>
                    Explore rental
                  </ButtonLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-4 sm:hidden">
          {modes.map((mode) => {
            const rent = mode.id === "rent";
            return (
              <div key={mode.id} className={cn("p-6", rent ? "rounded-card bg-deep text-white" : "card-line")}>
                <p className="font-display text-h3 font-bold">{mode.title}</p>
                <p className={cn("text-sm", rent ? "text-white" : "text-muted")}>{mode.subtitle}</p>
                <dl className="mt-5 grid gap-3">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className={cn("flex justify-between gap-4 border-t pt-3 text-sm", rent ? "border-white/20" : "border-line")}
                    >
                      <dt className={rent ? "text-white" : "text-muted"}>{row.label}</dt>
                      <dd className="text-right font-semibold">{row[mode.id]}</dd>
                    </div>
                  ))}
                </dl>
                <ButtonLink href={mode.href} variant={rent ? "white" : "outline"} arrow className="mt-6 w-full">
                  {mode.cta}
                </ButtonLink>
              </div>
            );
          })}
        </div>

        <div data-reveal="up" className="mt-12 flex flex-col items-center gap-5 text-center">
          <p className="font-display text-2xl font-semibold text-ink">Not sure which is right for you?</p>
          <ButtonLink href="/find-my-solution" size="lg" arrow>
            Help me choose
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
