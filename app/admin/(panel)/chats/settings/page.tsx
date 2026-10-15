import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ChatSettingsForm } from "@/components/admin/chats/chat-settings-form";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { chatSettingsFrom } from "@/lib/chat/config";
import { emailConfigured } from "@/lib/chat/email";
import { assistantModel, hasAssistantKey } from "@/lib/chat/settings";
import { contactFrom } from "@/lib/cms/map";

export const metadata: Metadata = { title: "Assistant settings" };

export default async function ChatSettingsPage() {
  const { supabase } = await requireAdmin();
  const [settings, contact] = await Promise.all([
    supabase.from("chat_settings").select("*").maybeSingle(),
    supabase.from("cms_settings").select("value").eq("key", "contact").maybeSingle(),
  ]);

  return (
    <>
      <Link href="/admin/chats" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-deep hover:underline">
        <ChevronLeft aria-hidden className="size-4" />
        Chats
      </Link>
      <PageHeader
        title="Assistant settings"
        description="How the website’s chat assistant greets visitors, what it may quote, what else it should know, and where its leads and alerts go."
      />
      {settings.error && isMissingSchema(settings.error) ? (
        <MigrationNotice migration="20261009180000_ai_chat_agent.sql" />
      ) : settings.error ? (
        <p className="card-line p-6 text-muted">The settings couldn’t be loaded: {settings.error.message}</p>
      ) : (
        <ChatSettingsForm
          initial={chatSettingsFrom(settings.data)}
          services={{
            openai: hasAssistantKey(),
            model: assistantModel(),
            email: emailConfigured(),
            from: process.env.CHAT_EMAIL_FROM?.trim() || "LUSAKO <noreply@drinkingwater.lk>",
            salesEmail: contactFrom(contact.data?.value).salesEmail,
          }}
        />
      )}
    </>
  );
}
