import "server-only";
import { cache } from "react";
import { defaultAmc, type AmcSettings } from "@/content/amc";
import { clientLogos as defaultLogos, type ClientLogo } from "@/content/clients";
import { photos as defaultPhotos, type Photos } from "@/content/images";
import { parts as defaultParts, type Part } from "@/content/parts";
import { products as defaultProducts, type Product } from "@/content/products";
import { defaultSettings, type SiteSettings } from "@/content/site";
import { amcFrom, contactFrom, logoFromRow, partFromRow, photosFrom, productFromRow, socialFrom } from "@/lib/cms/map";
import { isMissingSchema } from "@/lib/supabase/errors";
import { CMS_TAG, createPublicClient } from "@/lib/supabase/public";
import type { Json, SettingsKey } from "@/lib/supabase/types";

/**
 * Everything the public site shows that the admin can change: products, parts, client logos, site photos, the
 * contact details and the AMC plan prices. Each getter returns what the admin has published, or the defaults in
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

export const getProducts = cache(
  (): Promise<Product[]> =>
    load("products", defaultProducts, async (supabase) => {
      const { data, error } = await supabase.from("cms_products").select("*").eq("published", true).order("position").order("name");
      if (error) {
        quiet("products", error);
        return null;
      }
      return data.map(productFromRow);
    }),
);

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

export const getAmc = cache(async (): Promise<AmcSettings> => {
  const rows = await getSettingsRows();
  return rows.amc ? amcFrom(rows.amc) : defaultAmc;
});
