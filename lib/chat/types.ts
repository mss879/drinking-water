import type { ChatRole } from "@/lib/supabase/types";

/** What the website's chat widget and /api/chat exchange (shared by the browser and the server). */

/** A message as the visitor's browser sees it. */
export type PublicMessage = { id: string; role: ChatRole; content: string; author: string | null; at: string };

/**
 * Who is answering. ai: the assistant. human: a team member took over. team: the assistant is switched off (or has
 * no key), so messages wait for the team.
 */
export type ChatMode = "ai" | "human" | "team";

export type PublicState = { mode: ChatMode; waiting: boolean; agentName: string | null };

/** What the chat button needs from the admin's settings and the contact details (read on the server). */
export type ChatWidgetConfig = {
  name: string;
  greeting: string;
  teaser: string;
  quickReplies: string[];
  /** The assistant answers (else messages wait for the team). */
  ai: boolean;
  hours: string;
  whatsapp: string | null;
  phone: string | null;
  /** The WhatsApp button sits in the corner, so the chat button goes above it. */
  stacked: boolean;
};
