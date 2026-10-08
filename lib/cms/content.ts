import "server-only";
import { cache } from "react";
import { defaultAmc, type AmcSettings } from "@/content/amc";
import { caseStudies as defaultCaseStudies, clientLogos as defaultLogos, type CaseStudy, type ClientLogo } from "@/content/clients";
import { amcPlansCopy } from "@/content/copy/amc";
import { rentalPlansCopy } from "@/content/copy/rental";
import { sharedFunctionalWater, sharedHowItWorks, sharedServices } from "@/content/copy/shared";
import { copyFrom, type CopyData, type Block } from "@/content/copy/schema";
import { faqs as defaultFaqs, type Faq } from "@/content/faqs";
import { functionalWaters, type FunctionalWater } from "@/content/functional-water";
import { photos as defaultPhotos, type Photos } from "@/content/images";
import { parts as defaultParts, type Part } from "@/content/parts";
import { rentalPlans, type PricingSettings, type RentalPlan, type RentalPrices } from "@/content/pricing";
import { products as defaultProducts, type Picks, type Product } from "@/content/products";
import { services, type Service } from "@/content/services";
import { defaultSettings, type SiteSettings } from "@/content/site";
import {
  amcFrom,
  caseStudyFromRow,
  contactFrom,
  faqFromRow,
  logoFromRow,
  partFromRow,
  photosFrom,
  picksFrom,
  pricesFrom,
  pricingFrom,
  productFromRow,
  socialFrom,
  withShownPrices,
  type ShownPrices,
} from "@/lib/cms/map";
import { isMissingSchema } from "@/lib/supabase/errors";
import { CMS_TAG, createPublicClient } from "@/lib/supabase/public";
import type { Json, SettingsKey } from "@/lib/supabase/types";

/**
 * Everything the public site shows that the admin can change: products and their prices, parts, client logos, site
 * images, the contact details, the AMC plans, the rental amounts, the page text, the FAQs and the client stories. Each getter returns what the admin has published, or the defaults in
 * content/ when Supabase isn't set up or the Website migration hasn't been run yet. Reads are cached under the "cms"
 * tag (refreshed whenever the admin saves) and memoised per request.
 */

/** Logged rather than thrown: the website falls back to its defaults instead of showing an error page. */
function quiet(what: string, error: { code?: string; message: string }) {
  if (!isMissingSchema(error)) console.error(`[cms] couldn't load ${what}:`, error.message);
}

async function load<T>(what: string, fallback: T, read: (client: NonNullable<ReturnType<typeof createPublicClient>>) => Promise<T | null>) {
  const supabase = createPublicClient(CMS_TAG);
  if (!supabase) return fallback;
  try {
    return (await read(supabase)) ?? fallback;
  } catch (error) {
    console.error(`[cms] couldn't load ${what}:`, error);
    return fallback;
  }
}

/**
 * The prices the website may show. Row level security only hands the public the prices the admin switched on, so a
 * hidden price never leaves the database.
 */
export const getShownPrices = cache(
  async (): Promise<ShownPrices> =>
    pricesFrom(
      await load("prices", [], async (supabase) => {
        const { data, error } = await supabase.from("cms_prices").select("product_id, item, amount, visible");
        if (error) {
          quiet("prices", error);
          return null;
        }
        return data;
      }),
    ),
);

const loadProducts = (): Promise<Product[]> =>
  load("products", defaultProducts, async (supabase) => {
    const { data, error } = await supabase.from("cms_products").select("*").eq("published", true).order("position").order("name");
    if (error) {
      quiet("products", error);
      return null;
    }
    return data.map(productFromRow);
  });

/** The published catalogue, each option carrying its shown buy and rent-from price (none while on a quote). */
export const getProducts = cache(async (): Promise<Product[]> => {
  const [products, prices] = await Promise.all([loadProducts(), getShownPrices()]);
  return products.map((product) => withShownPrices(product, prices));
});

/** The rental plan, initial payment and Regional Hydration Service amounts that are switched on. */
export async function getRentalPrices(): Promise<RentalPrices> {
  return (await getShownPrices()).rental;
}

/** The AMC on-call visit fee, when it is switched on. */
export async function getOnCallFee(): Promise<number | null> {
  return (await getShownPrices()).onCallFee;
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug);
}

export const getParts = cache(
  (): Promise<Part[]> =>
    load("parts", defaultParts, async (supabase) => {
      const { data, error } = await supabase.from("cms_parts").select("*").eq("published", true).order("position").order("name");
      if (error) {
        quiet("parts", error);
        return null;
      }
      return data.map(partFromRow);
    }),
);

