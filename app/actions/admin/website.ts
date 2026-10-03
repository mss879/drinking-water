"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { amcPlanIds, amcPlanName, type AmcPlanId } from "@/content/amc";
import { photoKeys, type PhotoKey } from "@/content/images";
import { isProductType } from "@/content/products";
import { socialNetworks, type SiteContact, type SocialLink, type SocialNetwork } from "@/content/site";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { amcLimits, cleanAmount, cleanList, cleanText, cleanWhole, parseCards, parseVariants } from "@/lib/cms/map";
import { isSiteImage, siteMediaPath, SITE_MEDIA_BUCKET } from "@/lib/cms/media";
import { CMS_TAG } from "@/lib/supabase/public";
import type { Json, PartCategoryId } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;
const partCategories: PartCategoryId[] = ["filters", "spare-parts", "accessories"];

type Admin = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
type Direction = "up" | "down";

/** Every public page can show admin content (the header and footer carry the contact details), so a save refreshes them all. */
function refreshSite(...adminPaths: string[]) {
  updateTag(CMS_TAG);
  revalidatePath("/admin/website");
  for (const path of adminPaths) revalidatePath(path);
}

/** Removes uploaded files that are no longer used. Files that aren't in the site-media bucket are left alone. */
async function removeMedia(supabase: Admin, ...urls: (string | null | undefined)[]) {
  const paths = urls.map((url) => (url ? siteMediaPath(url) : null)).filter((path): path is string => Boolean(path));
  if (paths.length) await supabase.storage.from(SITE_MEDIA_BUCKET).remove(paths);
}

type Ordered = { data: { id: string; position: number }[] | null; error: { code?: string; message: string } | null };

/** Moves one row up or down a list ordered by position, renumbering the list so positions stay tidy. */
async function move(supabase: Admin, table: "cms_products" | "cms_parts" | "cms_client_logos", list: Ordered, id: string, direction: Direction) {
  const { data, error } = list;
  if (error || !data) return friendlyError(error);
  const ids = data.map((row) => row.id);
  const from = ids.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return null;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  const base = data.length ? Math.min(...data.map((row) => row.position)) : 0;
  for (const [index, rowId] of ids.entries()) {
    const { error: updateError } = await supabase.from(table).update({ position: base + index * 10 }).eq("id", rowId);
    if (updateError) return friendlyError(updateError);
  }
  return null;
}

// ------------------------------------------------------------------ products --

export type ProductInput = {
  name: string;
  slug: string;
  family: string;
  tagline: string;
  types: string[];
  variants: { filtration: string; label: string; code: string; price: string; rent: string }[];
  purification: string;
  temperatures: string[];
  installation: string;
  warranty: string;
  image_url: string | null;
  summary: string;
  highlights: string[];
  features: { title: string; body: string }[];
  who_for: { title: string; body: string }[];
  filtration_note: string;
  installation_note: string;
  maintenance_note: string;
  published: boolean;
};

/** "New product": a draft with the usual UF and RO options, opened straight away in the editor. */
export async function createProduct() {
  const { supabase } = await requireAdmin();
  const { data: last } = await supabase.from("cms_products").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase
    .from("cms_products")
    .insert({
      slug: `new-product-${crypto.randomUUID().slice(0, 6)}`,
      name: "New product",
      published: false,
      position: (last?.position ?? 0) + 10,
      installation: "Professional installation",
      variants: [
        { filtration: "UF", label: "4-Stage UF", code: null, price: null, rent: null },
        { filtration: "RO", label: "4-Stage RO", code: null, price: null, rent: null },
      ],
    })
    .select("id")
    .single();
  if (error) throw new Error(friendlyError(error));
  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}

