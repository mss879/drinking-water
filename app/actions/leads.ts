"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { isLeadFormType, leadFieldMap, leadForms, productOptions, resolveFields, type FormField, type LeadFormType } from "@/content/forms";
import { site } from "@/content/site";
import { emailConfigured, sendEmail } from "@/lib/chat/email";
import { inquiryAlertEmail } from "@/lib/chat/email-template";
import { getProducts, getSiteSettings } from "@/lib/cms/content";
import {
  allowSubmission,
  deliverLead,
  hasInquiryStore,
  hasLeadWebhook,
  newReference,
  parseAttribution,
  recordLeadEvent,
  saveInquiry,
  type Lead,
} from "@/lib/leads";

export type LeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  /** Echoed back on error so the form keeps what the visitor typed. */
  values?: Record<string, string>;
  reference?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{9,18}$/;

export async function submitLead(_previous: LeadState, formData: FormData): Promise<LeadState> {
  const type = formData.get("formType");
  if (!isLeadFormType(type)) {
    return { status: "error", message: "Something went wrong. Please refresh the page and try again." };
  }
  const config = leadForms[type];

  // Honeypot: real visitors never see or fill this field. Time trap: nobody fills a form in under two seconds.
  const elapsed = Number(formData.get("elapsed_ms") ?? NaN);
  if (String(formData.get("company_website") ?? "") || (Number.isFinite(elapsed) && elapsed < 2000)) {
    return { status: "success", reference: "LSK-000000" };
  }

  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};

  // The product pickers accept whatever the catalogue holds right now.
  const fields = resolveFields(type, productOptions(await getProducts()));
  for (const field of fields) {
    const value = String(formData.get(field.name) ?? "").trim().slice(0, 2000);
    values[field.name] = value;
    if (!value) {
      if (field.required) {
        errors[field.name] =
          field.requiredMessage ?? (field.fullLabel ? `Please fill in ${field.fullLabel}.` : `Please add your ${field.label.toLowerCase()}.`);
      }
      continue;
    }
    if (field.type === "email" && !EMAIL.test(value)) errors[field.name] = "Please enter a valid email address.";
    if (field.type === "tel" && !PHONE.test(value)) errors[field.name] = "Please enter a valid phone number.";
    if (field.type === "number") {
      const min = field.min ?? 1;
      const number = Number(value);
      if (!Number.isInteger(number) || number < min) {
        errors[field.name] = min === 0 ? "Please enter 0 or a whole number." : "Please enter a whole number greater than zero.";
      }
    }
    if (field.options && !field.options.some((option) => option.value === value)) {
      errors[field.name] = "Please choose one of the options.";
    }
  }
  if (Object.keys(errors).length === 0 && config.validate) Object.assign(errors, config.validate(values));

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors, values };
  }

  if (!(await allowSubmission(await clientAddress()))) {
    return {
      status: "error",
      message: "You’ve sent several requests in the last few minutes. Please wait a little and try again, or call us.",
      values,
    };
  }

  const lead: Lead = {
    reference: newReference(),
    form: type,
    source: config.source,
    destination: config.destination,
    submittedAt: new Date().toISOString(),
    values,
  };
  const attribution = parseAttribution(formData.get("attribution"));

  // 1. Save it as an inquiry in the admin (when Supabase is set up).
  const saved = await saveInquiry(lead, type, attribution);
  if (saved) {
    lead.reference = saved;
    // 2. Then the webhook, the team's email and the analytics conversion, after the visitor has their answer. Without
    // a webhook the inquiry in the admin is the record, so nothing personal goes to the server log.
    after(async () => {
      if (hasLeadWebhook()) {
        try {
          await deliverLead(lead);
        } catch (error) {
          console.error("[lead] webhook failed (the inquiry is saved)", error);
        }
      }
      await Promise.all([recordLeadEvent(type, attribution), emailTeam(type, lead, fields)]);
    });
    return { status: "success", reference: lead.reference };
  }

  // No database (or it failed): the webhook or the server log is the only copy, so wait for it. With no webhook, the
  // lead would only reach a log: in production (a database failing, or its keys missing) the visitor is asked to
  // try again or call, rather than being told it was sent. Local development without Supabase still succeeds.
  if (!hasLeadWebhook() && (hasInquiryStore() || process.env.NODE_ENV === "production")) {
    console.error("[lead] not saved anywhere", JSON.stringify(lead));
    return failure(values);
  }
  try {
    await deliverLead(lead);
  } catch (error) {
    console.error("[lead] delivery failed", error);
    return failure(values);
  }

  return { status: "success", reference: lead.reference };
}

/**
 * Emails the team about a saved inquiry, through Resend once it's set up (RESEND_API_KEY): service requests go to the
 * operations email, everything else to the sales email (Contact & social).
 */
async function emailTeam(type: LeadFormType, lead: Lead, fields: FormField[]) {
  if (!emailConfigured()) return;
  const { contact } = await getSiteSettings();
  const to = (type === "service" && contact.operationsEmail) || contact.salesEmail;
  if (!to) return;
  const rows = fields.flatMap((field): [string, string][] => {
    const value = lead.values[field.name];
    if (!value) return [];
    return [[field.fullLabel ?? field.label, field.options?.find((option) => option.value === value)?.label ?? value]];
  });
  await sendEmail({
    to,
    ...inquiryAlertEmail({
      form: leadForms[type].label,
      reference: lead.reference,
      name: lead.values[leadFieldMap[type].name] || "A website visitor",
      rows,
      adminUrl: new URL(`/admin/inquiries?q=${encodeURIComponent(lead.reference)}`, site.url).toString(),
      replyTo: lead.values.email || undefined,
    }),
  });
}

/** The visitor's address as the host saw it: Netlify's own header first, then the usual proxy headers. */
async function clientAddress() {
  const list = await headers();
  return (
    list.get("x-nf-client-connection-ip") ??
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    list.get("x-real-ip") ??
    null
  );
}

function failure(values: Record<string, string>): LeadState {
  return {
    status: "error",
    message: "Sorry, we couldn’t send your request just now. Please try again, or call us.",
    values,
  };
}
