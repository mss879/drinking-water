import type { BrandIconName } from "./brand-icons";

/**
 * Functional water solutions (client: "Functional Water Solutions"). Worded as plain descriptions, without health
 * claims. TODO(client): confirm which hydrogen and alkaline systems LUSAKO offers, so each can link to its product.
 */
export type FunctionalWater = {
  id: "sparkling" | "hydrogen" | "alkaline" | "other";
  name: string;
  short: string;
  body: string;
  points: string[];
  icon: BrandIconName;
  /** A product page for it, when one exists. */
  productSlug?: string;
};

export const functionalWaters: FunctionalWater[] = [
  {
    id: "sparkling",
    name: "Sparkling water",
    short: "Chilled, carbonated purified water on tap.",
    body: "Crisp sparkling water at the touch of a button, purified and carbonated as it pours. No cans, no bottles, no storage.",
    points: ["Still or sparkling from one system", "Purified before it’s carbonated", "Ideal for homes, executive floors and hospitality"],
    icon: "sparkling",
    productSlug: "aquaspark-elite",
  },
  {
    id: "hydrogen",
    name: "Hydrogen water",
    short: "Purified water enriched with molecular hydrogen.",
    body: "Purified water infused with dissolved hydrogen (H₂), made fresh at the point of use for homes and offices that want something more than plain water.",
    points: ["Made fresh as you pour", "Starts with purified water", "Our team recommends the right system"],
    icon: "flask",
  },
  {
    id: "alkaline",
    name: "Alkaline water",
    short: "Purified water with a higher pH and added minerals.",
    body: "Purified water raised to a higher pH, with minerals added back for a smooth, rounded taste.",
    points: ["Higher pH, mineral-rich", "A smooth, rounded taste", "Built on UF or RO purification"],
    icon: "drop",
  },
  {
    id: "other",
    name: "Other functional water",
    short: "Mineralised, hot, cold or ambient, tailored to you.",
    body: "Mineral-enriched water and hot, cold and ambient options. Tell us what your space needs and we’ll recommend the right functional water solution.",
    points: ["Mineral-enriched options", "Hot, cold and ambient", "Matched to how your people drink"],
    icon: "glass",
  },
];
