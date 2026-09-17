"use server";

import { isLeadFormType, leadForms } from "@/content/forms";
import { deliverLead } from "@/lib/leads";

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

  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("company_website") ?? "")) return { status: "success", reference: "LSK-000000" };

  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const field of config.fields) {
    const value = String(formData.get(field.name) ?? "").trim().slice(0, 2000);
    values[field.name] = value;
    if (!value) {
      if (field.required) errors[field.name] = `Please add your ${field.label.toLowerCase()}.`;
      continue;
    }
    if (field.type === "email" && !EMAIL.test(value)) errors[field.name] = "Please enter a valid email address.";
    if (field.type === "tel" && !PHONE.test(value)) errors[field.name] = "Please enter a valid phone number.";
    if (field.type === "number" && !(Number(value) > 0)) errors[field.name] = "Please enter a number greater than zero.";
    if (field.options && !field.options.some((option) => option.value === value)) {
      errors[field.name] = "Please choose one of the options.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors, values };
  }

  const reference = `LSK-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  try {
    await deliverLead({
      reference,
      form: type,
      source: config.source,
      destination: config.destination,
      submittedAt: new Date().toISOString(),
      values,
    });
  } catch (error) {
    console.error("[lead] delivery failed", error);
    return {
      status: "error",
      message: "Sorry, we couldn’t send your request just now. Please try again, or call us.",
      values,
    };
  }

  return { status: "success", reference };
}
