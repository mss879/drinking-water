"use server";

import { revalidatePath, updateTag } from "next/cache";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { CMS_TAG } from "@/lib/supabase/public";
import type { FaqTopicId } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const topics: FaqTopicId[] = ["purification", "buying", "rental", "service"];

/** One question as the FAQs dialog sends it: its topic, the wording, and where it shows. */
export type FaqInput = {
  topic: string;
  question: string;
  answer: string;
  on_home: boolean;
  on_corporate: boolean;
  published: boolean;
};

/** The FAQ page, the home page, Corporate hydration and the product pages show the questions, so a save refreshes them all. */
function refresh() {
  updateTag(CMS_TAG);
  revalidatePath("/admin/faqs");
  revalidatePath("/admin/website");
}

/** Plain text on one line: answers also go into the FAQ page's structured data for search engines. */
const plain = (value: unknown) => (typeof value === "string" ? value.replace(/[^\S\u00a0]+/g, " ").trim() : "");

/** Adds a question (id null) or saves one. A question the website looks for by name keeps its name. */
export async function saveFaq(id: string | null, input: FaqInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !UUID.test(id)) return { ok: false, error: "Unknown question." };
  const topic = input.topic as FaqTopicId;
  const question = plain(input.question);
  const answer = plain(input.answer);
  if (!topics.includes(topic)) return { ok: false, error: "Choose a topic." };
  if (!question) return { ok: false, error: "Write the question." };
  if (question.length > 200) return { ok: false, error: "Keep the question to 200 characters." };
  if (!answer) return { ok: false, error: "Write the answer." };
  if (answer.length > 1200) return { ok: false, error: "Keep the answer to 1,200 characters." };
  const values = {
    topic,
    question,
    answer,
    on_home: Boolean(input.on_home),
    on_corporate: Boolean(input.on_corporate),
    published: Boolean(input.published),
  };

  if (id) {
    const { data, error } = await supabase.from("cms_faqs").update(values).eq("id", id).select("id").maybeSingle();
    if (error) return { ok: false, error: friendlyError(error) };
    if (!data) return { ok: false, error: "This question was deleted." };
    refresh();
    return { ok: true, data: { id }, message: values.published ? "Saved. The website shows it now." : "Saved. It’s hidden from the website." };
  }
  const { data: last } = await supabase.from("cms_faqs").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase
    .from("cms_faqs")
    .insert({ ...values, position: (last?.position ?? 0) + 10 })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, data: { id: data.id }, message: "Question added." };
}

export async function setFaqPublished(id: string, published: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown question." };
  const { error } = await supabase.from("cms_faqs").update({ published: Boolean(published) }).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: published ? "Shown on the website." : "Hidden from the website." };
}

/**
 * Moves a question past the next one in its topic. The list is one order across topics (the home page shows its
 * questions in it), so only the two questions change places and everything else keeps its place.
 */
export async function moveFaq(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown question." };
  const { data, error } = await supabase.from("cms_faqs").select("id, topic, position").order("position").order("question");
  if (error) return { ok: false, error: friendlyError(error) };
  const from = data.findIndex((row) => row.id === id);
  if (from === -1) return { ok: false, error: "This question was deleted." };
  const step = direction === "up" ? -1 : 1;
  let to = from + step;
  while (to >= 0 && to < data.length && data[to].topic !== data[from].topic) to += step;
  if (to < 0 || to >= data.length) return { ok: true };

  const order = [...data];
  [order[from], order[to]] = [order[to], order[from]];
  for (const [index, row] of order.entries()) {
    if (row.position === index * 10) continue;
    const { error: updateError } = await supabase.from("cms_faqs").update({ position: index * 10 }).eq("id", row.id);
    if (updateError) return { ok: false, error: friendlyError(updateError) };
  }
  refresh();
  return { ok: true };
}

/** Deletes a question. The ones the website looks for by name (the warranty answer on every product page) stay. */
export async function deleteFaq(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Unknown question." };
  const { data, error: readError } = await supabase.from("cms_faqs").select("key").eq("id", id).maybeSingle();
  if (readError) return { ok: false, error: friendlyError(readError) };
  if (!data) return { ok: false, error: "This question was already deleted." };
  if (data.key) return { ok: false, error: "Every product page repeats this question, so it can’t be deleted. Edit the wording instead." };
  const { error } = await supabase.from("cms_faqs").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Question deleted." };
}
