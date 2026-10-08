"use server";

import { revalidatePath, updateTag } from "next/cache";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { CMS_TAG } from "@/lib/supabase/public";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One client story as the stories dialog sends it. */
export type StoryInput = {
  sample: boolean;
  industry: string;
  location: string;
  model: string;
  challenge: string;
  requirement: string;
  solution: string;
  implementation: string;
  support: string;
  result: string;
  published: boolean;
};

type TextKey = Exclude<keyof StoryInput, "sample" | "published">;

/** Each text, its name in the admin and its limit (the database's). The six story parts are in the card's order. */
const texts: { key: TextKey; label: string; max: number }[] = [
  { key: "industry", label: "Industry", max: 80 },
  { key: "location", label: "Location", max: 80 },
  { key: "model", label: "Pill", max: 60 },
  { key: "challenge", label: "Challenge", max: 400 },
  { key: "requirement", label: "Requirement", max: 400 },
  { key: "solution", label: "LUSAKO solution", max: 400 },
  { key: "implementation", label: "Implementation", max: 400 },
  { key: "support", label: "Ongoing support", max: 400 },
  { key: "result", label: "Result", max: 400 },
];
const parts: TextKey[] = ["challenge", "requirement", "solution", "implementation", "support", "result"];

function refresh() {
  updateTag(CMS_TAG);
  revalidatePath("/admin/stories");
  revalidatePath("/admin/website");
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");

type Admin = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/**
 * The story's name in the page's code, from its industry ("Financial services · multi-branch" becomes
 * financial-services-multi-branch), numbered when another story already has it. A story keeps its name while its
 * industry stays the same (the starting stories keep theirs, such as multi-branch-office).
 */
async function slugFor(supabase: Admin, industry: string, id: string | null) {
  const base = slugify(industry) || "story";
  const { data, error } = await supabase.from("cms_case_studies").select("id, slug, industry");
  if (error) return { error };
  const current = data.find((row) => row.id === id);
  if (current && (current.industry === industry || current.slug === base || new RegExp(`^${base}-\\d+$`).test(current.slug))) {
    return { slug: current.slug };
  }
  const taken = new Set(data.filter((row) => row.id !== id).map((row) => row.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return { slug };
}

/** Adds a story (id null) or saves one. A story on the website needs every part filled in. */
export async function saveStory(id: string | null, input: StoryInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !UUID.test(id)) return { ok: false, error: "Unknown story." };
  const values = {} as Record<TextKey, string>;
  for (const { key, label, max } of texts) {
    const text = typeof input[key] === "string" ? input[key].replace(/[^\S\u00a0]+/g, " ").trim() : "";
    if (text.length > max) return { ok: false, error: `${label}: keep it to ${max} characters.` };
    values[key] = text;
  }
  const published = Boolean(input.published);
  if (!values.industry) return { ok: false, error: "Add the industry: it’s the story’s title." };
  if (published && (!values.location || parts.some((key) => !values[key]))) {
    return { ok: false, error: "Fill in the location and every part of the story before showing it on the website, or untick Show on the website." };
  }

  const named = await slugFor(supabase, values.industry, id);
  if ("error" in named) return { ok: false, error: friendlyError(named.error) };
  const row = { ...values, slug: named.slug, sample: Boolean(input.sample), published };

  if (id) {
    const { data, error } = await supabase.from("cms_case_studies").update(row).eq("id", id).select("id").maybeSingle();
    if (error) return { ok: false, error: friendlyError(error) };
    if (!data) return { ok: false, error: "This story was deleted." };
    refresh();
    return { ok: true, data: { id }, message: published ? "Saved. The website shows it now." : "Saved. It’s hidden from the website." };
  }
  const { data: last } = await supabase.from("cms_case_studies").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase
    .from("cms_case_studies")
    .insert({ ...row, position: (last?.position ?? 0) + 10 })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, data: { id: data.id }, message: "Story added." };
}

export async function setStoryPublished(id: string, published: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown story." };
  if (published) {
    const { data } = await supabase.from("cms_case_studies").select("*").eq("id", id).maybeSingle();
    if (!data) return { ok: false, error: "This story was deleted." };
    if (!data.location || parts.some((key) => !data[key])) {
      return { ok: false, error: "Open the story and fill in the location and every part before showing it on the website." };
    }
  }
  const { error } = await supabase.from("cms_case_studies").update({ published: Boolean(published) }).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: published ? "Shown on the website." : "Hidden from the website." };
}

/** Moves a story one place up or down, renumbering the list so positions stay tidy. */
export async function moveStory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown story." };
  const { data, error } = await supabase.from("cms_case_studies").select("id, position").order("position").order("slug");
  if (error) return { ok: false, error: friendlyError(error) };
  const from = data.findIndex((row) => row.id === id);
  if (from === -1) return { ok: false, error: "This story was deleted." };
  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= data.length) return { ok: true };

  const order = [...data];
  [order[from], order[to]] = [order[to], order[from]];
  for (const [index, row] of order.entries()) {
    if (row.position === index * 10) continue;
    const { error: updateError } = await supabase.from("cms_case_studies").update({ position: index * 10 }).eq("id", row.id);
    if (updateError) return { ok: false, error: friendlyError(updateError) };
  }
  refresh();
  return { ok: true };
}

export async function deleteStory(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown story." };
  const { error } = await supabase.from("cms_case_studies").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Story deleted." };
}
