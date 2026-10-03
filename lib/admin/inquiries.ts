import { fieldFullLabel, fieldValueLabel, leadForms, type FieldOption, type LeadFormType } from "@/content/forms";
import type { Inquiry, InquiryFormType } from "@/lib/supabase/types";

/** Short names for the four forms, for badges and filters. */
export const formTypeLabels: Record<InquiryFormType, string> = {
  buy: "Buy",
  rental: "Rental",
  corporate: "Corporate",
  service: "Service",
};

/** The form's own label for a field name ("Preferred model"), or the name itself. */
export function fieldLabel(type: InquiryFormType, name: string) {
  return fieldFullLabel(type as LeadFormType, name);
}

/** The extra details of an inquiry as labelled rows, in the order the form asks for them. `catalogue` names the products. */
export function detailRows(inquiry: Pick<Inquiry, "form_type" | "details">, catalogue?: FieldOption[]) {
  const details = (inquiry.details ?? {}) as Record<string, unknown>;
  const order = leadForms[inquiry.form_type as LeadFormType]?.fields.map((field) => field.name) ?? [];
  const keys = Object.keys(details).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return keys
    .filter((key) => details[key] !== null && details[key] !== "")
    .map((key) => ({
      label: fieldLabel(inquiry.form_type, key),
      value: fieldValueLabel(inquiry.form_type as LeadFormType, key, String(details[key]), catalogue),
    }));
}

/** A one-line summary of what the person wants, used as the lead's "interest" in the CRM. */
export function inquiryInterest(inquiry: Pick<Inquiry, "form_type" | "details">, catalogue?: FieldOption[]) {
  const details = (inquiry.details ?? {}) as Record<string, string | undefined>;
  const label = (name: string) => (details[name] ? fieldValueLabel(inquiry.form_type as LeadFormType, name, details[name]!, catalogue) : null);
  const parts: (string | null)[] = [formTypeLabels[inquiry.form_type]];
  if (inquiry.form_type === "buy") parts.push(label("model"));
  if (inquiry.form_type === "rental") parts.push(label("preferredMachine") ?? label("preferredSolution"), details.employees ? `${details.employees} people` : null);
  if (inquiry.form_type === "corporate") {
    const total = (...names: string[]) => names.reduce((sum, name) => sum + (Number(details[name]) || 0), 0);
    const branches = total("westernBranches", "otherBranches") || Number(details.branches) || 0;
    const units = total("westernUnits", "otherUnits");
    parts.push(label("industry"), branches ? `${branches} ${branches === 1 ? "branch" : "branches"}` : null, units ? `${units} ${units === 1 ? "unit" : "units"}` : null);
  }
  if (inquiry.form_type === "rental" && details.units) parts.push(`${details.units} ${details.units === "1" ? "unit" : "units"}`);
  if (inquiry.form_type === "service") parts.push(label("serviceType"), label("model"));
  return parts.filter((part) => part && part !== "Not sure yet").join(" · ");
}

/** Keeps a search box from rewriting the PostgREST filter (commas and brackets are filter syntax). */
export function cleanSearch(value: string | undefined) {
  return (value ?? "").replace(/[,()*%\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}
