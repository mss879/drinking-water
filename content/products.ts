import type { Filtration } from "./pricing";

/**
 * Product catalogue (brief: Doc 1 §2 + Doc 2 §9). Names are LUSAKO's working names.
 * These are the defaults: once the admin's Products section is set up, the catalogue comes from there.
 * TODO(client): confirm names, purchase prices, warranty terms and full specifications.
 * Product images are AI-generated stand-ins. Replace them with approved product photography before launch.
 */
export type ProductType = "countertop" | "freestanding" | "under-sink" | "wall-mount" | "sparkling";

export const productTypes: { id: ProductType; label: string; plural: string }[] = [
  { id: "countertop", label: "Countertop", plural: "Countertop purifiers" },
  { id: "freestanding", label: "Freestanding", plural: "Freestanding purifiers" },
  { id: "under-sink", label: "Under-sink", plural: "Under-sink purifiers" },
  { id: "wall-mount", label: "Wall-mount", plural: "Wall-mount purifiers" },
  { id: "sparkling", label: "Sparkling", plural: "Sparkling purifiers" },
];

export function isProductType(value: unknown): value is ProductType {
  return productTypes.some((type) => type.id === value);
}

/** One purification option of a product, with its own model number and prices (client: "4-Stage UF" / "4-Stage RO"). */
export type ProductVariant = {
  filtration: Filtration;
  /** How the option is named on the site, e.g. "4-Stage UF". */
  label: string;
  code: string | null;
  /** Purchase price in LKR excluding VAT. null shows "Price on request". */
  price: number | null;
  /** Monthly rental from, in LKR excluding VAT. null shows "Rental on request". */
  rent: number | null;
};

export type Product = {
  slug: string;
  name: string;
  family: string;
  tagline: string;
  /** First entry is the primary category. */
  types: ProductType[];
  variants: ProductVariant[];
  /** The purification line shown on cards, e.g. "UF / RO". */
  purification: string;
  temperatures: string[];
  installation: string;
  warranty: string;
  /** A path under /public or an uploaded image's address. */
  image: string;
  summary: string;
  highlights: string[];
  features: { title: string; body: string }[];
  whoFor: { title: string; body: string }[];
  filtrationNote: string;
  installationNote: string;
  /** Overrides the shared maintenance note. */
  maintenanceNote?: string;
  /** When the admin last saved it (CMS products only), for the sitemap. */
  updatedAt?: string;
};

const WARRANTY = "2 years"; // TODO(client): confirm final warranty terms per product.
const INSTALLATION_NOTE =
  "A trained LUSAKO technician connects the system to your existing water supply, sets it up and checks everything is working before handing over.";

export const maintenanceNote =
  "Keep your purifier performing with LUSAKO Care: scheduled preventive maintenance, filter replacement and technical support through a service plan or Annual Maintenance Contract (AMC). Rental systems are maintained by LUSAKO according to your rental agreement.";

const bottleless = { title: "Bottleless by design", body: "No more bottled-water deliveries, heavy bottles or storage space." };
const matched = {
  title: "Matched to your water",
  body: "UF for treated city water, RO for well water and higher TDS. We recommend the right one for you.",
};

/** The usual pair: a 4-stage UF model and a 4-stage RO model. Prices are filled in once LUSAKO confirms them. */
function ufAndRo(uf: string, ro: string, prices: { uf?: number; ro?: number; rentUf?: number; rentRo?: number } = {}): ProductVariant[] {
  return [
    { filtration: "UF", label: "4-Stage UF", code: uf, price: prices.uf ?? null, rent: prices.rentUf ?? null },
    { filtration: "RO", label: "4-Stage RO", code: ro, price: prices.ro ?? null, rent: prices.rentRo ?? null },
  ];
}

