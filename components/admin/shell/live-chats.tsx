"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "@/components/admin/ui/toaster";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Row = {
  id?: string;
  status?: string;
  ai_enabled?: boolean;
  admin_unread?: boolean;
  handover_requested_at?: string | null;
  visitor_name?: string | null;
};

/** The chat is waiting for the team: the visitor asked for a person, or wrote in a chat someone took over. */
const waiting = (row: Row) => row.status === "open" && (Boolean(row.handover_requested_at) || (row.ai_enabled === false && row.admin_unread === true));

/**
 * Listens for chats that need the team (Supabase Realtime, limited to admins by row level security), anywhere in
 * the admin: a short message pops up and the Chats badge updates. The Chats page keeps itself up to date.
 */
export function LiveChats() {
  const router = useRouter();
  const pathname = usePathname();
  const onChats = pathname.startsWith("/admin/chats");
  const known = useRef(new Map<string, boolean>());

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    let timer = 0;
    const channel = supabase
      .channel("admin-chats-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, (payload) => {
        const row = (payload.new ?? {}) as Row;
        if (!row.id) return;
        const now = waiting(row);
        const before = known.current.get(row.id) ?? false;
        known.current.set(row.id, now);
        // The Chats page refreshes itself (badge included).
        if (now === before || onChats) return;
        if (now) {
          const who = row.visitor_name || "A website visitor";
          toast(row.ai_enabled === false ? `${who} sent a new chat message` : `${who} would like to talk to a person`, "info");
        }
        // The badge lives in the layout: refresh it, once for a burst of changes.
        window.clearTimeout(timer);
        timer = window.setTimeout(() => router.refresh(), 800);
      })
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [router, onChats]);

  return null;
}
