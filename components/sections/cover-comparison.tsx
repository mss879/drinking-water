import { CompareCell } from "@/components/sections/compare-cell";
import { coverColumns, coverFootnote, coverRows, type AmcSettings, type CoverId } from "@/content/amc";
import { cn } from "@/lib/cn";

/** The column the eye should land on. */
const featured: CoverId = "amc";

/**
 * Warranty | Rental | AMC plans | On-call (client: "Comparison table"): how each kind of cover looks after a purifier.
 * Large screens get the table, smaller screens one card per kind of cover.
 */
export function CoverComparison({ amc, className }: { amc: AmcSettings; className?: string }) {
  const rows = coverRows(amc);
  return (
    <div className={className}>
      <div className="card-line hidden overflow-hidden rounded-card-xl lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">What the warranty, rental, the AMC plans and on-call service each include</caption>
          <colgroup>
            <col className="w-[24%]" />
            {coverColumns.map((column) => (
              <col key={column.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td className="p-6 align-bottom">
                <span className="label">Compare cover</span>
              </td>
              {coverColumns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn("p-5 align-top font-normal", column.id === featured ? "bg-deep text-white" : "text-ink")}
                >
                  <span className="block font-display text-lg leading-tight font-bold">{column.name}</span>
                  <span className={cn("mt-1 block text-[13px] leading-snug", column.id === featured ? "text-white/85" : "text-muted")}>
                    {column.detail}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-stagger>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th scope="row" className="px-6 py-4 text-[15px] font-medium text-muted">
                  {row.label}
                </th>
                {coverColumns.map((column) => (
                  <td
                    key={column.id}
                    className={cn("px-5 py-4 align-middle", column.id === featured ? "border-t border-white/15 bg-deep text-white" : "text-ink")}
                  >
                    <CompareCell value={row.cells[column.id]} dark={column.id === featured} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {coverColumns.map((column) => {
          const dark = column.id === featured;
          return (
            <li key={column.id} className={cn("p-6", dark ? "rounded-card bg-deep text-white" : "card-line")}>
              <h3 className="font-display text-h3 font-bold">{column.name}</h3>
              <p className={cn("text-sm", dark ? "text-white/85" : "text-muted")}>{column.detail}</p>
              <dl className="mt-5 grid gap-3">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className={cn("flex items-center justify-between gap-4 border-t pt-3 text-sm", dark ? "border-white/20" : "border-line")}
                  >
                    <dt className={dark ? "text-white" : "text-muted"}>{row.label}</dt>
                    <dd className="text-right">
                      <CompareCell value={row.cells[column.id]} dark={dark} />
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-sm leading-relaxed text-muted">{coverFootnote}</p>
    </div>
  );
}