export const products: Product[] = [
  {
    slug: "aquaelite-3x",
    name: "AquaElite 3X",
    family: "AquaElite",
    tagline: "Premium Countertop Water Purifier",
    types: ["countertop"],
    variants: ufAndRo("W2905-3CF", "W2905-3CR", { rentUf: 4990, rentRo: 5990 }),
    purification: "UF / RO",
    temperatures: ["Hot", "Normal", "Cold"],
    installation: "Professional installation",
    warranty: WARRANTY,
    image: "/images/products/aquaelite-3x.webp",
    summary:
      "Hot, normal and cold purified water from one compact countertop system, with UF or RO purification matched to your water source.",
    highlights: ["Hot · Normal · Cold", "UF or RO", "Countertop"],
    features: [
      { title: "Three temperatures on tap", body: "Hot, normal and cold purified water from one system, ready whenever you are." },
      matched,
      { title: "Compact countertop design", body: "Made for kitchens, pantries and reception counters where space matters." },
      bottleless,
    ],
    whoFor: [
      { title: "Homes & apartments", body: "Families who want pure water on tap without the bottles." },
      { title: "Small offices", body: "Teams that need hot, normal and cold water from one compact unit." },
      { title: "Reception areas", body: "A clean, quiet hydration point for guests and customers." },
    ],
    filtrationNote:
      "Choose the UF model (W2905-3CF) for treated city water, or the RO model (W2905-3CR) for well water and water with higher dissolved solids.",
    installationNote: INSTALLATION_NOTE,
  },
  {
    slug: "aquaspark-elite",
    name: "AquaSpark Elite",
    family: "AquaSpark",
    tagline: "Premium Sparkling Water Purifier",
    types: ["sparkling", "countertop"],
    variants: [{ filtration: "UF", label: "UF + Sparkling", code: "W29Q1", price: null, rent: null }],
    purification: "UF + Sparkling",
    temperatures: ["Sparkling", "Still"], // TODO(client): confirm dispensing options
    installation: "Professional installation",
    warranty: WARRANTY,
    image: "/images/products/aquaspark-elite.webp",
    summary: "Purified sparkling water at the touch of a button, from a premium countertop system. Hydration without a single bottle or can.",
    highlights: ["Sparkling on tap", "UF purification", "Countertop"],
    features: [
      { title: "Sparkling on demand", body: "Crisp sparkling purified water at the touch of a button, with no bottles or cans." },
      { title: "UF purification built in", body: "Ultrafiltration for treated city water, in the same compact unit." },
      { title: "A premium statement", body: "A design made for kitchens, executive floors and hospitality spaces." },
      bottleless,
    ],
    whoFor: [
      { title: "Homes that love sparkling", body: "Swap cans and bottles for sparkling water on tap." },
      { title: "Executive floors", body: "A premium touch for boardrooms and client areas." },
      { title: "Hospitality", body: "Hotels, cafés and restaurants serving still and sparkling water." },
    ],
    filtrationNote:
      "AquaSpark Elite (W29Q1) combines UF purification with built-in carbonation. UF is best suited to treated city water.",
    installationNote: INSTALLATION_NOTE,
  },
  {
    slug: "aquaelite-floor-pro",
    name: "AquaElite Floor Pro",
    family: "AquaElite",
    tagline: "Freestanding Water Purifier",
    types: ["freestanding"],
    variants: ufAndRo("W2905-3F", "W2905-3R"),
    purification: "UF / RO",
    temperatures: ["Hot", "Normal", "Cold"], // TODO(client)
    installation: "Professional installation",
    warranty: WARRANTY,
    image: "/images/products/aquaelite-floor-pro.webp",
    summary: "The AquaElite experience in a freestanding tower: purified hot, normal and cold water for busy homes and workplaces.",
    highlights: ["Freestanding", "UF or RO", "Hot · Normal · Cold"],
    features: [
      { title: "Freestanding convenience", body: "A floor-standing tower that frees up your counter space." },
      { title: "Three temperatures on tap", body: "Hot, normal and cold purified water for everyone who uses it." },
      matched,
      bottleless,
    ],
    whoFor: [
      { title: "Busy homes", body: "Larger households that drink a lot of water." },
      { title: "Offices & meeting floors", body: "A central hydration point for growing teams." },
      { title: "Clinics & waiting rooms", body: "Clean, reliable water for visitors all day." },
    ],
    filtrationNote:
      "Choose the UF model (W2905-3F) for treated city water, or the RO model (W2905-3R) for well water and water with higher dissolved solids.",
    installationNote: INSTALLATION_NOTE,
  },
  {
    slug: "aquaprime-pro",
    name: "AquaPrime Pro",
    family: "AquaPrime",
    tagline: "Freestanding Office Water Purifier",
    types: ["freestanding"],
    variants: ufAndRo("W2904-3F", "W2904-3R"),
    purification: "UF / RO",
    temperatures: ["Hot", "Normal", "Cold"], // TODO(client)
    installation: "Professional installation",
    warranty: WARRANTY,
    image: "/images/products/aquaprime-pro.webp",
    summary: "A robust freestanding purifier built for everyday shared use, with pure water for whole teams and UF or RO purification.",
    highlights: ["Built for daily use", "UF or RO", "Freestanding"],
    features: [
      { title: "Built for everyday use", body: "A robust freestanding purifier designed for busy shared spaces." },
      matched,
      { title: "Simple for everyone", body: "Straightforward controls that anyone in the building can use." },
      bottleless,
    ],
    whoFor: [
      { title: "Offices & workplaces", body: "Reliable water for teams of every size." },
      { title: "Factories & canteens", body: "A hard-working hydration point for shift teams." },
      { title: "Schools & institutions", body: "Pure water for students, staff and visitors." },
    ],
    filtrationNote:
      "Choose the UF model (W2904-3F) for treated city water, or the RO model (W2904-3R) for well water and water with higher dissolved solids.",
    installationNote: INSTALLATION_NOTE,
  },
  {
    slug: "aquasignature-pro",
    name: "AquaSignature Pro",
    family: "AquaSignature",
    tagline: "Signature Freestanding Water Purifier",
    types: ["freestanding"],
    variants: ufAndRo("W2908-3UF", "W2908-3RO"),
    purification: "UF / RO",
    temperatures: ["Hot", "Normal", "Cold"], // TODO(client)
    installation: "Professional installation",
    warranty: WARRANTY,
    image: "/images/products/aquasignature-pro.webp",
    summary: "Our signature freestanding purifier. A refined design with UF or RO purification, for spaces that make an impression.",
    highlights: ["Signature design", "UF or RO", "Freestanding"],
    features: [
      { title: "Signature design", body: "Refined finishes that belong in premium interiors." },
      matched,
      { title: "A floor-standing presence", body: "A purifier that becomes part of the space, not an afterthought." },
      bottleless,
    ],
    whoFor: [
      { title: "Executive offices", body: "Hydration that matches the standard of the room." },
      { title: "Premium homes", body: "A statement purifier for design-led interiors." },
      { title: "Hotels & showrooms", body: "Pure water where first impressions count." },
    ],
    filtrationNote:
      "Choose the UF model (W2908-3UF) for treated city water, or the RO model (W2908-3RO) for well water and water with higher dissolved solids.",
    installationNote: INSTALLATION_NOTE,
  },
];

export function findProduct(list: Product[], slug: string) {
  return list.find((product) => product.slug === slug);
}

export function productTypeLabel(type: ProductType) {
  return productTypes.find((t) => t.id === type)?.label ?? type;
}

export function productMaintenanceNote(product: Product) {
  return product.maintenanceNote ?? maintenanceNote;
}

/** The purifications a product comes in, e.g. ["UF", "RO"]. */
export function productFiltrations(product: Product): Filtration[] {
  return Array.from(new Set(product.variants.map((variant) => variant.filtration)));
}

const lowest = (values: (number | null)[]) => {
  const known = values.filter((value): value is number => value !== null && value > 0);
  return known.length ? Math.min(...known) : null;
};

/** Lowest purchase price across the product's options, or null while it is on request. */
export function productPriceFrom(product: Product) {
  return lowest(product.variants.map((variant) => variant.price));
}

/** Lowest monthly rental across the product's options, or null while it is on request. */
export function productRentalFrom(product: Product) {
  return lowest(product.variants.map((variant) => variant.rent));
}

/** Model numbers, in order. */
export function productCodes(product: Product) {
  return product.variants.map((variant) => variant.code).filter((code): code is string => Boolean(code));
}