export const getClientLogos = cache(
  (): Promise<ClientLogo[]> =>
    load("client logos", defaultLogos, async (supabase) => {
      const { data, error } = await supabase.from("cms_client_logos").select("*").eq("published", true).order("position").order("name");
      if (error) {
        quiet("client logos", error);
        return null;
      }
      return data.map(logoFromRow).filter((logo): logo is ClientLogo => logo !== null);
    }),
);

/** All saved settings in one read, shared by the contact details, social links, photos and AMC prices. */
const getSettingsRows = cache(
  (): Promise<Partial<Record<SettingsKey, Json>>> =>
    load("settings", {}, async (supabase) => {
      const { data, error } = await supabase.from("cms_settings").select("key, value");
      if (error) {
        quiet("settings", error);
        return null;
      }
      return Object.fromEntries(data.map((row) => [row.key, row.value]));
    }),
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await getSettingsRows();
  if (!rows.contact && !rows.social) return defaultSettings;
  return { contact: contactFrom(rows.contact), social: socialFrom(rows.social) };
});

export const getPhotos = cache(async (): Promise<Photos> => {
  const rows = await getSettingsRows();
  return rows.photos ? photosFrom(rows.photos) : defaultPhotos;
});

/** The AMC plans: their numbers (AMC plans in the admin) with their names and wording (Page text). */
export const getAmc = cache(async (): Promise<AmcSettings> => {
  const [rows, text] = await Promise.all([getSettingsRows(), getCopy(amcPlansCopy)]);
  const amc = rows.amc ? amcFrom(rows.amc) : defaultAmc;
  return {
    ...amc,
    plans: amc.plans.map((plan, i) => {
      const words = text.plans[i];
      if (!words) return plan;
      // An empty labour note removes it.
      return { ...plan, name: words.name, short: words.short, pill: words.pill, summary: words.summary, labourNote: words.labourNote || undefined };
    }),
  };
});

/** The rental plans with their names and wording from Page text (their prices come from getRentalPrices). */
export const getRentalPlans = cache(async (): Promise<RentalPlan[]> => {
  const { plans } = await getCopy(rentalPlansCopy);
  return rentalPlans.map((plan, i) => ({ ...plan, ...plans[i] }));
});

/** The KOKO badge and whether shown prices also appear on the home page. */
export const getPricing = cache(async (): Promise<PricingSettings> => pricingFrom((await getSettingsRows()).pricing));

/** Which products Find my solution recommends and the home page features. */
export const getPicks = cache(async (): Promise<Picks> => picksFrom((await getSettingsRows()).picks));

/** Every block of page text the admin changed, in one read. */
const getCopyRows = cache(
  (): Promise<Record<string, Json>> =>
    load("page text", {}, async (supabase) => {
      const { data, error } = await supabase.from("cms_copy").select("key, value");
      if (error) {
        quiet("page text", error);
        return null;
      }
      return Object.fromEntries(data.map((row) => [row.key, row.value]));
    }),
);

/** A block of page text (content/copy): the admin's changes over the website's own wording. */
export async function getCopy<D extends CopyData>(block: Block<D>): Promise<D> {
  return copyFrom(block, (await getCopyRows())[block.key]);
}

/** The LUSAKO Care services with their wording from Page text (icons and links stay with each one). */
export const getServices = cache(async (): Promise<Service[]> => {
  const { services: words } = await getCopy(sharedServices);
  return services.map((service, i) => ({ ...service, ...words[i] }));
});

/** The buy and rent steps of How it works. */
export const getHowItWorks = cache(async () => getCopy(sharedHowItWorks));

/** The functional water types with their wording from Page text (ids, icons and product links stay). */
export const getFunctionalWaters = cache(async (): Promise<FunctionalWater[]> => {
  const { types } = await getCopy(sharedFunctionalWater);
  return functionalWaters.map((water, i) => {
    const words = types[i];
    if (!words) return water;
    return { ...water, name: words.name, short: words.short, body: words.body, points: [words.point1, words.point2, words.point3] };
  });
});

/** The questions and answers (the AMC ones are worked out from the plans separately). */
export const getFaqs = cache(
  (): Promise<Faq[]> =>
    load("questions", defaultFaqs, async (supabase) => {
      const { data, error } = await supabase.from("cms_faqs").select("*").eq("published", true).order("position").order("question");
      if (error) {
        quiet("questions", error);
        return null;
      }
      return data.map(faqFromRow);
    }),
);

/** The client stories on Our clients. */
export const getCaseStudies = cache(
  (): Promise<CaseStudy[]> =>
    load("client stories", defaultCaseStudies, async (supabase) => {
      const { data, error } = await supabase.from("cms_case_studies").select("*").eq("published", true).order("position").order("slug");
      if (error) {
        quiet("client stories", error);
        return null;
      }
      return data.map(caseStudyFromRow);
    }),
);
