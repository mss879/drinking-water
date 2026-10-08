"use server";

import { revalidatePath, updateTag } from "next/cache";
import type { Picks } from "@/content/products";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { CMS_TAG } from "@/lib/supabase/public";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const finderNames = { home: "Home", office: "Office", commercial: "Commercial" } as const;

/**
 * Which products Find my solution recommends for a home, an office and a commercial space, and the product on the
 * home page's Buy card (null: the first countertop purifier, as before). Saved as the "picks" setting.
 */
export async function savePicks(input: Picks): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const finder: Partial<Picks["finder"]> = input?.finder ?? {};
  const homeBuyCard = typeof input?.homeBuyCard === "string" && input.homeBuyCard ? input.homeBuyCard : null;
  const chosen = [...Object.values(finder), homeBuyCard].filter((slug): slug is string => typeof slug === "string" && slug !== "");
  if (chosen.some((slug) => !SLUG.test(slug))) return { ok: false, error: "One of the products isn’t recognised. Reload the page and try again." };

  const { data, error: readError } = await supabase.from("cms_products").select("slug").in("slug", chosen.length ? chosen : ["-"]);
  if (readError) return { ok: false, error: friendlyError(readError) };
  const known = new Set(data.map((row) => row.slug));
  const picked = {} as Picks["finder"];
  for (const need of ["home", "office", "commercial"] as const) {
    const slug = finder[need];
    if (!slug) return { ok: false, error: `Choose the product Find my solution recommends for ${finderNames[need]}.` };
    if (!known.has(slug)) return { ok: false, error: `The product chosen for ${finderNames[need]} no longer exists. Choose another one.` };
    picked[need] = slug;
  }
  if (homeBuyCard && !known.has(homeBuyCard)) return { ok: false, error: "The product chosen for the home page’s Buy card no longer exists. Choose another one." };

  const value: Picks = { finder: picked, homeBuyCard };
  const { error } = await supabase.from("cms_settings").upsert({ key: "picks", value });
  if (error) {
    if (error.code === "23514") return { ok: false, error: "The database needs one more step first: run supabase/migrations/20261009120000_editable_website.sql." };
    return { ok: false, error: friendlyError(error) };
  }
  updateTag(CMS_TAG);
  revalidatePath("/admin/products");
  revalidatePath("/admin/website");
  return { ok: true, message: "Recommended products updated on the website." };
}
