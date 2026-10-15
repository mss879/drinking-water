import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, type ModelMessage } from "ai";
import { isbot } from "isbot";
import type { NextRequest } from "next/server";
import type { SiteContact } from "@/content/site";
import { readGeo } from "@/lib/analytics/geo";
import { readUserAgent } from "@/lib/analytics/ua";
import { buildSystemPrompt } from "@/lib/chat/ai-context";
import type { ChatSettings } from "@/lib/chat/config";
import { getChatKnowledge } from "@/lib/chat/knowledge";
import { quoteFrom } from "@/lib/chat/quote";
import { assistantAnswers, assistantModel, getChatSettings } from "@/lib/chat/settings";
import {
  addMessage,
  addressKey,
  createSession,
  findSession,
  loadMessages,
  publicState,
  recentMessages,
  toPublic,
  updateSession,
  withinLimit,
  type Service,
} from "@/lib/chat/store";
import { alertPerson, chatTools, flagForPerson, type ToolContext, type ToolEvent } from "@/lib/chat/tools";
import { parseAttribution } from "@/lib/leads";
import { openNow } from "@/lib/local-business";
import { clientAddress, fromThisSite } from "@/lib/same-site";
import { createServiceClient } from "@/lib/supabase/service";
import type { ChatMessage, ChatSession } from "@/lib/supabase/types";

/**
 * The chat's brain (POST /api/chat), and the visitor's window on their own conversation (GET /api/chat).
 *
 * POST { sessionId?, token?, message, action?: "person", page?, attribution? }
 *   1. Checks the request came from this website, isn't a bot, and is within the rate limits.
 *   2. Finds the visitor's chat by id and secret, or starts a new one (the secret is returned once, on creation).
 *   3. Saves the visitor's message to Supabase.
 *   4. If the assistant is answering this chat: builds the system prompt from the admin's live content, gives the
 *      model the conversation and its tools (get_quote, save_lead, email_quote, request_human), runs up to five
 *      steps, and saves the reply with what the tools did. If a team member has taken over, nothing is generated:
 *      their reply arrives through GET. If the assistant is off, the team is told someone is waiting.
 *   5. Returns the new messages and who is answering.
 *
 * GET (headers x-chat-session, x-chat-token; ?since=ISO time) returns the messages since then and who is answering.
 * The widget polls it to show a team member's replies.
 */

export const maxDuration = 60;

/**
 * How long the model may take for one reply (CHAT_AI_TIMEOUT_MS, 25 seconds by default; Netlify allows a function 60).
 * Replies normally take 1–4 seconds; one that runs out of time becomes a short holding message instead of an error,
 * and anything a tool already did (a quote, a saved lead) is kept and acknowledged.
 */
const AI_TIMEOUT_MS = Math.min(Math.max(Number(process.env.CHAT_AI_TIMEOUT_MS) || 25_000, 3_000), 55_000);

const MAX_BODY = 8000;
const MAX_MESSAGE = 1000;
/** A long chat is closed to the assistant, so a script can't run up the OpenAI bill. */
const MAX_MESSAGES = 150;
/**
 * Per connection. Generous, because Sri Lankan mobile networks put many people behind one address (carrier NAT), so
 * these only stop a script; the daily cap below is what bounds the OpenAI bill.
 */
const LIMITS = { messages: [120, 600], newChats: [40, 3600] } as const;
/** Assistant replies a day across the whole site (CHAT_DAILY_LIMIT); past it, chats wait for the team until tomorrow. */
const DAILY_REPLIES = Math.max(Number(process.env.CHAT_DAILY_LIMIT) || 3000, 50);

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

