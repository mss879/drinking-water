import type { AnalyticsChannel } from "@/lib/supabase/types";

/**
 * Sorts a visit into a traffic channel from its referrer and campaign tags. AI assistants come first: ChatGPT adds
 * utm_source=chatgpt.com to its links, which would otherwise read as a campaign.
 */
const AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|gemini\.google\.com|bard\.google\.com|copilot\.microsoft\.com|claude\.ai|poe\.com|you\.com|phind\.com|deepseek\.com|grok\.com|meta\.ai|mistral\.ai)$/;
const AI_SOURCES = /chatgpt|openai|perplexity|gemini|copilot|claude|deepseek|grok/;
const SEARCH = /(^|\.)(google|bing|yahoo|duckduckgo|baidu|yandex|ecosia|startpage|qwant|naver|seznam|brave)\.[a-z.]+$|^search\./;
const SOCIAL =
  /(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com|instagram\.com|t\.co|twitter\.com|x\.com|linkedin\.com|lnkd\.in|youtube\.com|youtu\.be|tiktok\.com|pinterest\.[a-z.]+|reddit\.com|whatsapp\.com|wa\.me|threads\.net|snapchat\.com|t\.me|telegram\.org|viber\.com|quora\.com)$/;
const SOCIAL_SOURCES = /^(facebook|fb|instagram|ig|twitter|x|linkedin|youtube|tiktok|pinterest|reddit|whatsapp|wa|threads|telegram|viber|social)$/;
const MAIL = /(^|\.)(mail\.google\.com|outlook\.(live|office|office365)\.com|mail\.yahoo\.com)$/;
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search", "paid-social", "paid_social", "paidsocial", "display", "cpm", "banner", "retargeting", "ads"]);
const SOCIAL_MEDIUMS = new Set(["social", "social-network", "social-media", "social_media", "sm", "organic_social"]);

export function classifyChannel({
  referrerHost,
  utmSource,
  utmMedium,
  paid,
}: {
  referrerHost: string | null;
  utmSource?: string;
  utmMedium?: string;
  paid: boolean;
}): AnalyticsChannel {
  const host = referrerHost?.toLowerCase().replace(/^www\./, "") ?? "";
  const source = utmSource?.toLowerCase().trim() ?? "";
  const medium = utmMedium?.toLowerCase().trim() ?? "";

  if ((host && AI.test(host)) || AI_SOURCES.test(source)) return "ai";
  if (paid || PAID_MEDIUMS.has(medium)) return "paid";
  if (medium === "email" || source === "newsletter" || source === "email" || (host && MAIL.test(host))) return "email";
  if (SOCIAL_MEDIUMS.has(medium) || (host && SOCIAL.test(host)) || SOCIAL_SOURCES.test(source)) return "social";
  if ((host && SEARCH.test(host)) || medium === "organic") return "organic";
  if (host || source) return "referral";
  return "direct";
}
