import "server-only";
import { Resend } from "resend";

/**
 * Sends the chat's emails through Resend (RESEND_API_KEY). The from address (CHAT_EMAIL_FROM) must be on a domain
 * verified in Resend, e.g. "LUSAKO <noreply@drinkingwater.lk>". Without a key nothing is sent and the caller falls
 * back: the assistant gives the quote in the chat, and team alerts are only in the admin.
 */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress() {
  return process.env.CHAT_EMAIL_FROM?.trim() || "LUSAKO <noreply@drinkingwater.lk>";
}

export async function sendEmail(message: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Email isn't set up (RESEND_API_KEY)." };
  try {
    const { error } = await new Resend(key).emails.send({ from: fromAddress(), ...message });
    if (error) {
      console.error("[chat] email not sent:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (error) {
    console.error("[chat] email not sent:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Email failed." };
  }
}
