import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { ChatSettings } from "@/lib/chat/config";
import { assistantAnswers } from "@/lib/chat/settings";
import { isMissingSchema } from "@/lib/supabase/errors";
import type { createServiceClient } from "@/lib/supabase/service";
import type { ChatMode, PublicMessage, PublicState } from "@/lib/chat/types";
import type { ChatMessage, ChatRole, ChatSession, Database, Json } from "@/lib/supabase/types";

type ChatSessionUpdate = Database["public"]["Tables"]["chat_sessions"]["Update"];

/**
 * Reading and writing chats for the website (the visitor's side). Each conversation belongs to the browser that
 * started it: the browser keeps a random secret, the database keeps its SHA-256, and every request must present both
 * the chat's id and that secret. Nothing here ever returns another visitor's chat, or the assistant's notes.
 */

export type Service = NonNullable<ReturnType<typeof createServiceClient>>;


const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** The chat, if the id and secret match; null otherwise (unknown, deleted, or someone else's). */
export async function findSession(supabase: Service, id: unknown, token: unknown): Promise<ChatSession | null> {
  if (!isUuid(id) || typeof token !== "string" || !TOKEN.test(token)) return null;
  const { data, error } = await supabase.from("chat_sessions").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (!isMissingSchema(error)) console.error("[chat] couldn't load a chat:", error.message);
    return null;
  }
  if (!data) return null;
  const expected = Buffer.from(data.token_hash, "hex");
  const given = Buffer.from(hashToken(token), "hex");
  return expected.length === given.length && timingSafeEqual(expected, given) ? data : null;
}

export type SessionStart = {
  pagePath: string | null;
  referrer: string | null;
  utm: Record<string, string> | null;
  visitorId: string | null;
  analyticsSessionId: string | null;
  context: Record<string, string | null>;
};

export async function createSession(supabase: Service, start: SessionStart) {
  const token = newToken();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      token_hash: hashToken(token),
      page_path: start.pagePath,
      referrer: start.referrer,
      utm: start.utm,
      visitor_id: start.visitorId,
      analytics_session_id: start.analyticsSessionId,
      context: start.context as Json,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[chat] couldn't start a chat:", error.code, error.message);
    return null;
  }
  return { session: data, token };
}

export async function addMessage(
  supabase: Service,
  sessionId: string,
  message: { role: ChatRole; content: string; meta?: Record<string, unknown> },
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, role: message.role, content: message.content.slice(0, 8000), meta: (message.meta ?? {}) as Json })
    .select("*")
    .single();
  if (error) {
    console.error("[chat] couldn't save a message:", error.code, error.message);
    return null;
  }
  return data;
}

/** The chat's messages in order: all of them, or those since a moment (with a few seconds' overlap; the browser drops repeats). */
export async function loadMessages(supabase: Service, sessionId: string, since?: string | null, limit = 200) {
  let query = supabase.from("chat_messages").select("*").eq("session_id", sessionId);
  const from = since ? Date.parse(since) : NaN;
  if (Number.isFinite(from)) query = query.gte("created_at", new Date(from - 10_000).toISOString());
  const { data, error } = await query.order("created_at", { ascending: true }).limit(limit);
  if (error) {
    console.error("[chat] couldn't load messages:", error.message);
    return [];
  }
  return data;
}

/** The latest messages for the assistant, oldest first. */
export async function recentMessages(supabase: Service, sessionId: string, limit = 40) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[chat] couldn't load the conversation:", error.message);
    return [];
  }
  return data.reverse();
}

export function toPublic(message: ChatMessage, assistantName: string): PublicMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    author: message.role === "assistant" ? assistantName : message.role === "agent" ? message.author_name || "LUSAKO team" : null,
    // Always UTC, so the browser can order and compare them as text.
    at: new Date(message.created_at).toISOString(),
  };
}

export function publicState(session: ChatSession, settings: ChatSettings): PublicState {
  const mode: ChatMode = !session.ai_enabled ? "human" : assistantAnswers(settings) ? "ai" : "team";
  return { mode, waiting: mode !== "human" && Boolean(session.handover_requested_at), agentName: mode === "human" ? session.agent_name : null };
}

export async function updateSession(supabase: Service, id: string, changes: Omit<ChatSessionUpdate, "id" | "token_hash">) {
  const { error } = await supabase.from("chat_sessions").update(changes).eq("id", id);
  if (error) console.error("[chat] couldn't update a chat:", error.code, error.message);
  return !error;
}

/**
 * Counts one hit against a limit (public.rate_limit_hit, migration 8). Lets everything through when the check
 * can't run, so a real visitor is never turned away by a fault.
 */
export async function withinLimit(supabase: Service, bucket: string, limit: number, windowSeconds: number) {
  const { data, error } = await supabase.rpc("rate_limit_hit", { p_bucket: bucket, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) {
    if (!isMissingSchema(error)) console.error("[chat] rate limit check failed:", error.message);
    return true;
  }
  return data !== false;
}

/** A one-way hash of the visitor's address for the rate limits; the address itself is never stored. */
export function addressKey(ip: string | null) {
  return ip ? createHash("sha256").update(ip).digest("hex").slice(0, 40) : null;
}
