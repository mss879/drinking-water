import { amcPlanIds, defaultAmc, type AmcPlanTerms, type AmcSettings } from "@/content/amc";
import type { CaseStudy, ClientLogo } from "@/content/clients";
import type { Faq } from "@/content/faqs";
import { photoKeys, photos as defaultPhotos, type Photos } from "@/content/images";
import type { Part } from "@/content/parts";
import { defaultPricing, provinces, rentalPlans, type Filtration, type PricingSettings, type ProvinceId, type RentalPrices } from "@/content/pricing";
import { defaultPicks, isProductType, type Picks, type Product, type ProductVariant } from "@/content/products";
import { defaultSettings, socialNetworks, type SiteContact, type SocialLink, type SocialNetwork } from "@/content/site";
import { isSiteImage } from "@/lib/cms/media";
import type { CaseStudyRow, ClientLogoRow, FaqRow, Json, PartRow, PriceRow, ProductRow } from "@/lib/supabase/types";

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

/** Extra specification rows: [{ label, value }]. */
export function parseSpecs(value: Json | unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      if (!isObj(item)) return [];
      const label = cleanText(item.label, 40);
      const text = cleanText(item.value, 200);
      return label && text ? [{ label, value: text }] : [];
    })
    .slice(0, 10);
}

/** Extra questions: [{ q, a }]. */
export function parseQuestions(value: Json | unknown): { q: string; a: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      if (!isObj(item)) return [];
      const q = cleanText(item.q, 200);
      const a = cleanText(item.a, 1200);
      return q && a ? [{ q, a }] : [];
    })
    .slice(0, 6);
}

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
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
    specs: parseSpecs(row.specs),
    faqs: parseQuestions(row.faqs),
    seoTitle: cleanText(row.seo_title, 70) || null,
    seoDescription: cleanText(row.seo_description, 170) || null,
  };
}

// ------------------------------------------------------------------ prices --

/** The prices the website may show, grouped: per product option, the rental amounts and the AMC on-call fee. */
export type ShownPrices = {
  products: Map<string, { buy: Partial<Record<Filtration, number>>; rent: Partial<Record<Filtration, number>> }>;
  rental: RentalPrices;
  onCallFee: number | null;
};

const PRODUCT_ITEM = /^(buy|rent)-(uf|ro)$/;
const REGIONAL_ITEM = /^rental-regional-([a-z-]+)$/;
const PLAN_ITEM = /^rental-plan-([a-z-]+)$/;

/** Reads price rows into what the website shows. Only rows that are switched on and have an amount count. */
export function pricesFrom(rows: Pick<PriceRow, "product_id" | "item" | "amount" | "visible">[]): ShownPrices {
  const shown: ShownPrices = { products: new Map(), rental: { plans: {}, initial: null, regional: null, regionalByProvince: {} }, onCallFee: null };
  for (const row of rows) {
    const amount = cleanAmount(row.amount);
    if (!row.visible || amount === null) continue;
    const product = PRODUCT_ITEM.exec(row.item);
    if (product && row.product_id) {
      const entry = shown.products.get(row.product_id) ?? { buy: {}, rent: {} };
      entry[product[1] as "buy" | "rent"][product[2].toUpperCase() as Filtration] = amount;
      shown.products.set(row.product_id, entry);
      continue;
    }
    if (row.product_id) continue;
    const plan = PLAN_ITEM.exec(row.item)?.[1];
    const regional = REGIONAL_ITEM.exec(row.item)?.[1];
    if (plan && rentalPlans.some((p) => p.id === plan)) shown.rental.plans[plan as keyof RentalPrices["plans"]] = amount;
    else if (row.item === "rental-initial") shown.rental.initial = amount;
    else if (row.item === "rental-regional") shown.rental.regional = amount;
    else if (regional && provinces.some((p) => p.id === regional)) shown.rental.regionalByProvince[regional as ProvinceId] = amount;
    else if (row.item === "oncall-fee") shown.onCallFee = amount;
  }
  return shown;
}

/** A product with its shown buy and rent-from prices on each option (none for the built-in catalogue). */
export function withShownPrices(product: Product, prices: ShownPrices): Product {
  const entry = product.id ? prices.products.get(product.id) : undefined;
  if (!entry) return product;
  return {
    ...product,
    variants: product.variants.map((variant) => ({ ...variant, price: entry.buy[variant.filtration] ?? null, rent: entry.rent[variant.filtration] ?? null })),
  };
}

export function pricingFrom(value: Json | undefined): PricingSettings {
  if (!isObj(value)) return defaultPricing;
  return {
    koko: typeof value.koko === "boolean" ? value.koko : defaultPricing.koko,
    showOnHome: typeof value.showOnHome === "boolean" ? value.showOnHome : defaultPricing.showOnHome,
  };
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const slugOr = (value: unknown, fallback: string) => (typeof value === "string" && SLUG.test(value) ? value : fallback);

export function picksFrom(value: Json | undefined): Picks {
  if (!isObj(value)) return defaultPicks;
  const finder = isObj(value.finder) ? value.finder : {};
  return {
    finder: {
      home: slugOr(finder.home, defaultPicks.finder.home),
      office: slugOr(finder.office, defaultPicks.finder.office),
      commercial: slugOr(finder.commercial, defaultPicks.finder.commercial),
    },
    homeBuyCard: typeof value.homeBuyCard === "string" && SLUG.test(value.homeBuyCard) ? value.homeBuyCard : null,
  };
}

// ------------------------------------------------------------ faqs, stories --

export function faqFromRow(row: FaqRow): Faq {
  return {
    q: row.question,
    a: row.answer,
    topic: row.topic,
    ...(row.on_home ? { home: true } : {}),
    ...(row.on_corporate ? { corporate: true } : {}),
    ...(row.key ? { key: row.key } : {}),
  };
}

export function caseStudyFromRow(row: CaseStudyRow): CaseStudy {
  return {
    slug: row.slug,
    sample: row.sample,
    industry: row.industry,
    location: row.location,
    ...(row.model ? { model: row.model } : {}),
    challenge: row.challenge,
    requirement: row.requirement,
    solution: row.solution,
    implementation: row.implementation,
    support: row.support,
    result: row.result,
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
  const text = (key: keyof Omit<SiteContact, "phones" | "showWhatsappButton">, max: number) =>
    typeof value[key] === "string" ? cleanText(value[key], max) : base[key];
  return {
    phones: Array.isArray(value.phones) ? cleanList(value.phones, 30, 4) : base.phones,
    hotline: text("hotline", 30),
    whatsappSales: text("whatsappSales", 30),
    whatsappEmergency: text("whatsappEmergency", 30),
    salesEmail: text("salesEmail", 120),
    operationsEmail: text("operationsEmail", 120),
    hours: text("hours", 120),
    address: text("address", 300),
    whatsappGreeting: text("whatsappGreeting", 300),
    showWhatsappButton: typeof value.showWhatsappButton === "boolean" ? value.showWhatsappButton : base.showWhatsappButton,
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