/** Best effort per server instance, for the frequent polls (the database limits guard the expensive POSTs). */
const polls = new Map<string, { count: number; reset: number }>();
function pollingTooFast(key: string) {
  const now = Date.now();
  const entry = polls.get(key);
  if (!entry || entry.reset < now) {
    if (polls.size > 5000) polls.clear();
    polls.set(key, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 90;
}

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim().slice(0, max) : "";

const cleanPath = (value: unknown) => {
  const path = cleanText(value, 300).split(/[?#]/)[0];
  return path.startsWith("/") && !path.startsWith("//") ? path : null;
};

const colomboNow = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

/** What the visitor is told when the team takes it from here: soon while the office is open, the next working day when not. */
function whenTeamReplies(hours: string, opening: string) {
  const open = openNow(hours);
  if (open === true) return `${opening} A team member will join this chat shortly.`;
  if (open === false) return `${opening} Our office is closed right now${hours ? ` (open ${hours})` : ""}, so the team will reply here or call you back on the next working day.`;
  return `${opening} Someone will reply here as soon as they can${hours ? ` (${hours})` : ""}.`;
}

function sorry(contact: SiteContact) {
  const whatsapp = contact.whatsappSales || contact.phones[0];
  return `Sorry, I couldn’t answer that just now. Please try again in a moment${whatsapp ? `, or message our team on WhatsApp at **${whatsapp}**` : ""}.`;
}

/** If the model ended on a tool call without a sentence for the visitor, say what happened. */
function afterTools(events: ToolEvent[], contact: SiteContact) {
  if (events.some((event) => event.type === "lead")) return "Thank you! I’ve passed your details to the LUSAKO team, and they’ll be in touch soon.";
  if (events.some((event) => event.type === "human")) return "I’ve asked a LUSAKO team member to join this chat. They’ll reply here as soon as they can.";
  const quote = events.findLast((event) => event.type === "quote");
  if (quote?.type === "quote") return [...quote.lines.map((line) => `- ${line}`), ...(quote.totals.length ? [`\n**Total: ${quote.totals.join(", ")}** (+ VAT)`] : [])].join("\n");
  return sorry(contact);
}

/** A breakdown or something urgent, in the visitor's words: the team is always told, whatever the model does. */
const URGENT =
  /\b(leaking|leaks|leaked|broken|broke down|break\s?down|not working|stopped working|isn'?t working|won'?t (turn on|work|start)|no water( is)? coming|flood(ing|ed)|emergency|urgent|sparking|smoke|electric shock|burning smell)\b/i;
/** The reply says the team has been (or will be) told: then it must really happen. */
const SAYS_TEAM_TOLD =
  /\bI(?:'ve| have|'ll| will| am going to)\s+(?:also\s+)?(?:notif\w*|alert\w*|let|told|tell|inform\w*|pass\w*|forward\w*|ask\w*|request\w*)\b[^.!?\n]{0,50}\b(team|technician|colleague|someone|person)\b/i;

/** The conversation as the model reads it. A team member's replies are the LUSAKO side too, marked as theirs. */
function toModel(messages: ChatMessage[]): ModelMessage[] {
  return messages.flatMap((message): ModelMessage[] => {
    if (message.role === "user") return [{ role: "user", content: message.content }];
    if (message.role === "assistant") return [{ role: "assistant", content: message.content }];
    if (message.role === "agent") return [{ role: "assistant", content: `[LUSAKO team] ${message.content}` }];
    return [];
  });
}

async function runAssistant(supabase: Service, session: ChatSession, settings: ChatSettings, visitorMessage: string) {
  const [knowledge, history] = await Promise.all([getChatKnowledge(settings.priceMode), recentMessages(supabase, session.id, 40)]);
  const officeOpen = openNow(knowledge.contact.hours);
  const ctx: ToolContext = { supabase, session, settings, knowledge, events: [], lastVisitorMessage: visitorMessage, officeOpen };
  const profile = (session.profile ?? {}) as Record<string, unknown>;
  const system = buildSystemPrompt({
    settings,
    knowledge,
    state: {
      now: colomboNow(),
      pagePath: session.page_path,
      greeting: settings.greeting,
      visitor: { name: session.visitor_name, phone: session.phone, email: session.email, company: session.company, location: session.location },
      leadSaved: Boolean(session.lead_id),
      personRequested: Boolean(session.handover_requested_at),
      officeOpen,
      teamJoinedBefore: history.some((message) => message.role === "agent"),
      hasQuote: Boolean(quoteFrom(profile.quote)),
    },
  });

  const model = assistantModel();
  const started = Date.now();
  try {
    const result = await generateText({
      // Chat Completions: nothing is stored at OpenAI between turns; the conversation lives in Supabase.
      model: openai.chat(model),
      system,
      messages: toModel(history),
      tools: chatTools(ctx),
      // Up to five steps: tool calls (a quote, saving the lead, an email) and then the reply.
      stopWhen: stepCountIs(5),
      maxOutputTokens: 900,
      temperature: 0.3,
      maxRetries: 1,
      timeout: { totalMs: AI_TIMEOUT_MS },
    });
    let text = result.text.replace(/^\[LUSAKO team\]\s*/i, "").trim() || afterTools(ctx.events, knowledge.contact);

    // Safety net: a breakdown always reaches the team, and so does anything the reply says it passed on.
    if (!ctx.events.some((event) => event.type === "human" || event.type === "lead")) {
      if (URGENT.test(visitorMessage)) await flagForPerson(ctx, "Possible breakdown or urgent problem (flagged automatically)");
      else if (SAYS_TEAM_TOLD.test(text)) await flagForPerson(ctx, "The assistant told the visitor the team would follow up (flagged automatically)");
    }
    // Someone will follow up: make sure they can be called back (unless they've given a number already).
    const numberGiven =
      Boolean(ctx.session.phone) || history.some((message) => message.role === "user" && /\+?\d[\d\s()-]{7,}\d/.test(message.content));
    const asksForNumber = /\b(your|a)\s+(phone|mobile|contact|whatsapp)?\s*number\b|\bphone number\b|\bshare your\b/i.test(text);
    if (ctx.events.some((event) => event.type === "human") && !numberGiven && !asksForNumber) {
      text += "\n\nIf you’d like a call back, please share your name and phone number.";
    }
    return addMessage(supabase, session.id, {
      role: "assistant",
      content: text,
      meta: {
        model,
        ms: Date.now() - started,
        steps: result.steps.length,
        usage: { input: result.totalUsage.inputTokens ?? null, output: result.totalUsage.outputTokens ?? null },
        events: ctx.events,
      },
    });
  } catch (error) {
    console.error("[chat] the assistant failed:", error);
    return addMessage(supabase, session.id, {
      role: "assistant",
      content: ctx.events.length ? afterTools(ctx.events, knowledge.contact) : sorry(knowledge.contact),
      meta: { model, ms: Date.now() - started, error: String(error).slice(0, 300), events: ctx.events },
    });
  }
}

export async function POST(request: NextRequest) {
  if (!fromThisSite(request)) return json({ error: "forbidden" }, 403);
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || isbot(ua)) return json({ error: "forbidden" }, 403);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: "too-large" }, 413);
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "bad-request" }, 400);
  }

  const [settings, supabase] = [await getChatSettings(), createServiceClient()];
  if (!settings || !supabase || !settings.widgetEnabled) return json({ error: "unavailable" }, 503);

  const person = body.action === "person";
  const content = person ? "I’d like to talk to a person, please." : cleanText(body.message, MAX_MESSAGE);
  if (!content) return json({ error: "empty" }, 400);

  const key = addressKey(clientAddress(request));
  if (key && !(await withinLimit(supabase, `chat:${key}`, ...LIMITS.messages))) {
    return json({ error: "slow-down", message: "You’ve sent a lot of messages in a short time. Please wait a few minutes and try again." }, 429);
  }

  let session = await findSession(supabase, body.sessionId, body.token);
  let token: string | undefined;
  if (!session) {
    if (key && !(await withinLimit(supabase, `chat-new:${key}`, ...LIMITS.newChats))) {
      return json({ error: "slow-down", message: "Please wait a little before starting another chat." }, 429);
    }
    const attribution = parseAttribution(JSON.stringify(body.attribution ?? {}));
    const { device, browser, os } = readUserAgent(ua, {
      mobile: request.headers.get("sec-ch-ua-mobile"),
      platform: request.headers.get("sec-ch-ua-platform"),
    });
    const geo = readGeo(request.headers, null);
    const created = await createSession(supabase, {
      pagePath: cleanPath(body.page) ?? attribution.pagePath,
      referrer: attribution.referrer,
      utm: Object.keys(attribution.utm).length || attribution.landingPath ? { ...attribution.utm, ...(attribution.landingPath ? { landing_path: attribution.landingPath } : {}) } : null,
      visitorId: attribution.visitorId,
      analyticsSessionId: attribution.sessionId,
      context: { device, browser, os, country: geo.country, city: geo.city },
    });
    if (!created) return json({ error: "unavailable" }, 503);
    ({ session, token } = created);
  }

  if (session.message_count >= MAX_MESSAGES) {
    return json({ error: "full", message: "This chat is full. Please start a new chat, or call or WhatsApp our team." }, 429);
  }

  const visitorMessage = await addMessage(supabase, session.id, { role: "user", content });
  if (!visitorMessage) return json({ error: "unavailable" }, 503);
  session = { ...session, status: "open" };

  const replies: (ChatMessage | null)[] = [];
  // The assistant answers when it's switched on, has its key, and the site is within today's replies.
  const answers =
    assistantAnswers(settings) && (person || !session.ai_enabled || (await withinLimit(supabase, "chat-ai-day", DAILY_REPLIES, 86_400)));
  const notify = async (reason: string) => {
    if (session!.handover_requested_at) return;
    const fields = { handover_requested_at: new Date().toISOString(), handover_reason: reason };
    session = { ...session!, ...fields };
    await updateSession(supabase, session.id, fields);
    const knowledge = await getChatKnowledge(settings.priceMode);
    alertPerson({ supabase, session, settings, knowledge, events: [], lastVisitorMessage: content }, reason);
  };

  if (person && !session.ai_enabled) {
    // Someone is already answering this chat: they'll see the message.
  } else if (person) {
    const firstAsk = !session.handover_requested_at;
    await notify("Pressed “Talk to a person” in the chat");
    if (firstAsk) {
      const { contact } = await getChatKnowledge(settings.priceMode);
      replies.push(
        await addMessage(supabase, session.id, {
          role: "system",
          content: `${whenTeamReplies(contact.hours, "We’ve let the LUSAKO team know you’d like to talk to a person.")}${answers ? " The assistant can keep helping in the meantime." : ""}`,
        }),
      );
    }
  } else if (!session.ai_enabled) {
    // A team member is answering this chat: their reply arrives through GET.
  } else if (!answers) {
    // The assistant is switched off (or past today's replies): the first message tells the team someone is waiting.
    const first = !session.handover_requested_at;
    await notify(
      assistantAnswers(settings)
        ? "The assistant reached today's reply limit, so this visitor is waiting for the team"
        : "The assistant is switched off, so this visitor is waiting for the team",
    );
    if (first) {
      const { contact } = await getChatKnowledge(settings.priceMode);
      replies.push(
        await addMessage(supabase, session.id, {
          role: "system",
          content: `${whenTeamReplies(contact.hours, "Thanks for your message!")} If you’d like a call back, add your name and phone number.`,
        }),
      );
    }
  } else {
    replies.push(await runAssistant(supabase, session, settings, content));
    // The tools may have changed the chat (a request for a person, for example); read it back for the state.
    session = (await findSessionById(supabase, session.id)) ?? session;
  }

  return json({
    sessionId: session.id,
    ...(token && { token }),
    messages: [visitorMessage, ...replies].filter((message): message is ChatMessage => message !== null).map((message) => toPublic(message, settings.assistantName)),
    state: publicState(session, settings),
  });
}

async function findSessionById(supabase: Service, id: string) {
  const { data } = await supabase.from("chat_sessions").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function GET(request: NextRequest) {
  if (!fromThisSite(request)) return json({ error: "forbidden" }, 403);
  const key = addressKey(clientAddress(request)) ?? "unknown";
  if (pollingTooFast(key)) return json({ error: "slow-down" }, 429);

  const [settings, supabase] = [await getChatSettings(), createServiceClient()];
  if (!settings || !supabase) return json({ error: "unavailable" }, 503);
  const session = await findSession(supabase, request.headers.get("x-chat-session"), request.headers.get("x-chat-token"));
  if (!session) return json({ error: "not-found" }, 404);

  const messages = await loadMessages(supabase, session.id, request.nextUrl.searchParams.get("since"));
  return json({
    messages: messages.map((message) => toPublic(message, settings.assistantName)),
    state: publicState(session, settings),
  });
}
