"use server";

import { after } from "next/server";
import { isLeadFormType, leadForms, productOptions, resolveFields } from "@/content/forms";
import { getProducts } from "@/lib/cms/content";
import {
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
    // 2. Then the webhook and the analytics conversion, after the visitor has their answer.
    after(async () => {
      try {
        await deliverLead(lead);
      } catch (error) {
        console.error("[lead] webhook failed (the inquiry is saved)", error);
      }
      await recordLeadEvent(type, attribution);
    });
    return { status: "success", reference: lead.reference };
  }

  // No database (or it failed): the webhook or the server log is the only copy, so wait for it. With a database
  // set up but failing and no webhook, the lead would only reach a log, so the visitor is asked to try again.
  if (hasInquiryStore() && !hasLeadWebhook()) {
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

function failure(values: Record<string, string>): LeadState {
  return {
    status: "error",
    message: "Sorry, we couldn’t send your request just now. Please try again, or call us.",
    values,
  };
}
