import type { finderRecommendation } from "@/content/copy/finder";
import { fill } from "@/content/copy/schema";
import type { Filtration, RentalPlan, RentalPrices } from "@/content/pricing";

/** The brief's "Find My Solution" logic (Doc 1 §14, sales funnel). */
export type Region = "western" | "other";
export type WaterSource = "city" | "well" | "other";
export type Need = "home" | "office" | "commercial";

/** The purifier recommended for each kind of space. */
export type FinderPicks = Record<Need, { slug: string; name: string }>;

/** The rental plan each purification leads to: its name and its shown from-price a month (null while hidden). */
export type FinderPlans = Record<Filtration, { name: string; from: number | null }>;

/** The headline and reason sentences (content/copy/finder.ts), passed in so this stays usable in the browser. */
export type RecommendationWords = typeof finderRecommendation.defaults;

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

/** The recommendations as designed, used for a space whose picked purifier isn't in the published catalogue. */
const designedPicks: FinderPicks = {
  home: { slug: "aquaelite-3x", name: "AquaElite 3X" },
  office: { slug: "aquaelite-3x", name: "AquaElite 3X" },
  commercial: { slug: "aquaprime-pro", name: "AquaPrime Pro" },
};

/**
 * The purifiers the admin picked for each space (getPicks().finder), named as the catalogue names them. A pick that
 * isn't published falls back to the designed one, by its catalogue name while that one is published.
 */
export function finderPicks(picks: Record<Need, string>, products: { slug: string; name: string }[]): FinderPicks {
  const resolve = (need: Need) => {
    const product = products.find((item) => item.slug === picks[need]) ?? products.find((item) => item.slug === designedPicks[need].slug);
    return product ? { slug: product.slug, name: product.name } : designedPicks[need];
  };
  return { home: resolve("home"), office: resolve("office"), commercial: resolve("commercial") };
}

/** The UF and RO rental plans' names (getRentalPlans) and their switched-on from-prices (getRentalPrices). */
export function finderPlans(plans: RentalPlan[], prices: RentalPrices): FinderPlans {
  const plan = (filtration: Filtration) => {
    const found = plans.find((item) => item.filtration === filtration)!;
    return { name: found.name, from: prices.plans[found.id] ?? null };
  };
  return { UF: plan("UF"), RO: plan("RO") };
}

export function recommend(
  { region, source, need }: { region: Region; source: WaterSource; need: Need },
  { picks, plans, words }: { picks: FinderPicks; plans: FinderPlans; words: RecommendationWords },
): Recommendation {
  const filtration: Filtration = source === "city" ? "UF" : "RO";
  const plan = plans[filtration].name;
  const path = need === "home" ? "buy" : need === "office" ? "rent" : "corporate";
  const { slug: productSlug, name: productName } = picks[need];

  const reasons = [
    source === "city" ? words.cityWater : source === "well" ? words.wellWater : words.otherWater,
    path === "buy" ? words.home : path === "rent" ? words.office : words.commercial,
  ];

  if (region === "other" && path !== "buy") {
    reasons.push(words.regional);
  }

  return {
    path,
    filtration,
    plan,
    productSlug,
    productName,
    headline: fill(words.headline, { product: productName, plan }),
    reasons,
    waterCheck: source === "other",
  };
}
