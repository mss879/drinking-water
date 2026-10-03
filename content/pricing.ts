/**
 * Rental pricing — the single source of truth for the LUSAKO commercial team.
 * All amounts are LKR, exclusive of VAT. Change values here and every page, card
 * and calculator updates; no redesign needed. Each product's own buy and rental
 * prices live with the product (content/products.ts).
 *
 * Region never changes the base rental: it only adds the Regional Hydration Service
 * line for non-Western provinces, which is always shown separately (brief §7).
 */
import { formatLKR } from "@/lib/format";

export type Filtration = "UF" | "RO";
export type CustomerType = "home" | "office" | "company";

export const provinces = [
  { id: "western", label: "Western Province" },
  { id: "central", label: "Central Province" },
  { id: "southern", label: "Southern Province" },
  { id: "northern", label: "Northern Province" },
  { id: "eastern", label: "Eastern Province" },
  { id: "north-western", label: "North Western Province" },
  { id: "north-central", label: "North Central Province" },
  { id: "uva", label: "Uva Province" },
  { id: "sabaragamuwa", label: "Sabaragamuwa Province" },
] as const;

export type ProvinceId = (typeof provinces)[number]["id"];

export const isWestern = (province: ProvinceId) => province === "western";

export const rentalCharges = {
  /** One-time, per rented unit, payable only in the first month. */
  initialPaymentPerUnit: 6000,
  /**
   * Regional Hydration Service, monthly per unit, non-Western provinces only.
   * TODO(client): set the confirmed amount. While null, the line is still shown,
   * with "confirmed in your quote" instead of a number.
   */
  regionalServiceMonthlyPerUnit: null as number | null,
  regionalServiceByProvince: {} as Partial<Record<ProvinceId, number>>,
};

export type RentalPlan = {
  id: "pureflow-uf" | "pureflow-ro" | "aquaspark";
  name: string;
  filtration: Filtration | "UF + Sparkling";
  stages: string;
  bestFor: string;
  description: string;
  fromMonthly: number | null;
};

export const rentalPlans: RentalPlan[] = [
  {
    id: "pureflow-uf",
    name: "PureFlow UF",
    filtration: "UF",
    stages: "4-Stage UF",
    bestFor: "For treated city water",
    description: "Ultrafiltration for treated city (mains) water.",
    fromMonthly: 4990,
  },
  {
    id: "pureflow-ro",
    name: "PureFlow RO",
    filtration: "RO",
    stages: "4-Stage RO",
    bestFor: "For city & well water",
    description: "Reverse osmosis for well water and water with higher dissolved solids (TDS).",
    fromMonthly: 5990,
  },
  {
    id: "aquaspark",
    name: "AquaSpark",
    filtration: "UF + Sparkling",
    stages: "UF + Sparkling",
    bestFor: "Premium sparkling hydration",
    description: "Purified sparkling water for workplaces that want a premium experience.",
    fromMonthly: null, // TODO(client)
  },
];

export function planFor(filtration: Filtration) {
  return rentalPlans.find((plan) => plan.filtration === filtration)!;
}

export function regionalServiceCharge(province: ProvinceId) {
  if (isWestern(province)) return undefined; // not applicable
  return rentalCharges.regionalServiceByProvince[province] ?? rentalCharges.regionalServiceMonthlyPerUnit;
}

export type QuoteLine = {
  id: "rental" | "regional" | "initial";
  label: string;
  detail: string;
  amount: number | null;
  kind: "monthly" | "one-time";
};

export type RentalQuote = {
  lines: QuoteLine[];
  /** Recurring monthly total, or null when a monthly line still needs confirming. */
  monthly: number | null;
  /** Everything due in month one (the monthly total plus the initial payment). */
  firstMonth: number | null;
  regional: boolean;
};

export function buildRentalQuote(input: { filtration: Filtration; province: ProvinceId; units: number }): RentalQuote {
  const units = Math.max(1, Math.floor(input.units) || 1);
  const plan = planFor(input.filtration);
  const rental = plan.fromMonthly;
  const lines: QuoteLine[] = [
    {
      id: "rental",
      label: "Monthly rental",
      detail: `${plan.name} · ${units} ${units === 1 ? "unit" : "units"}`,
      amount: rental === null ? null : rental * units,
      kind: "monthly",
    },
  ];

  const regional = !isWestern(input.province);
  if (regional) {
    const charge = regionalServiceCharge(input.province);
    lines.push({
      id: "regional",
      label: "Regional Hydration Service",
      detail: "Technical service, preventive maintenance and regional support outside the Western Province",
      amount: charge == null ? null : charge * units,
      kind: "monthly",
    });
  }

  lines.push({
    id: "initial",
    label: "One-time initial payment",
    detail: `${formatLKR(rentalCharges.initialPaymentPerUnit)} per unit · payable only in the first month`,
    amount: rentalCharges.initialPaymentPerUnit * units,
    kind: "one-time",
  });

  const monthlyLines = lines.filter((line) => line.kind === "monthly");
  const monthly = monthlyLines.every((line) => line.amount !== null)
    ? monthlyLines.reduce((sum, line) => sum + (line.amount ?? 0), 0)
    : null;
  const upfront = lines.filter((line) => line.kind === "one-time").reduce((sum, line) => sum + (line.amount ?? 0), 0);

  return { lines, monthly, firstMonth: monthly === null ? null : monthly + upfront, regional };
}
