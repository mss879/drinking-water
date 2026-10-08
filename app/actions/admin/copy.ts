"use server";

import { revalidatePath, updateTag } from "next/cache";
import { findBlock } from "@/content/copy";
import { checkBlock } from "@/content/copy/schema";
import { friendlyError, requireAdmin } from "@/lib/admin/auth";
import { CMS_TAG } from "@/lib/supabase/public";
import type { Json } from "@/lib/supabase/types";

export type CopyResult = { ok: true; message: string; edited: boolean } | { ok: false; error: string; fields?: Record<string, string> };

function refresh() {
  updateTag(CMS_TAG);
  revalidatePath("/admin/pages", "layout");
}

/**
 * Saves one block of page text. Each field is checked against its declaration (content/copy); only the fields that
 * differ from the website's own wording are stored, and a block with no differences is removed.
 */
export async function saveCopy(key: string, input: unknown): Promise<CopyResult> {
  const { supabase } = await requireAdmin();
  const block = findBlock(key);
  if (!block) return { ok: false, error: "This section no longer exists. Reload the page." };

  const { changes, errors } = checkBlock(block, input);
  if (Object.keys(errors).length) return { ok: false, error: "Some of the text needs a change before it can be saved.", fields: errors };

  const edited = Object.keys(changes).length > 0;
  const { error } = edited
    ? await supabase.from("cms_copy").upsert({ key, value: changes as Json })
    : await supabase.from("cms_copy").delete().eq("key", key);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, edited, message: edited ? "Saved. The website shows it now." : "Saved. This section uses the original wording." };
}

/** Puts a block back to the website's own wording. */
export async function resetCopy(key: string): Promise<CopyResult> {
  const { supabase } = await requireAdmin();
  if (!findBlock(key)) return { ok: false, error: "This section no longer exists. Reload the page." };
  const { error } = await supabase.from("cms_copy").delete().eq("key", key);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, edited: false, message: "The original wording is back." };
}
