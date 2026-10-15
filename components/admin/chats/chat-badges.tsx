import { Headset, SquareKanban } from "lucide-react";
import { Badge } from "@/components/admin/ui/badge";
import type { ChatMessage, ChatSession } from "@/lib/supabase/types";

export type ChatView = "open" | "attention" | "live" | "leads" | "closed" | "all";
export type ChatCounts = Record<ChatView, number>;
export type ChatRow = Pick<
  ChatSession,
  | "id"
  | "status"
  | "ai_enabled"
  | "handover_requested_at"
  | "agent_name"
  | "visitor_name"
  | "phone"
  | "email"
  | "company"
  | "location"
  | "lead_id"
  | "qualified_at"
  | "message_count"
  | "last_message_at"
  | "last_message_preview"
  | "admin_unread"
  | "context"
  | "created_at"
>;
export type OpenChat = { session: ChatSession; messages: ChatMessage[]; lead: { id: string; name: string; stage: string | null } | null };
export type AssistantStatus = { on: boolean; widget: boolean; keyMissing: boolean };

/** A chat's one-line status for the list. */
export function ChatStatusBadges({ chat }: { chat: Pick<ChatRow, "status" | "ai_enabled" | "handover_requested_at" | "agent_name" | "lead_id"> }) {
  return (
    <>
      {chat.handover_requested_at && chat.ai_enabled && chat.status === "open" && (
        <Badge tone="solid">
          <Headset aria-hidden className="size-3" />
          Wants a person
        </Badge>
      )}
      {!chat.ai_enabled && (
        <Badge tone="soft">
          <Headset aria-hidden className="size-3" />
          {chat.agent_name ? `${chat.agent_name} answering` : "Team answering"}
        </Badge>
      )}
      {chat.lead_id && (
        <Badge tone="white">
          <SquareKanban aria-hidden className="size-3" />
          In CRM
        </Badge>
      )}
      {chat.status === "closed" && <Badge tone="muted">Closed</Badge>}
    </>
  );
}