export async function saveProduct(id: string, input: ProductInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown product." };

  const name = cleanText(input.name, 80);
  const slug = cleanText(input.slug, 80).toLowerCase();
  const types = Array.from(new Set(input.types)).filter(isProductType);
  const variants = parseVariants(input.variants);
  const published = Boolean(input.published);
  if (!name) return { ok: false, error: "Give the product a name." };
  if (!SLUG.test(slug)) return { ok: false, error: "The web address can only use lower-case letters, numbers and dashes." };
  if (input.image_url && !isSiteImage(input.image_url)) return { ok: false, error: "Upload the product photo here in the admin." };
  if (published && types.length === 0) return { ok: false, error: "Choose at least one category before publishing." };
  if (published && variants.length === 0) return { ok: false, error: "Add at least one purification option (UF or RO) before publishing." };

  const { data: before } = await supabase.from("cms_products").select("slug").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "This product was deleted." };

  const { error } = await supabase
    .from("cms_products")
    .update({
      name,
      slug,
      family: cleanText(input.family, 60),
      tagline: cleanText(input.tagline, 120),
      types,
      variants: variants as unknown as Json,
      purification: cleanText(input.purification, 60),
      temperatures: cleanList(input.temperatures, 30, 6),
      installation: cleanText(input.installation, 80),
      warranty: cleanText(input.warranty, 60),
      image_url: input.image_url || null,
      summary: cleanText(input.summary, 600),
      highlights: cleanList(input.highlights, 40, 6),
      features: parseCards(input.features).slice(0, 8) as unknown as Json,
      who_for: parseCards(input.who_for).slice(0, 6) as unknown as Json,
      filtration_note: cleanText(input.filtration_note, 600),
      installation_note: cleanText(input.installation_note, 600),
      maintenance_note: cleanText(input.maintenance_note, 600) || null,
      published,
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Another product already uses that web address. Change it." };
    return { ok: false, error: friendlyError(error) };
  }
  refreshSite("/admin/products", `/admin/products/${id}`);
  return { ok: true, message: published ? "Saved. The website shows the changes now." : "Saved as a draft." };
}

export async function setProductPublished(id: string, published: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown product." };
  if (published) {
    const { data } = await supabase.from("cms_products").select("types, variants").eq("id", id).maybeSingle();
    if (!data) return { ok: false, error: "This product was deleted." };
    if (!data.types.length || !parseVariants(data.variants).length) {
      return { ok: false, error: "Open the product and add a category and a purification option before publishing." };
    }
  }
  const { error } = await supabase.from("cms_products").update({ published }).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refreshSite("/admin/products", `/admin/products/${id}`);
  return { ok: true, message: published ? "Published on the website." : "Hidden from the website." };
}

export async function moveProduct(id: string, direction: Direction): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown product." };
  const list = await supabase.from("cms_products").select("id, position").order("position").order("id");
  const problem = await move(supabase, "cms_products", list, id, direction);
  if (problem) return { ok: false, error: problem };
  refreshSite("/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown product." };
  // Its photos live in a folder named after it.
  const { data: files } = await supabase.storage.from(SITE_MEDIA_BUCKET).list(`products/${id}`, { limit: 100 });
  if (files?.length) await supabase.storage.from(SITE_MEDIA_BUCKET).remove(files.map((file) => `products/${id}/${file.name}`));
  const { error } = await supabase.from("cms_products").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refreshSite("/admin/products");
  return { ok: true, message: "Product deleted." };
}

// --------------------------------------------------------------------- parts --

export type PartInput = {
  category: string;
  name: string;
  description: string;
  image_url: string | null;
  price: string;
  /** Typical life in months; filters only. */
  life: string;
  published: boolean;
};

export async function savePart(id: string | null, input: PartInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !UUID.test(id)) return { ok: false, error: "Unknown item." };
  const category = input.category as PartCategoryId;
  const name = cleanText(input.name, 80);
  if (!partCategories.includes(category)) return { ok: false, error: "Choose a category." };
  if (!name) return { ok: false, error: "Give the item a name." };
  if (input.image_url && !isSiteImage(input.image_url)) return { ok: false, error: "Upload the photo here in the admin." };
  if (cleanText(input.price, 20) && cleanAmount(input.price) === null) return { ok: false, error: "Enter the price as a number, or leave it empty." };
  const life = category === "filters" && cleanText(input.life, 10) ? cleanWhole(input.life, 1, 120) : null;
  if (category === "filters" && cleanText(input.life, 10) && life === null) {
    return { ok: false, error: "Enter the typical life as a number of months (1 to 120), or leave it empty." };
  }
  const values = {
    category,
    name,
    description: cleanText(input.description, 300),
    image_url: input.image_url || null,
    price: cleanAmount(input.price),
    life_months: life,
    published: Boolean(input.published),
  };

  if (id) {
    const { data: before } = await supabase.from("cms_parts").select("image_url").eq("id", id).maybeSingle();
    const { error } = await supabase.from("cms_parts").update(values).eq("id", id);
    if (error) return { ok: false, error: friendlyError(error) };
    if (before?.image_url && before.image_url !== values.image_url) await removeMedia(supabase, before.image_url);
    refreshSite("/admin/parts");
    return { ok: true, data: { id }, message: "Saved." };
  }
  const { data: last } = await supabase.from("cms_parts").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase
    .from("cms_parts")
    .insert({ ...values, position: (last?.position ?? 0) + 10 })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyError(error) };
  refreshSite("/admin/parts");
  return { ok: true, data: { id: data.id }, message: "Added." };
}

