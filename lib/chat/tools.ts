import "server-only";
import { tool } from "ai";
import { after } from "next/server";
import { z } from "zod";
import { site } from "@/content/site";
import type { ChatSettings } from "@/lib/chat/config";
import { emailConfigured, sendEmail } from "@/lib/chat/email";
import { quoteEmail, teamAlertEmail, type AlertDetails } from "@/lib/chat/email-template";
import type { ChatKnowledge } from "@/lib/chat/knowledge";
import { buildQuote, provinceIds, quoteFrom, quoteLines, quoteMarkdown, quoteTotals, quoteValue, type Quote } from "@/lib/chat/quote";
import { updateSession, type Service } from "@/lib/chat/store";
import type { ChatSession, Json } from "@/lib/supabase/types";

/**
 * The assistant's tools. Each one works only on the visitor's own chat (the context is bound to it on the server),
 * so nothing a visitor types can reach another chat or lead. Like the Sponge proposal tool, prices are worked out
 * here in code, never by the model.
 *
 *   get_quote      works out prices and totals from the admin's prices, and keeps the quote on the chat
 *   save_lead      saves the visitor's details and puts them in the CRM (New Leads), or updates their lead
 *   email_quote    emails the visitor the quote (Resend); on failure the assistant gives it in the chat
 *   request_human  tells the team the visitor wants a person
 */

export type ToolEvent =
  | { type: "quote"; lines: string[]; totals: string[] }
  | { type: "lead"; leadId: string; created: boolean }
  | { type: "lead_failed"; reason: string }
  | { type: "email"; sent: boolean; reason?: string }
  | { type: "human"; reason: string };

