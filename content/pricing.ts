/**
 * Rental pricing — the single source of truth for the LUSAKO commercial team.
 * All amounts are LKR, exclusive of VAT. Change values here and every page, card
 * and calculator updates; no redesign needed.
 *
 * The matrix supports product × filtration × contract term × region. Region never
 * changes the base rental: it only adds the Regional Hydration Service line for
 * non-Western provinces, which is always shown separately (brief §7).
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
  /** Refundable, domestic (home) rentals only. TODO(client): confirm per unit vs per contract. */
  domesticDepositPerUnit: 25000,
  /**
   * Regional Hydration Service, monthly per unit, non-Western provinces only.
   * TODO(client): set the confirmed amount. While null, the line is still shown,
   * with "confirmed in your quote" instead of a number.
   */
  regionalServiceMonthlyPerUnit: null as number | null,
  regionalServiceByProvince: {} as Partial<Record<ProvinceId, number>>,
};

// TODO(client): add the real contract durations, e.g. { id: "24m", label: "24 months" }.
export const contractTerms = [{ id: "standard", label: "Standard term" }] as const;
export type TermId = (typeof contractTerms)[number]["id"];

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

type RentalPrice = { product: string; filtration: Filtration; term: TermId; monthly: number };

// TODO(client): add a row for every model × filtration × term that can be rented.
export const rentalMatrix: RentalPrice[] = [
  { product: "aquaelite-3x", filtration: "UF", term: "standard", monthly: 4990 },
  { product: "aquaelite-3x", filtration: "RO", term: "standard", monthly: 5990 },
];

export function planFor(filtration: Filtration) {
  return rentalPlans.find((plan) => plan.filtration === filtration)!;
}

/** Monthly rental for a model, or the plan's "from" price when no model is chosen. */
export function monthlyRental(filtration: Filtration, product?: string, term: TermId = "standard") {
  if (!product) return planFor(filtration).fromMonthly;
  return (
    rentalMatrix.find((row) => row.product === product && row.filtration === filtration && row.term === term)
      ?.monthly ?? null
  );
}

/** Lowest monthly rental for a product across filtrations, or null if it isn't priced yet. */
export function rentalFrom(product: string) {
  const prices = rentalMatrix.filter((row) => row.product === product).map((row) => row.monthly);
  return prices.length ? Math.min(...prices) : null;
}

export function regionalServiceCharge(province: ProvinceId) {
  if (isWestern(province)) return undefined; // not applicable
  return rentalCharges.regionalServiceByProvince[province] ?? rentalCharges.regionalServiceMonthlyPerUnit;
}

export type QuoteLine = {
  id: "rental" | "regional" | "initial" | "deposit";
  label: string;
  detail: string;
  amount: number | null;
  kind: "monthly" | "one-time" | "refundable";
};

export type RentalQuote = {
  lines: QuoteLine[];
  /** Recurring monthly total, or null when a monthly line still needs confirming. */
  monthly: number | null;
  /** Everything due in month one (monthly + initial payment + any deposit). */
  firstMonth: number | null;
  regional: boolean;
};

export function buildRentalQuote(input: {
  filtration: Filtration;
  province: ProvinceId;
  customer: CustomerType;
  units: number;
  product?: string;
  term?: TermId;
}): RentalQuote {
  const units = Math.max(1, Math.floor(input.units) || 1);
  const plan = planFor(input.filtration);
  const rental = monthlyRental(input.filtration, input.product, input.term);
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

  if (input.customer === "home") {
    lines.push({
      id: "deposit",
      label: "Refundable security deposit",
      detail: "Domestic rentals · refundable according to your rental agreement",
      amount: rentalCharges.domesticDepositPerUnit * units,
      kind: "refundable",
    });
  }

  const monthlyLines = lines.filter((line) => line.kind === "monthly");
  const monthly = monthlyLines.every((line) => line.amount !== null)
    ? monthlyLines.reduce((sum, line) => sum + (line.amount ?? 0), 0)
    : null;
  const upfront = lines
    .filter((line) => line.kind !== "monthly")
    .reduce((sum, line) => sum + (line.amount ?? 0), 0);

  return { lines, monthly, firstMonth: monthly === null ? null : monthly + upfront, regional };
}
