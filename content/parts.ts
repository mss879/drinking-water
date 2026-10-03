import type { BrandIconName } from "./brand-icons";

/**
 * Filters, parts & accessories (client: "Filters, Parts & Accessories"). The three groups are fixed; the items in them
 * are the defaults until the admin's Parts section changes them. The filters, their standard prices and typical
 * lifespans are LUSAKO's own (AMC proposal and filter sheet, October 2026).
 * TODO(client): confirm the spare parts and accessories range, and add photos.
 */
export type PartCategory = "filters" | "spare-parts" | "accessories";

export const partCategories: { id: PartCategory; title: string; short: string; body: string; icon: BrandIconName }[] = [
  {
    id: "filters",
    title: "Water filter cartridges",
    short: "Filter cartridges",
    body: "Genuine cartridges and membranes that keep your water at its best.",
    icon: "filter",
  },
  {
    id: "spare-parts",
    title: "Water purifier spare parts",
    short: "Spare parts",
    body: "Genuine components for fast, reliable repairs, fitted by LUSAKO technicians.",
    icon: "gear",
  },
  {
    id: "accessories",
    title: "Water purifier accessories",
    short: "Accessories",
    body: "Taps, fittings and add-ons for installation and everyday use.",
    icon: "package",
  },
];

export type Part = {
  id: string;
  category: PartCategory;
  name: string;
  description: string;
  /** A path under /public or an uploaded image's address. */
  image: string | null;
  /** Standard price in LKR, excluding applicable taxes; null shows "Ask for a price". */
  price: number | null;
  /** Typical life in months (filters); intervals vary with water quality, usage and operating conditions. */
  life: number | null;
};

export const parts: Part[] = [
  { id: "pp-sediment", category: "filters", name: "PP / Sediment filter", description: "The first stage: captures sand, rust and silt before they reach the finer stages.", image: null, price: 2850, life: 10 },
  { id: "cto-pre-carbon", category: "filters", name: "CTO / Pre-carbon filter", description: "A carbon block that reduces chlorine, taste and odour, and protects the membrane.", image: null, price: 3600, life: 12 },
  { id: "t33-post-carbon", category: "filters", name: "T33 / Post-carbon filter", description: "The final polishing stage, for fresh-tasting water at the tap.", image: null, price: 3600, life: 18 },
  { id: "uf-filter", category: "filters", name: "UF filter", description: "The ultrafiltration membrane in UF purifiers.", image: null, price: 8990, life: 30 },
  { id: "ro-filter", category: "filters", name: "RO filter", description: "The reverse osmosis membrane in RO purifiers.", image: null, price: 16950, life: 24 },
  { id: "mineral-filter", category: "filters", name: "Mineral filter", description: "Adds minerals back for a rounded taste.", image: null, price: 4400, life: 12 },
  { id: "pumps", category: "spare-parts", name: "Water purifier pumps", description: "Booster and pressure pumps for RO systems.", image: null, price: null, life: null },
  { id: "pressure-switches", category: "spare-parts", name: "Pressure switches", description: "Start and stop the system at the right pressure.", image: null, price: null, life: null },
  { id: "solenoid-valves", category: "spare-parts", name: "Solenoid valves", description: "Control the flow of water through the system.", image: null, price: null, life: null },
  { id: "storage-tanks", category: "spare-parts", name: "Storage tanks", description: "Hold purified water ready to dispense.", image: null, price: null, life: null },
  { id: "electrical", category: "spare-parts", name: "Electrical components", description: "Boards, sensors and wiring for LUSAKO systems.", image: null, price: null, life: null },
  { id: "faucets", category: "accessories", name: "Faucets & taps", description: "Dispensing taps for countertop and under-sink systems.", image: null, price: null, life: null },
  { id: "connectors", category: "accessories", name: "Connectors & fittings", description: "Tubing, connectors and installation kits.", image: null, price: null, life: null },
  { id: "pre-filter-housing", category: "accessories", name: "Pre-filter housings", description: "Extra protection where the supply carries more sediment.", image: null, price: null, life: null },
];
