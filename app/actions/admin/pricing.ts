"use server";

import { revalidatePath, updateTag } from "next/cache";
import { provinces } from "@/content/pricing";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { cleanAmount, cleanText } from "@/lib/cms/map";
import { CMS_TAG } from "@/lib/supabase/public";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRODUCT_ITEM = /^(buy|rent)-(uf|ro)$/;
const SITE_ITEMS = new Set([
  "rental-plan-pureflow-uf",
  "rental-plan-pureflow-ro",
  "rental-plan-aquaspark",
  "rental-initial",
  "rental-regional",
  "oncall-fee",
  ...provinces.filter((province) => province.id !== "western").map((province) => `rental-regional-${province.id}`),
]);

export type PriceInput = { productId: string | null; item: string; amount: string; visible: boolean; label: string };
export type PricingInput = { settings: { koko: boolean; showOnHome: boolean }; prices: PriceInput[] };

function refresh() {
  updateTag(CMS_TAG);
  revalidatePath("/admin/pricing");
  revalidatePath("/admin/website");
}

/**
 * Saves every price and its show switch, and the website's price switches. A price can only be shown once it has an
 * amount. Hidden prices stay in the database for later, where the public can't read them.
 */
export async function savePricing(input: PricingInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const rows: { product_id: string | null; item: string; amount: number | null; visible: boolean }[] = [];
  const seen = new Set<string>();
  for (const price of input.prices ?? []) {
    const label = cleanText(price.label, 120) || "A price";
    const productItem = PRODUCT_ITEM.test(price.item);
    if (productItem ? !price.productId || !UUID.test(price.productId) : price.productId !== null || !SITE_ITEMS.has(price.item)) {
      return { ok: false, error: "One of the prices isn’t recognised. Reload the page and try again." };
    }
    const typed = cleanText(price.amount, 20);
    const amount = cleanAmount(typed);
    if (typed && amount === null) return { ok: false, error: `${label}: enter the amount in rupees, like 4,990, or leave it empty.` };
    if (price.visible && amount === null) return { ok: false, error: `${label}: enter an amount before showing it on the website.` };
    const key = `${price.productId ?? "site"}:${price.item}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ product_id: price.productId, item: price.item, amount, visible: Boolean(price.visible) && amount !== null });
  }

  if (rows.length) {
    const { error } = await supabase.from("cms_prices").upsert(rows, { onConflict: "product_id,item" });
    if (error) return { ok: false, error: friendlyError(error) };
  }
  const settings = { koko: Boolean(input.settings?.koko), showOnHome: Boolean(input.settings?.showOnHome) };
  const { error } = await supabase.from("cms_settings").upsert({ key: "pricing", value: settings });
  if (error) return { ok: false, error: friendlyError(error) };

  refresh();
  const shown = rows.filter((row) => row.visible).length;
  return {
    ok: true,
    message: shown ? `Saved. ${shown} ${shown === 1 ? "price is" : "prices are"} on the website.` : "Saved. Every price is hidden: the website asks for a quote.",
  };
}

/** Takes every price off the website in one go (the amounts are kept, hidden). */
export async function hideAllPrices(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("cms_prices").update({ visible: false }).eq("visible", true);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Every price is hidden. The website asks for a quote everywhere." };
}
