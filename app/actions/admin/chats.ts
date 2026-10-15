"use server";

import { revalidatePath, updateTag } from "next/cache";
import { chatLimits } from "@/lib/chat/config";
import { friendlyError, requireAdmin, type ActionResult } from "@/lib/admin/auth";
import { CMS_TAG } from "@/lib/supabase/public";
import type { ChatMessage, ChatPriceMode } from "@/lib/supabase/types";

/**
 * The admin's chat actions: take a chat over from the assistant (the assistant goes quiet in that chat), reply,
 * hand it back, close, delete, put the visitor in the CRM, and save the assistant's settings. Every action checks the
 * admin first, and row level security has the final say.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{9,18}$/;
const isId = (value: unknown): value is string => typeof value === "string" && UUID.test(value);
const text = (value: unknown, max: number) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);
const ids = (values: unknown) => (Array.isArray(values) ? values.filter(isId).slice(0, 200) : []);

function refresh() {
  revalidatePath("/admin/chats");
}

/** Stop the assistant in this chat and answer it yourself. The visitor sees that you joined. */
export async function takeOverChat(id: string, agentName: string): Promise<ActionResult> {
  const { admin, supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "That chat no longer exists." };
  const name = text(agentName, 40) ?? "LUSAKO team";

  const { data: session, error: readError } = await supabase.from("chat_sessions").select("ai_enabled, agent_id, agent_name").eq("id", id).maybeSingle();
  if (readError || !session) return { ok: false, error: friendlyError(readError, "That chat no longer exists.") };

  const { error } = await supabase
    .from("chat_sessions")
    .update({ ai_enabled: false, agent_id: admin.id, agent_name: name, handover_requested_at: null, admin_unread: false, status: "open" })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };

  if (session.ai_enabled || session.agent_id !== admin.id || session.agent_name !== name) {
    const who = name === "LUSAKO team" ? "A member of the LUSAKO team" : `${name} from LUSAKO`;
    await supabase.from("chat_messages").insert({ session_id: id, role: "system", content: `${who} joined the chat.` });
  }
  refresh();
  return { ok: true, message: "You’re answering this chat. The assistant is off for it." };
}

/** Let the assistant answer this chat again. */
export async function handBackChat(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "That chat no longer exists." };
  const { error } = await supabase
    .from("chat_sessions")
    .update({ ai_enabled: true, agent_id: null, agent_name: null, handover_requested_at: null })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  await supabase.from("chat_messages").insert({ session_id: id, role: "system", content: "You’re chatting with the LUSAKO assistant again." });
  refresh();
  return { ok: true, message: "The assistant is answering this chat again." };
}

/** Send a message to the visitor as yourself. Takes the chat over first if the assistant was still answering. */
export async function sendChatReply(id: string, body: string, agentName: string): Promise<ActionResult<ChatMessage>> {
  const { admin, supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "That chat no longer exists." };
  const content = typeof body === "string" ? body.replace(/\r\n?/g, "\n").trim().slice(0, 2000) : "";
  if (!content) return { ok: false, error: "Write a message first." };
  const name = text(agentName, 40) ?? "LUSAKO team";

  const { data: session } = await supabase.from("chat_sessions").select("ai_enabled").eq("id", id).maybeSingle();
  if (!session) return { ok: false, error: "That chat no longer exists." };
  if (session.ai_enabled) {
    const taken = await takeOverChat(id, name);
    if (!taken.ok) return taken;
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ session_id: id, role: "agent", content, author_id: admin.id, author_name: name })
    .select("*")
    .single();
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, data };
}

/** The visitor's request for a person has been dealt with (without taking the chat over). */
export async function dismissChatRequest(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "That chat no longer exists." };
  const { error } = await supabase.from("chat_sessions").update({ handover_requested_at: null }).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true };
}

export async function markChatRead(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "That chat no longer exists." };
  const { error } = await supabase.from("chat_sessions").update({ admin_unread: false }).eq("id", id).eq("admin_unread", true);
  if (error) return { ok: false, error: friendlyError(error) };
  return { ok: true };
}

/** Closed chats leave the open list; a visitor writing again reopens theirs. */
export async function setChatsStatus(chatIds: string[], status: "open" | "closed"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = ids(chatIds);
  if (!list.length || (status !== "open" && status !== "closed")) return { ok: false, error: "Choose a chat first." };
  const { error } = await supabase
    .from("chat_sessions")
    .update(status === "closed" ? { status, handover_requested_at: null, admin_unread: false } : { status })
    .in("id", list);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: status === "closed" ? (list.length === 1 ? "Chat closed." : `${list.length} chats closed.`) : "Chat reopened." };
}

/** Removes chats and their messages for good. Leads already in the CRM stay there. */
export async function deleteChats(chatIds: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = ids(chatIds);
  if (!list.length) return { ok: false, error: "Choose a chat first." };
  const { error } = await supabase.from("chat_sessions").delete().in("id", list);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: list.length === 1 ? "Chat deleted." : `${list.length} chats deleted.` };
}

