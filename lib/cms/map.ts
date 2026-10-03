import { amcPlanIds, defaultAmc, type AmcPlanTerms, type AmcSettings } from "@/content/amc";
import type { ClientLogo } from "@/content/clients";
import { photoKeys, photos as defaultPhotos, type Photos } from "@/content/images";
import type { Part } from "@/content/parts";
import { isProductType, type Product, type ProductVariant } from "@/content/products";
import { defaultSettings, socialNetworks, type SiteContact, type SocialLink, type SocialNetwork } from "@/content/site";
import { isSiteImage } from "@/lib/cms/media";
import type { ClientLogoRow, Json, PartRow, ProductRow } from "@/lib/supabase/types";

/**
 * Turns what the admin saved into what the website shows. Everything is read defensively: a malformed entry is
 * dropped or replaced by the default, never shown half-broken.
 */

/** Shown when a product has no photo yet. */
export const PRODUCT_PLACEHOLDER = "/brand/lusako-mark.svg";

type Obj = Record<string, unknown>;
const isObj = (value: unknown): value is Obj => Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const cleanText = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** A positive whole amount in LKR, or null ("on request"). Accepts "85,000" as typed in the admin. */
export function cleanAmount(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(/[,\s]/g, "")) : NaN;
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
}

/** A whole number within limits (typed values may carry commas), or null. */
export function cleanWhole(value: unknown, min: number, max: number): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value.replace(/[,\s]/g, "")) : NaN;
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

export function parseVariants(value: Json | unknown): ProductVariant[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ProductVariant[] => {
    if (!isObj(item) || (item.filtration !== "UF" && item.filtration !== "RO")) return [];
    const filtration = item.filtration;
    return [
      {
        filtration,
        label: cleanText(item.label, 40) || `4-Stage ${filtration}`,
        code: cleanText(item.code, 40) || null,
        price: cleanAmount(item.price),
        rent: cleanAmount(item.rent),
      },
    ];
  });
}

export function parseCards(value: Json | unknown): { title: string; body: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const title = cleanText(item.title, 80);
    const body = cleanText(item.body, 300);
    return title ? [{ title, body }] : [];
  });
}

export function cleanList(value: unknown, max: number, limit = 12): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, max)).filter(Boolean).slice(0, limit);
}

export function productFromRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    family: row.family,
    tagline: row.tagline,
    types: row.types.filter(isProductType),
    variants: parseVariants(row.variants),
    purification: row.purification,
    temperatures: row.temperatures,
    installation: row.installation,
    warranty: row.warranty,
    image: row.image_url && isSiteImage(row.image_url) ? row.image_url : PRODUCT_PLACEHOLDER,
    summary: row.summary,
    highlights: row.highlights,
    features: parseCards(row.features),
    whoFor: parseCards(row.who_for),
    filtrationNote: row.filtration_note,
    installationNote: row.installation_note,
    ...(row.maintenance_note ? { maintenanceNote: row.maintenance_note } : {}),
    updatedAt: row.updated_at,
  };
}

export function partFromRow(row: PartRow): Part {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    image: row.image_url && isSiteImage(row.image_url) ? row.image_url : null,
    price: cleanAmount(row.price),
    life: cleanWhole(row.life_months, 1, 120),
  };
}

export function logoFromRow(row: ClientLogoRow): ClientLogo | null {
  if (!isSiteImage(row.image_url)) return null;
  return { id: row.id, name: row.name, src: row.image_url, url: row.website_url && /^https?:\/\//.test(row.website_url) ? row.website_url : null };
}

/** Saved contact details over the defaults, field by field. */
export function contactFrom(value: Json | undefined): SiteContact {
  const base = defaultSettings.contact;
  if (!isObj(value)) return base;
  const text = (key: keyof Omit<SiteContact, "phones">, max: number) => (typeof value[key] === "string" ? cleanText(value[key], max) : base[key]);
  return {
    phones: Array.isArray(value.phones) ? cleanList(value.phones, 30, 4) : base.phones,
    hotline: text("hotline", 30),
    whatsappSales: text("whatsappSales", 30),
    whatsappEmergency: text("whatsappEmergency", 30),
    salesEmail: text("salesEmail", 120),
    operationsEmail: text("operationsEmail", 120),
    hours: text("hours", 120),
    address: text("address", 300),
  };
}

export function socialFrom(value: Json | undefined): SocialLink[] {
  if (!Array.isArray(value)) return defaultSettings.social;
  return value.flatMap((item): SocialLink[] => {
    if (!isObj(item) || !socialNetworks.includes(item.network as SocialNetwork)) return [];
    const url = cleanText(item.url, 300);
    return /^https:\/\/[^\s]+$/.test(url) ? [{ network: item.network as SocialNetwork, url }] : [];
  });
}

/** Limits on what the admin can save for an AMC plan; amcFrom and the save action share them. */
export const amcLimits = {
  monthly: [1, 100_000],
  visits: [0, 12],
  sanitations: [0, 12],
  filterDiscount: [0, 90],
  partsDiscount: [0, 90],
  fee: [1, 1_000_000],
} as const;

/** Saved AMC prices over the defaults, plan by plan and field by field. */
export function amcFrom(value: Json | undefined): AmcSettings {
  if (!isObj(value)) return defaultAmc;
  const savedPlans = isObj(value.plans) ? value.plans : {};
  const savedFees = isObj(value.fees) ? value.fees : {};
  const numeric = ["monthly", "visits", "sanitations", "filterDiscount", "partsDiscount"] as const;
  return {
    plans: amcPlanIds.map((id) => {
      const base = defaultAmc.plans.find((plan) => plan.id === id)!;
      const saved = isObj(savedPlans[id]) ? savedPlans[id] : {};
      const terms: Partial<AmcPlanTerms> = {};
      for (const key of numeric) {
        const [min, max] = amcLimits[key];
        terms[key] = cleanWhole(saved[key], min, max) ?? base[key];
      }
      return { ...base, ...terms, priority: typeof saved.priority === "boolean" ? saved.priority : base.priority };
    }),
    fees: {
      visit: cleanWhole(savedFees.visit, ...amcLimits.fee) ?? defaultAmc.fees.visit,
      sanitation: cleanWhole(savedFees.sanitation, ...amcLimits.fee) ?? defaultAmc.fees.sanitation,
    },
  };
}

/** Replacement photos over the defaults; a slot only changes when its saved image is a valid one. */
export function photosFrom(value: Json | undefined): Photos {
  if (!isObj(value)) return defaultPhotos;
  const result = { ...defaultPhotos };
  for (const key of photoKeys) {
    const saved = value[key];
    if (isObj(saved) && isSiteImage(saved.src)) {
      result[key] = { src: saved.src, alt: cleanText(saved.alt, 200) || defaultPhotos[key].alt };
    }
  }
  return result;
}
