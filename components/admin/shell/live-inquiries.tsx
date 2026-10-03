"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "@/components/admin/ui/toaster";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Listens for new website inquiries (Supabase Realtime, filtered by the same row level security as everything
 * else) and refreshes the admin so the unread badge and lists update without a reload.
 */
export function LiveInquiries() {
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin-inquiries")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "inquiries" }, (payload) => {
        const name = typeof payload.new?.name === "string" ? payload.new.name : "someone";
        toast(`New inquiry from ${name}`, "info");
        router.refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
