import "server-only";
import { cache } from "react";
import type { SiteContact } from "@/content/site";
import { chatSettingsFrom, type ChatSettings } from "@/lib/chat/config";
import type { ChatWidgetConfig } from "@/lib/chat/types";
import { isMissingSchema } from "@/lib/supabase/errors";
import { CMS_TAG } from "@/lib/supabase/public";
import { createServiceClient } from "@/lib/supabase/service";

export { chatSettingsFrom, type ChatSettings };

/**
 * The saved settings, or null while chat can't run: Supabase (with the secret key) isn't set up, or the chat
 * migration hasn't been run. The website then shows no chat button.
 */
export const getChatSettings = cache(async (): Promise<ChatSettings | null> => {
  const supabase = createServiceClient({ cacheTag: CMS_TAG });
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("chat_settings").select("*").maybeSingle();
    if (error) {
      if (!isMissingSchema(error)) console.error("[chat] couldn't load the settings:", error.message);
      return null;
    }
    return chatSettingsFrom(data);
  } catch (error) {
    console.error("[chat] couldn't load the settings:", error);
    return null;
  }
});

/** The OpenAI key is set, so the assistant can answer. */
export function hasAssistantKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** The model the assistant uses (OPENAI_MODEL), gpt-4o-mini unless set. */
export function assistantModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

/** The assistant answers right now: switched on in the admin and the OpenAI key is set. */
export function assistantAnswers(settings: ChatSettings) {
  return settings.aiEnabled && hasAssistantKey();
}

/**
 * What the website's chat button needs, or null for no chat button: switched off in the admin, chat not set up, or
 * the assistant switched on without its OpenAI key (rather than leave visitors waiting for replies that never come).
 */
export async function getChatWidget(contact: SiteContact): Promise<ChatWidgetConfig | null> {
  const settings = await getChatSettings();
  if (!settings?.widgetEnabled) return null;
  if (settings.aiEnabled && !hasAssistantKey()) return null;
  return {
    name: settings.assistantName,
    greeting: settings.greeting,
    teaser: settings.teaser,
    quickReplies: settings.quickReplies,
    ai: assistantAnswers(settings),
    hours: contact.hours,
    whatsapp: contact.whatsappSales || null,
    phone: contact.phones[0] || contact.hotline || null,
    stacked: contact.showWhatsappButton && Boolean(contact.whatsappSales),
  };
}
