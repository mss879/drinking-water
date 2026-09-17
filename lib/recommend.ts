import type { Filtration } from "@/content/pricing";

/** The brief's "Find My Solution" logic (Doc 1 §14, sales funnel). */
export type Region = "western" | "other";
export type WaterSource = "city" | "well" | "other";
export type Need = "home" | "office" | "commercial";

export type Recommendation = {
  path: "buy" | "rent" | "corporate";
  filtration: Filtration;
  plan: string;
  productSlug: string;
  productName: string;
  headline: string;
  reasons: string[];
  waterCheck: boolean;
};

export function recommend({ region, source, need }: { region: Region; source: WaterSource; need: Need }): Recommendation {
  const filtration: Filtration = source === "city" ? "UF" : "RO";
  const plan = `PureFlow ${filtration}`;
  const path = need === "home" ? "buy" : need === "office" ? "rent" : "corporate";
  const productSlug = need === "commercial" ? "aquaprime-pro" : "aquaelite-3x";
  const productName = need === "commercial" ? "AquaPrime Pro" : "AquaElite 3X";

  const reasons = [
    source === "city"
      ? "Treated city water: UF purification is the right match."
      : source === "well"
        ? "Well water often has higher dissolved solids (TDS): RO is recommended."
        : "We’ll confirm with a quick water check. RO covers the widest range of water conditions.",
    path === "buy"
      ? "For homes, owning your system is the best long-term value, backed by warranty and LUSAKO Care."
      : path === "rent"
        ? "For offices, rental removes the upfront investment and the maintenance, for one predictable monthly payment."
        : "For organisations, a Corporate Hydration proposal covers every unit and every site, with one account manager.",
  ];

  if (region === "other" && path !== "buy") {
    reasons.push("Outside the Western Province, the Regional Hydration Service is added as a separate, clearly shown line item.");
  }

  return {
    path,
    filtration,
    plan,
    productSlug,
    productName,
    headline: `LUSAKO ${productName} – ${plan}`,
    reasons,
    waterCheck: source === "other",
  };
}
