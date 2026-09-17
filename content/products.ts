import type { StaticImageData } from "next/image";
import aquaElite3x from "@/public/images/products/aquaelite-3x.webp";
import aquaSparkElite from "@/public/images/products/aquaspark-elite.webp";
import aquaEliteFloorPro from "@/public/images/products/aquaelite-floor-pro.webp";
import aquaPrimePro from "@/public/images/products/aquaprime-pro.webp";
import aquaSignaturePro from "@/public/images/products/aquasignature-pro.webp";
import aquaServePro from "@/public/images/products/aquaserve-pro.webp";
import { rentalFrom } from "./pricing";

/**
 * Product catalogue (brief: Doc 1 §2 + Doc 2 §9). Names are LUSAKO's working names.
 * TODO(client): confirm names, purchase prices, warranty terms and full specifications.
 * Product images are AI-generated stand-ins. Replace them with approved product photography before launch.
 */
export type ProductType = "countertop" | "freestanding" | "sparkling" | "dispenser";

export const productTypes: { id: ProductType; label: string; plural: string }[] = [
  { id: "countertop", label: "Countertop", plural: "Countertop purifiers" },
  { id: "freestanding", label: "Freestanding", plural: "Freestanding purifiers" },
  { id: "sparkling", label: "Sparkling", plural: "Sparkling purifiers" },
  { id: "dispenser", label: "Bottle dispenser", plural: "Bottle water dispensers" },
];

export type Product = {
  slug: string;
  name: string;
  family: string;
  tagline: string;
  /** First entry is the primary category. */
  types: ProductType[];
  models: { code: string; variant: string }[];
  purification: string;
  filtration: ("UF" | "RO")[];
  temperatures: string[];
  installation: string;
  warranty: string;
  /** LKR excluding VAT. null shows "Price on request". */
  purchasePrice: number | null;
  image: StaticImageData;
  summary: string;
  highlights: string[];
  features: { title: string; body: string }[];
  whoFor: { title: string; body: string }[];
  filtrationNote: string;
  installationNote: string;
  /** Overrides the shared maintenance note (bottle dispensers have no filters to replace). */
  maintenanceNote?: string;
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

export const products: Product[] = [
  {
    slug: "aquaelite-3x",
    name: "AquaElite 3X",
    family: "AquaElite",
    tagline: "Premium Countertop Water Purifier",
    types: ["countertop"],
    models: [
      { code: "W2905-3CF", variant: "UF" },
      { code: "W2905-3CR", variant: "RO" },
    ],
    purification: "UF / RO",
    filtration: ["UF", "RO"],
    temperatures: ["Hot", "Normal", "Cold"],
    installation: "Professional installation",
    warranty: WARRANTY,
    purchasePrice: null,
    image: aquaElite3x,
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
    models: [{ code: "W29Q1", variant: "UF + Sparkling" }],
    purification: "UF + Sparkling",
    filtration: ["UF"],
    temperatures: ["Sparkling", "Still"], // TODO(client): confirm dispensing options
    installation: "Professional installation",
    warranty: WARRANTY,
    purchasePrice: null,
    image: aquaSparkElite,
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
    models: [
      { code: "W2905-3F", variant: "UF" },
      { code: "W2905-3R", variant: "RO" },
    ],
    purification: "UF / RO",
    filtration: ["UF", "RO"],
    temperatures: ["Hot", "Normal", "Cold"], // TODO(client)
    installation: "Professional installation",
    warranty: WARRANTY,
    purchasePrice: null,
    image: aquaEliteFloorPro,
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
    models: [
      { code: "W2904-3F", variant: "UF" },
      { code: "W2904-3R", variant: "RO" },
    ],
    purification: "UF / RO",
    filtration: ["UF", "RO"],
    temperatures: ["Hot", "Normal", "Cold"], // TODO(client)
    installation: "Professional installation",
    warranty: WARRANTY,
    purchasePrice: null,
    image: aquaPrimePro,
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
    models: [
      { code: "W2908-3UF", variant: "UF" },
      { code: "W2908-3RO", variant: "RO" },
    ],
    purification: "UF / RO",
    filtration: ["UF", "RO"],
    temperatures: ["Hot", "Normal", "Cold"], // TODO(client)
    installation: "Professional installation",
    warranty: WARRANTY,
    purchasePrice: null,
    image: aquaSignaturePro,
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
  {
    slug: "aquaserve-pro",
    name: "AquaServe Pro",
    family: "AquaServe",
    tagline: "Bottle Water Dispenser",
    types: ["dispenser"],
    models: [], // TODO(client): model number
    purification: "Bottled supply",
    filtration: [],
    temperatures: ["Hot", "Cold"], // TODO(client)
    installation: "No plumbing required",
    warranty: WARRANTY,
    purchasePrice: null,
    image: aquaServePro,
    summary: "A clean, modern dispenser for places that use bottled water, with hot and cold water on tap.",
    highlights: ["No plumbing needed", "Hot & cold", "Bottle dispenser"],
    features: [
      { title: "Works anywhere", body: "No plumbing connection needed. Place it wherever people need water." },
      { title: "Hot and cold on tap", body: "Hot water for tea and cold water for everyone else." },
      { title: "Clean, modern design", body: "A dispenser that looks at home in offices and receptions." },
      { title: "LUSAKO after-sales care", body: "Warranty cover and LUSAKO service support." },
    ],
    whoFor: [
      { title: "Sites without plumbing", body: "Warehouses, sites and temporary spaces." },
      { title: "Events & pop-ups", body: "Easy hydration wherever you set up." },
      { title: "Small offices", body: "A simple option where bottled supply is preferred." },
    ],
    filtrationNote:
      "AquaServe Pro dispenses from standard water bottles, so it needs no water connection. For bottleless purified water, choose a UF or RO purifier.",
    installationNote: "Place it, load a bottle and plug it in. Our team can deliver and set it up for you.",
    maintenanceNote:
      "Keep your dispenser performing with LUSAKO Care: scheduled servicing and technical support through a service plan or Annual Maintenance Contract (AMC).",
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function productRentalFrom(product: Product) {
  return rentalFrom(product.slug);
}

export function productMaintenanceNote(product: Product) {
  return product.maintenanceNote ?? maintenanceNote;
}

export function productTypeLabel(type: ProductType) {
  return productTypes.find((t) => t.id === type)?.label ?? type;
}