export async function movePart(id: string, direction: Direction): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown item." };
  const { data } = await supabase.from("cms_parts").select("category").eq("id", id).maybeSingle();
  if (!data) return { ok: false, error: "This item was deleted." };
  const list = await supabase.from("cms_parts").select("id, position").eq("category", data.category).order("position").order("id");
  const problem = await move(supabase, "cms_parts", list, id, direction);
  if (problem) return { ok: false, error: problem };
  refreshSite("/admin/parts");
  return { ok: true };
}

export async function deletePart(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown item." };
  const { data } = await supabase.from("cms_parts").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("cms_parts").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  await removeMedia(supabase, data?.image_url);
  refreshSite("/admin/parts");
  return { ok: true, message: "Deleted." };
}

// ---------------------------------------------------------------- client logos --

export type LogoInput = { name: string; image_url: string; website_url: string; published: boolean };

export async function saveLogo(id: string | null, input: LogoInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !UUID.test(id)) return { ok: false, error: "Unknown logo." };
  const name = cleanText(input.name, 120);
  const website = cleanText(input.website_url, 300);
  if (!name) return { ok: false, error: "Add the client’s name (it’s read out to screen-reader users)." };
  if (!isSiteImage(input.image_url)) return { ok: false, error: "Upload the logo first." };
  if (website && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(website)) return { ok: false, error: "Enter the website as a full address, starting with https://" };
  const values = { name, image_url: input.image_url, website_url: website || null, published: Boolean(input.published) };

  if (id) {
    const { data: before } = await supabase.from("cms_client_logos").select("image_url").eq("id", id).maybeSingle();
    const { error } = await supabase.from("cms_client_logos").update(values).eq("id", id);
    if (error) return { ok: false, error: friendlyError(error) };
    if (before && before.image_url !== values.image_url) await removeMedia(supabase, before.image_url);
    refreshSite("/admin/logos");
    return { ok: true, data: { id }, message: "Saved." };
  }
  const { data: last } = await supabase.from("cms_client_logos").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase
    .from("cms_client_logos")
    .insert({ ...values, position: (last?.position ?? 0) + 10 })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyError(error) };
  refreshSite("/admin/logos");
  return { ok: true, data: { id: data.id }, message: "Logo added." };
}

export async function moveLogo(id: string, direction: Direction): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown logo." };
  const list = await supabase.from("cms_client_logos").select("id, position").order("position").order("id");
  const problem = await move(supabase, "cms_client_logos", list, id, direction);
  if (problem) return { ok: false, error: problem };
  refreshSite("/admin/logos");
  return { ok: true };
}

export async function deleteLogo(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown logo." };
  const { data } = await supabase.from("cms_client_logos").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("cms_client_logos").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  await removeMedia(supabase, data?.image_url);
  refreshSite("/admin/logos");
  return { ok: true, message: "Logo removed." };
}

// -------------------------------------------------------------------- photos --

/** Replaces one of the site's photos, or (with null) puts the original back. */
export async function savePhoto(key: PhotoKey, photo: { src: string; alt: string } | null): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!photoKeys.includes(key)) return { ok: false, error: "Unknown photo." };
  if (photo && !isSiteImage(photo.src)) return { ok: false, error: "Upload the photo here in the admin." };

  const { data: row, error: readError } = await supabase.from("cms_settings").select("value").eq("key", "photos").maybeSingle();
  if (readError) return { ok: false, error: friendlyError(readError) };
  const current = row?.value && typeof row.value === "object" && !Array.isArray(row.value) ? { ...(row.value as Record<string, Json>) } : {};
  const previous = current[key] && typeof current[key] === "object" && !Array.isArray(current[key]) ? (current[key] as { src?: string }).src : null;
  if (photo) current[key] = { src: photo.src, alt: cleanText(photo.alt, 200) };
  else delete current[key];

  const { error } = await supabase.from("cms_settings").upsert({ key: "photos", value: current });
  if (error) return { ok: false, error: friendlyError(error) };
  if (previous && previous !== photo?.src) await removeMedia(supabase, previous);
  refreshSite("/admin/photos");
  return { ok: true, message: photo ? "Photo updated on the website." : "The original photo is back." };
}

// ------------------------------------------------------------------ settings --