export type VisitorDetails = { name: string; phone: string; email: string; company: string; location: string };

/** Correct or add the visitor's details (for example what they told you after you took over). */
export async function saveChatVisitor(id: string, input: VisitorDetails): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "That chat no longer exists." };
  const email = text(input.email, 160);
  if (email && !EMAIL.test(email)) return { ok: false, error: "That email address doesn’t look right." };
  const phone = text(input.phone, 40);
  if (phone && !PHONE.test(phone)) return { ok: false, error: "That phone number doesn’t look right." };
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      visitor_name: text(input.name, 120),
      phone,
      email: email?.toLowerCase() ?? null,
      company: text(input.company, 160),
      location: text(input.location, 160),
    })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refresh();
  return { ok: true, message: "Details saved." };
}

/** Puts the chat's visitor in the CRM's New Leads (or updates the lead they have). Needs a name and a phone or email. */
export async function addChatToCrm(id: string): Promise<ActionResult<string>> {
  const { admin, supabase } = await requireAdmin();
  if (!isId(id)) return { ok: false, error: "That chat no longer exists." };
  const { data: session, error: readError } = await supabase.from("chat_sessions").select("*").eq("id", id).maybeSingle();
  if (readError || !session) return { ok: false, error: friendlyError(readError, "That chat no longer exists.") };
  if (!session.visitor_name) return { ok: false, error: "Add the visitor’s name first (Visitor details)." };
  if (!session.phone && !session.email) return { ok: false, error: "Add a phone number or email first (Visitor details)." };

  const profile = (session.profile ?? {}) as Record<string, unknown>;
  const interest = typeof profile.interest === "string" ? profile.interest : null;
  const note = [session.summary, `Added to the CRM from the website chat by ${admin.email}.`].filter(Boolean).join("\n\n");
  const { data: leadId, error } = await supabase.rpc("chat_save_lead", {
    p_session_id: id,
    p_lead: {
      name: session.visitor_name,
      email: session.email,
      phone: session.phone,
      company: session.company,
      location: session.location,
      interest,
      priority: typeof profile.priority === "string" ? profile.priority : "medium",
    },
    p_note: note,
  });
  if (error || !leadId) return { ok: false, error: friendlyError(error) };
  refresh();
  revalidatePath("/admin/crm");
  return { ok: true, data: leadId, message: "Added to the CRM (New Leads)." };
}

/** The chats a CRM lead came from, newest first (for the lead's "Website chat" button). */
export async function getLeadChats(leadId: string): Promise<ActionResult<{ id: string; created_at: string }[]>> {
  const { supabase } = await requireAdmin();
  if (!isId(leadId)) return { ok: true, data: [] };
  const { data, error } = await supabase.from("chat_sessions").select("id, created_at").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(5);
  if (error) return { ok: true, data: [] };
  return { ok: true, data };
}

export type ChatSettingsInput = {
  widgetEnabled: boolean;
  aiEnabled: boolean;
  assistantName: string;
  greeting: string;
  teaser: string;
  quickReplies: string[];
  priceMode: ChatPriceMode;
  contactFirst: boolean;
  emailQuotes: boolean;
  instructions: string;
  alertEmail: string;
};

export async function saveChatSettings(input: ChatSettingsInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const name = text(input.assistantName, chatLimits.name);
  if (!name) return { ok: false, error: "Give the assistant a name." };
  const greeting = text(input.greeting, chatLimits.greeting);
  if (!greeting) return { ok: false, error: "Write the greeting visitors see first." };
  const alertEmail = text(input.alertEmail, 160);
  if (alertEmail && !EMAIL.test(alertEmail)) return { ok: false, error: "The alert email address doesn’t look right." };
  if (!["all", "shown", "none"].includes(input.priceMode)) return { ok: false, error: "Choose which prices the assistant may quote." };
  const quickReplies = (Array.isArray(input.quickReplies) ? input.quickReplies : [])
    .map((reply) => text(reply, chatLimits.quickReply))
    .filter((reply): reply is string => Boolean(reply))
    .slice(0, chatLimits.quickReplies);

  const { error } = await supabase
    .from("chat_settings")
    .update({
      widget_enabled: Boolean(input.widgetEnabled),
      ai_enabled: Boolean(input.aiEnabled),
      assistant_name: name,
      greeting,
      teaser: text(input.teaser, chatLimits.teaser) ?? "",
      quick_replies: quickReplies,
      price_mode: input.priceMode,
      contact_first: Boolean(input.contactFirst),
      email_quotes: Boolean(input.emailQuotes),
      instructions: typeof input.instructions === "string" ? input.instructions.trim().slice(0, chatLimits.instructions) : "",
      alert_email: alertEmail,
    })
    .eq("id", true);
  if (error) return { ok: false, error: friendlyError(error) };

  // The website reads these through the cms cache: refresh it so the change shows at once.
  updateTag(CMS_TAG);
  revalidatePath("/admin/chats", "layout");
  return { ok: true, message: "Assistant settings saved." };
}