export type ToolContext = {
  supabase: Service;
  /** The chat, kept up to date as the tools change it. */
  session: ChatSession;
  settings: ChatSettings;
  knowledge: ChatKnowledge;
  /** What the tools did, saved with the assistant's reply for the admin. */
  events: ToolEvent[];
  /** The visitor's latest message, for the team's alert. */
  lastVisitorMessage: string;
  /** The office is open right now; null when the opening hours can't be read. */
  officeOpen?: boolean | null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{9,18}$/;

const needLabels = {
  buy: "Buy",
  rent: "Rent",
  corporate: "Corporate hydration",
  amc: "AMC",
  service: "Service",
  parts: "Filters & parts",
  not_sure: "Not sure yet",
} as const;

const customerLabels = { home: "Home", office: "Office", organisation: "Organisation" } as const;
const waterLabels = { city: "City (mains) water", well: "Well water", other: "Other water source", unknown: "Water source not known" } as const;

type Profile = Record<string, unknown> & { quote?: unknown; emailsSent?: number };

const profileOf = (session: ChatSession): Profile =>
  session.profile && typeof session.profile === "object" && !Array.isArray(session.profile) ? (session.profile as Profile) : {};

export function chatAdminUrl(id: string) {
  return new URL(`/admin/chats?id=${id}`, site.url).toString();
}

/** Emails the team, after the visitor has their reply. */
function alertTeam(ctx: ToolContext, kind: AlertDetails["kind"], extra: Partial<AlertDetails> = {}) {
  const to = ctx.settings.alertEmail || ctx.knowledge.contact.salesEmail;
  if (!to || !emailConfigured()) return;
  const session = ctx.session;
  const profile = profileOf(session);
  const email = teamAlertEmail({
    kind,
    chatUrl: chatAdminUrl(session.id),
    name: session.visitor_name,
    phone: session.phone,
    email: session.email,
    company: session.company,
    location: session.location,
    interest: typeof profile.interest === "string" ? profile.interest : null,
    summary: session.summary,
    reason: null,
    quote: quoteFrom(profile.quote),
    lastMessage: null,
    ...extra,
  });
  after(() => sendEmail({ to, ...email }));
}

/** The website's analytics count the chat lead as a conversion, like a form. */
function recordConversion(ctx: ToolContext) {
  const { visitor_id: visitorId, analytics_session_id: sessionId, page_path: path } = ctx.session;
  if (!visitorId || !sessionId) return;
  after(async () => {
    const { error } = await ctx.supabase.rpc("analytics_ingest", {
      p: { session: { id: sessionId, visitor_id: visitorId }, items: [{ type: "event", name: "generate_lead", path, props: { form_type: "chat" } }] },
    });
    if (error) console.error("[chat] couldn't record the conversion:", error.message);
  });
}

async function saveProfile(ctx: ToolContext, patch: Profile, fields: Partial<ChatSession> = {}) {
  const profile = { ...profileOf(ctx.session), ...patch };
  ctx.session = { ...ctx.session, ...fields, profile: profile as Json };
  return updateSession(ctx.supabase, ctx.session.id, { ...fields, profile: profile as Json });
}

export function chatTools(ctx: ToolContext) {
  return {
    get_quote: tool({
      description:
        "Work out prices and totals for what the visitor is considering: buying or renting purifiers, rental plans, AMC plans for their purifiers, or filters and parts. Use it for any total, any quantity above one, or any rental first-month cost. Returns `text`, the quote ready to show: paste it into your reply exactly as it is.",
      inputSchema: z.object({
        items: z
          .array(
            z.object({
              kind: z.enum(["buy", "rent", "amc", "part"]).describe("buy or rent a purifier, an AMC plan, or a filter/part"),
              product: z.string().max(80).optional().describe("Purifier name for buy or rent, as in the knowledge, e.g. AquaElite 3X"),
              plan: z
                .string()
                .max(80)
                .optional()
                .describe("A rental plan (PureFlow UF, PureFlow RO, AquaSpark) when renting without a specific purifier, or an AMC plan (Essential, Complete, Maximum)"),
              option: z.enum(["UF", "RO"]).optional().describe("The purification option, if known"),
              part: z.string().max(80).optional().describe("Filter or part name, as in the knowledge"),
              quantity: z.number().int().min(1).max(500).optional().describe("How many (default 1)"),
            }),
          )
          .min(1)
          .max(8),
        province: z.enum(provinceIds).optional().describe("For rentals: the province the purifiers will be in"),
      }),
      execute: async ({ items, province }) => {
        const quote: Quote = buildQuote({ items, province }, ctx.knowledge.catalog, ctx.knowledge.prices);
        const lines = quoteLines(quote);
        const totals = quoteTotals(quote);
        ctx.events.push({ type: "quote", lines, totals });
        await saveProfile(ctx, { quote });
        return { text: quoteMarkdown(quote), lines, totals, notes: quote.notes, notFound: quote.unmatched };
      },
    }),

    save_lead: tool({
      description:
        "Save the visitor for the LUSAKO sales team once you have their name, a phone number or email, what they need and where they are. It adds them to the team's pipeline, or updates their earlier details. Call it again whenever you learn more.",
      inputSchema: z.object({
        name: z.string().min(1).max(120).describe("The visitor's name"),
        phone: z.string().max(40).optional().describe("Phone number as they gave it, ideally a Sri Lankan mobile"),
        email: z.string().max(160).optional().describe("Email address, if given"),
        company: z.string().max(160).optional().describe("Company or organisation name, for businesses"),
        location: z.string().min(1).max(160).describe("City or town, plus province if known"),
        need: z.enum(["buy", "rent", "corporate", "amc", "service", "parts", "not_sure"]).describe("What they want"),
        customerType: z.enum(["home", "office", "organisation"]).optional(),
        products: z
          .array(z.string().max(80))
          .max(6)
          .optional()
          .describe("Always list the purifiers, rental plans, AMC plans or parts discussed, named as in the knowledge (e.g. PureFlow UF, AquaElite 3X RO)"),
        units: z.number().int().min(1).max(10000).optional().describe("Number of purifiers or units"),
        people: z.number().int().min(1).max(1000000).optional().describe("Number of people or employees who will use them"),
        waterSource: z.enum(["city", "well", "other", "unknown"]).optional(),
        timeline: z.string().max(80).optional().describe("When they need it, in their words"),
        priority: z
          .enum(["high", "medium", "low"])
          .describe("high: ready to buy or rent soon, or several units; medium: interested; low: just researching"),
        summary: z
          .string()
          .min(10)
          .max(1200)
          .describe("For the sales team: what they want, quantities, location, water source, prices quoted and the agreed next step"),
      }),
      execute: async (input) => {
        const phone = input.phone?.trim() && PHONE.test(input.phone.trim()) ? input.phone.trim() : null;
        const email = input.email?.trim() && EMAIL.test(input.email.trim()) ? input.email.trim().toLowerCase() : null;
        if (!phone && !email) {
          return { saved: false, missing: "a valid phone number or email address: ask the visitor for one" };
        }

        const firstTime = !ctx.session.lead_id;
        const previousSummary = ctx.session.summary;
        const profile = profileOf(ctx.session);
        const quote = quoteFrom(profile.quote);
        // What they're interested in: as the assistant named it, else what the chat's quote was for.
        const quoted = quote?.lines
          .filter((line) => line.label !== "One-time initial payment" && line.label !== "Regional Hydration Service")
          .map((line) => line.label.replace(/ (rental|AMC)$/, ""));
        const products = input.products?.length ? input.products : quoted?.length ? [...new Set(quoted)].slice(0, 3) : undefined;
        // "Rent · PureFlow UF × 3", the CRM card's one-line interest.
        const interest = `${[needLabels[input.need], products?.length ? products.join(", ") : null].filter(Boolean).join(" · ")}${
          input.units ? ` × ${input.units}` : ""
        }`.slice(0, 200);

        const people = input.people ? `${input.people} ${input.people === 1 ? "person" : "people"}` : null;
        const units = input.units ? `${input.units} ${input.units === 1 ? "unit" : "units"}` : null;
        const details = [
          input.customerType && `Customer: ${[customerLabels[input.customerType], people, units].filter(Boolean).join(", ")}`,
          !input.customerType && (people || units) && `Size: ${[people, units].filter(Boolean).join(", ")}`,
          input.waterSource && `Water: ${waterLabels[input.waterSource]}`,
          input.timeline && `When: ${input.timeline}`,
          quote && `Quoted in the chat: ${[...quoteLines(quote), ...(quoteTotals(quote).length ? [`Total ${quoteTotals(quote).join(", ")}`] : [])].join("; ")}`,
          `Chat: ${chatAdminUrl(ctx.session.id)}`,
        ].filter(Boolean);
        const note = [input.summary.trim(), "", ...details].join("\n").slice(0, 4800);

        await saveProfile(
          ctx,
          {
            interest,
            need: input.need,
            customerType: input.customerType ?? profile.customerType,
            products: products ?? profile.products,
            units: input.units ?? profile.units,
            people: input.people ?? profile.people,
            waterSource: input.waterSource ?? profile.waterSource,
            timeline: input.timeline ?? profile.timeline,
            priority: input.priority,
          },
          {
            visitor_name: input.name.trim().slice(0, 120),
            phone: phone ?? ctx.session.phone,
            email: email ?? ctx.session.email,
            company: input.company?.trim().slice(0, 160) || ctx.session.company,
            location: input.location.trim().slice(0, 160),
            summary: input.summary.trim().slice(0, 2000),
          },
        );

        const { data: leadId, error } = await ctx.supabase.rpc("chat_save_lead", {
          p_session_id: ctx.session.id,
          p_lead: {
            name: input.name.trim(),
            email,
            phone,
            company: input.company?.trim() || null,
            location: input.location.trim(),
            interest,
            priority: input.priority,
            value: quoteValue(quote),
          },
          // A new lead's notes, or a note on its timeline when the assistant's summary changed.
          p_note: firstTime || input.summary.trim() !== previousSummary ? note : null,
        });
        if (error || !leadId) {
          console.error("[chat] couldn't save the lead:", error?.code, error?.message);
          ctx.events.push({ type: "lead_failed", reason: error?.message ?? "no lead id" });
          return { saved: false, error: "The details couldn't be saved just now." };
        }

        ctx.session = { ...ctx.session, lead_id: leadId, qualified_at: ctx.session.qualified_at ?? new Date().toISOString() };
        ctx.events.push({ type: "lead", leadId, created: firstTime });
        if (firstTime) {
          alertTeam(ctx, "lead");
          recordConversion(ctx);
        }
        return { saved: true, firstTime };
      },
    }),

    email_quote: tool({
      description:
        "Email the visitor the quote worked out in this chat (call get_quote first). Use it only when they ask for the quote by email and have given their email address.",
      inputSchema: z.object({ email: z.string().max(160).describe("The visitor's email address") }),
      execute: async ({ email }) => {
        const address = email.trim().toLowerCase();
        const fail = (reason: string) => {
          ctx.events.push({ type: "email", sent: false, reason });
          return { sent: false, reason };
        };
        if (!EMAIL.test(address)) return fail("That email address doesn't look right: ask the visitor to check it.");
        if (!ctx.settings.emailQuotes || !emailConfigured()) return fail("Email isn't available: give the quote in the chat.");
        const profile = profileOf(ctx.session);
        const quote = quoteFrom(profile.quote);
        if (!quote) return fail("No quote yet: call get_quote first.");
        const sent = typeof profile.emailsSent === "number" ? profile.emailsSent : 0;
        if (sent >= 3) return fail("Enough emails were sent from this chat: give the quote in the chat.");

        const result = await sendEmail({ to: address, ...quoteEmail({ name: ctx.session.visitor_name, quote, contact: ctx.knowledge.contact }) });
        if (!result.ok) return fail("The email couldn't be sent: give the quote in the chat.");
        await saveProfile(ctx, { emailsSent: sent + 1 }, ctx.session.email ? {} : { email: address });
        // The visitor's CRM lead gains the address too, if it has none yet.
        if (ctx.session.lead_id) {
          const { error } = await ctx.supabase.from("crm_leads").update({ email: address }).eq("id", ctx.session.lead_id).or("email.is.null,email.eq.");
          if (error) console.error("[chat] couldn't add the email to the lead:", error.message);
        }
        ctx.events.push({ type: "email", sent: true });
        return { sent: true };
      },
    }),

    request_human: tool({
      description:
        "Tell the LUSAKO team this visitor wants or needs a person: they asked for one, are unhappy, report a breakdown, or need something you can't settle (special prices, contract terms, a custom corporate deal). A team member can then join this chat.",
      inputSchema: z.object({ reason: z.string().min(3).max(300).describe("Why, in a few words, for the team") }),
      execute: async ({ reason }) => {
        await flagForPerson(ctx, reason);
        return { requested: true, officeOpenNow: ctx.officeOpen ?? "unknown", openingHours: ctx.knowledge.contact.hours };
      },
    }),
  };
}

/**
 * Flags the chat as waiting for a person and emails the team (the first time). request_human does this, and so does the
 * route's safety net when the model forgets to.
 */
export async function flagForPerson(ctx: ToolContext, reason: string) {
  const already = Boolean(ctx.session.handover_requested_at);
  const fields = { handover_requested_at: ctx.session.handover_requested_at ?? new Date().toISOString(), handover_reason: reason.trim().slice(0, 300) };
  ctx.session = { ...ctx.session, ...fields };
  await updateSession(ctx.supabase, ctx.session.id, fields);
  ctx.events.push({ type: "human", reason: fields.handover_reason });
  if (!already) alertTeam(ctx, "person", { reason: fields.handover_reason, lastMessage: ctx.lastVisitorMessage.slice(0, 500) });
}

/** Lets the route tell the team a visitor wants a person when the request didn't come through the assistant. */
export function alertPerson(ctx: ToolContext, reason: string) {
  alertTeam(ctx, "person", { reason, lastMessage: ctx.lastVisitorMessage.slice(0, 500) });
}
