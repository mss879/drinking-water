import type { ChatPriceMode, ChatSettingsRow } from "@/lib/supabase/types";

/**
 * The chat assistant's settings (admin › Chats › Assistant settings, table chat_settings). Only the website's server
 * reads them, so the team's extra instructions never reach the public API. Cached under the "cms" tag, which every
 * save refreshes.
 */
export type ChatSettings = {
  /** The chat button shows on the website. */
  widgetEnabled: boolean;
  /** The assistant answers. Off: chats wait for a team member. */
  aiEnabled: boolean;
  assistantName: string;
  greeting: string;
  /** The short line beside the chat button on computers; empty for none. */
  teaser: string;
  quickReplies: string[];
  priceMode: ChatPriceMode;
  /** Ask for a name and phone number before quoting purifier prices. */
  contactFirst: boolean;
  /** Email visitors a copy of their quote when they ask (needs RESEND_API_KEY). */
  emailQuotes: boolean;
  instructions: string;
  /** Where chat leads and requests for a person are emailed; empty uses the sales email. */
  alertEmail: string | null;
};

/** The same defaults as the migration's, for a database row that is missing fields. */
export const defaultChatSettings: ChatSettings = {
  widgetEnabled: true,
  aiEnabled: true,
  assistantName: "LUSAKO Assistant",
  greeting:
    "Hi! I’m the LUSAKO assistant. I can help you choose a water purifier, compare buying and renting, explain AMC plans and prices, or arrange a quote or a call back. What can I help you with?",
  teaser: "Questions about purifiers, renting or prices? Ask me.",
  quickReplies: ["Which purifier suits my home?", "How much is it to rent for an office?", "Tell me about AMC plans", "I need water for my company"],
  priceMode: "all",
  contactFirst: false,
  emailQuotes: true,
  instructions: "",
  alertEmail: null,
};

export const priceModes: Record<ChatPriceMode, { label: string; hint: string }> = {
  all: {
    label: "Every price in Prices & quotes",
    hint: "The assistant may quote any amount entered in Prices & quotes, including ones hidden on the website.",
  },
  shown: {
    label: "Only prices shown on the website",
    hint: "Amounts that are switched off in Prices & quotes stay private; the assistant arranges a quote for those.",
  },
  none: {
    label: "No purifier prices",
    hint: "The assistant always arranges a quote for buying or renting. AMC plan and filter prices are public, so it can still share those.",
  },
};

export const chatLimits = { name: 40, greeting: 400, teaser: 90, quickReply: 60, quickReplies: 4, instructions: 4000 } as const;

export function chatSettingsFrom(row: Partial<ChatSettingsRow> | null | undefined): ChatSettings {
  if (!row) return defaultChatSettings;
  const text = (value: unknown, max: number, fallback: string) =>
    typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
  return {
    widgetEnabled: typeof row.widget_enabled === "boolean" ? row.widget_enabled : defaultChatSettings.widgetEnabled,
    aiEnabled: typeof row.ai_enabled === "boolean" ? row.ai_enabled : defaultChatSettings.aiEnabled,
    assistantName: text(row.assistant_name, chatLimits.name, defaultChatSettings.assistantName),
    greeting: text(row.greeting, chatLimits.greeting, defaultChatSettings.greeting),
    teaser: typeof row.teaser === "string" ? row.teaser.trim().slice(0, chatLimits.teaser) : defaultChatSettings.teaser,
    quickReplies: Array.isArray(row.quick_replies)
      ? row.quick_replies
          .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
          .map((item) => item.trim().slice(0, chatLimits.quickReply))
          .slice(0, chatLimits.quickReplies)
      : defaultChatSettings.quickReplies,
    priceMode: row.price_mode === "shown" || row.price_mode === "none" || row.price_mode === "all" ? row.price_mode : defaultChatSettings.priceMode,
    contactFirst: typeof row.contact_first === "boolean" ? row.contact_first : defaultChatSettings.contactFirst,
    emailQuotes: typeof row.email_quotes === "boolean" ? row.email_quotes : defaultChatSettings.emailQuotes,
    instructions: typeof row.instructions === "string" ? row.instructions.trim().slice(0, chatLimits.instructions) : "",
    alertEmail: typeof row.alert_email === "string" && row.alert_email.trim() ? row.alert_email.trim() : null,
  };
}
