/**
 * Rental terms and the website's price switches. Every amount (plan from-prices, the initial payment, the Regional
 * Hydration Service) is set in the admin's Prices & quotes section with its own show switch, and starts hidden
 * (client, October 2026: "Remove prices & add Get a quote for buy and rent both"). While an amount is hidden the
 * website explains how a rental is charged and the quote confirms it.
 *
 * Region never changes the base rental: it only adds the Regional Hydration Service line for non-Western provinces,
 * which is always listed separately (brief §7).
 */
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

export type RentalPlan = {
  id: "pureflow-uf" | "pureflow-ro" | "aquaspark";
  name: string;
  filtration: Filtration | "UF + Sparkling";
  stages: string;
  bestFor: string;
  description: string;
};

export const rentalPlans: RentalPlan[] = [
  {
    id: "pureflow-uf",
    name: "PureFlow UF",
    filtration: "UF",
    stages: "4-Stage UF",
    bestFor: "For treated city water",
    description: "Ultrafiltration for treated city (mains) water.",
  },
  {
    id: "pureflow-ro",
    name: "PureFlow RO",
    filtration: "RO",
    stages: "4-Stage RO",
    bestFor: "For city & well water",
    description: "Reverse osmosis for well water and water with higher dissolved solids (TDS).",
  },
  {
    id: "aquaspark",
    name: "AquaSpark",
    filtration: "UF + Sparkling",
    stages: "UF + Sparkling",
    bestFor: "Premium sparkling hydration",
    description: "Purified sparkling water for workplaces that want a premium experience.",
  },
];

export function planFor(filtration: Filtration) {
  return rentalPlans.find((plan) => plan.filtration === filtration)!;
}

/** The rental amounts the admin has switched on (LKR, excluding VAT). Anything hidden is missing. */
export type RentalPrices = {
  plans: Partial<Record<RentalPlan["id"], number>>;
  /** One-time, per rented unit, payable only in the first month. */
  initial: number | null;
  /** Regional Hydration Service, monthly per unit, outside the Western Province. */
  regional: number | null;
  /** A different Regional Hydration Service charge for some provinces. */
  regionalByProvince: Partial<Record<ProvinceId, number>>;
};

export const noRentalPrices: RentalPrices = { plans: {}, initial: null, regional: null, regionalByProvince: {} };

/** The website's price switches that aren't tied to one amount (cms_settings "pricing"). */
export type PricingSettings = {
  /** KOKO's “Pay in instalments” badge on the product pages' Buy option. */
  koko: boolean;
  /** Shown prices also appear on the home page's product cards (it never showed prices before). */
  showOnHome: boolean;
};

export const defaultPricing: PricingSettings = { koko: true, showOnHome: false };

/** The Regional Hydration Service for a province: nothing in the Western Province, else its own or the usual charge. */
export function regionalCharge(prices: RentalPrices, province: ProvinceId) {
  if (isWestern(province)) return undefined;
  return prices.regionalByProvince[province] ?? prices.regional;
}

export type QuoteLine = {
  id: "rental" | "regional" | "initial";
  label: string;
  detail: string;
  kind: "monthly" | "one-time";
  /** The line's total when its amount is shown, else null ("confirmed in your quote"). */
  amount: number | null;
};

export type RentalQuote = {
  lines: QuoteLine[];
  /** Recurring monthly total, or null while a monthly line has no shown amount. */
  monthly: number | null;
  /** Everything due in month one (the monthly total plus the initial payment), or null while any amount is hidden. */
  firstMonth: number | null;
};

/** The lines a rental quote carries for this machine, province and number of units, with whatever amounts are shown. */
export function buildRentalQuote(input: { filtration: Filtration; province: ProvinceId; units: number }, prices: RentalPrices = noRentalPrices): RentalQuote {
  const units = Math.max(1, Math.floor(input.units) || 1);
  const plan = planFor(input.filtration);
  const times = (amount: number | null | undefined) => (typeof amount === "number" ? amount * units : null);
  const lines: QuoteLine[] = [
    {
      id: "rental",
      label: "Monthly rental",
      detail: `${plan.name} · ${units} ${units === 1 ? "unit" : "units"}`,
      kind: "monthly",
      amount: times(prices.plans[plan.id]),
    },
  ];
  if (!isWestern(input.province)) {
    lines.push({
      id: "regional",
      label: "Regional Hydration Service",
      detail: "Technical service, preventive maintenance and regional support outside the Western Province",
      kind: "monthly",
      amount: times(regionalCharge(prices, input.province)),
    });
  }
  lines.push({
    id: "initial",
    label: "One-time initial payment",
    detail: "Per unit, payable only in the first month",
    kind: "one-time",
    amount: times(prices.initial),
  });

  const monthlyLines = lines.filter((line) => line.kind === "monthly");
  const monthly = monthlyLines.every((line) => line.amount !== null) ? monthlyLines.reduce((sum, line) => sum + (line.amount ?? 0), 0) : null;
  const upfront = lines.find((line) => line.id === "initial")?.amount ?? null;
  return { lines, monthly, firstMonth: monthly === null || upfront === null ? null : monthly + upfront };
}