export async function saveContact(input: SiteContact): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const phones = cleanList(input.phones, 30, 4);
  const numbers = { hotline: cleanText(input.hotline, 30), whatsappSales: cleanText(input.whatsappSales, 30), whatsappEmergency: cleanText(input.whatsappEmergency, 30) };
  const emails = { salesEmail: cleanText(input.salesEmail, 120), operationsEmail: cleanText(input.operationsEmail, 120) };
  if (phones.length === 0) return { ok: false, error: "Add at least one phone number." };
  if ([...phones, ...Object.values(numbers).filter(Boolean)].some((number) => !PHONE.test(number))) {
    return { ok: false, error: "Phone numbers can only use digits, spaces, + and dashes, e.g. 011 433 4885." };
  }
  if (Object.values(emails).some((email) => email && !EMAIL.test(email))) return { ok: false, error: "Check the email addresses." };
  const value: SiteContact = {
    phones,
    ...numbers,
    ...emails,
    hours: cleanText(input.hours, 120),
    address: cleanText(input.address, 300)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n"),
  };
  const { error } = await supabase.from("cms_settings").upsert({ key: "contact", value: value as unknown as Json });
  if (error) return { ok: false, error: friendlyError(error) };
  refreshSite("/admin/site");
  return { ok: true, message: "Contact details updated across the website." };
}

export async function saveSocial(links: SocialLink[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const clean: SocialLink[] = [];
  for (const link of links) {
    const url = cleanText(link.url, 300);
    if (!url) continue;
    if (!socialNetworks.includes(link.network as SocialNetwork)) return { ok: false, error: "Unknown social network." };
    if (!/^https:\/\/[^\s]+\.[^\s]+$/.test(url)) return { ok: false, error: "Enter each profile as a full address, starting with https://" };
    clean.push({ network: link.network, url });
  }
  const { error } = await supabase.from("cms_settings").upsert({ key: "social", value: clean as unknown as Json });
  if (error) return { ok: false, error: friendlyError(error) };
  refreshSite("/admin/site");
  return { ok: true, message: clean.length ? "Social links updated across the website." : "Social links removed from the website." };
}

// ---------------------------------------------------------------------- AMC --

export type AmcPlanInput = { monthly: string; visits: string; sanitations: string; priority: boolean; filterDiscount: string; partsDiscount: string };
export type AmcInput = { plans: Record<AmcPlanId, AmcPlanInput>; fees: { visit: string; sanitation: string } };

/** The AMC plans' prices, visits and discounts, and the standalone service prices they're compared with. */
export async function saveAmc(input: AmcInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const plans: Record<string, Json> = {};
  for (const id of amcPlanIds) {
    const plan = input.plans?.[id];
    const name = amcPlanName(id);
    if (!plan) return { ok: false, error: `Fill in ${name}.` };
    const monthly = cleanWhole(plan.monthly, ...amcLimits.monthly);
    const visits = cleanWhole(plan.visits, ...amcLimits.visits);
    const sanitations = cleanWhole(plan.sanitations, ...amcLimits.sanitations);
    const filterDiscount = cleanWhole(plan.filterDiscount || "0", ...amcLimits.filterDiscount);
    const partsDiscount = cleanWhole(plan.partsDiscount || "0", ...amcLimits.partsDiscount);
    if (monthly === null) return { ok: false, error: `${name}: enter the monthly price as a whole number of rupees.` };
    if (visits === null) return { ok: false, error: `${name}: preventive visits must be a whole number from 0 to 12.` };
    if (sanitations === null) return { ok: false, error: `${name}: tank sanitations must be a whole number from 0 to 12.` };
    if (filterDiscount === null || partsDiscount === null) return { ok: false, error: `${name}: discounts must be whole percentages from 0 to 90.` };
    plans[id] = { monthly, visits, sanitations, priority: Boolean(plan.priority), filterDiscount, partsDiscount };
  }
  const visit = cleanWhole(input.fees?.visit, ...amcLimits.fee);
  const sanitation = cleanWhole(input.fees?.sanitation, ...amcLimits.fee);
  if (visit === null || sanitation === null) return { ok: false, error: "Enter both standalone service prices as whole numbers of rupees." };

  const { error } = await supabase.from("cms_settings").upsert({ key: "amc", value: { plans, fees: { visit, sanitation } } });
  if (error) return { ok: false, error: friendlyError(error) };
  refreshSite("/admin/amc");
  return { ok: true, message: "AMC plans updated across the website." };
}
