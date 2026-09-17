import type { LeadSource } from "@/lib/analytics";
import { provinces } from "./pricing";
import { products } from "./products";

/**
 * Purpose-specific lead forms (brief §14). Each form tags its lead source so
 * enquiries route to the right team: Direct Sales, Rental Sales, B2B or Service.
 */
export type FieldOption = { value: string; label: string };

export type FormField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  /** Half-width on tablet and up. */
  half?: boolean;
  hint?: string;
};

export type LeadFormType = "buy" | "rental" | "corporate" | "service";

export type LeadFormConfig = {
  label: string;
  title: string;
  description: string;
  source: LeadSource;
  destination: string;
  submitLabel: string;
  successNote: string;
  fields: FormField[];
};

const provinceOptions: FieldOption[] = provinces.map((p) => ({ value: p.id, label: p.label }));

const waterSourceOptions: FieldOption[] = [
  { value: "city", label: "City (mains) water" },
  { value: "well", label: "Well water" },
  { value: "other", label: "Other / not sure" },
];

const modelOptions: FieldOption[] = [
  ...products.map((p) => ({ value: p.slug, label: p.name })),
  { value: "not-sure", label: "Not sure yet" },
];

const phone: FormField = { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel", inputMode: "tel", half: true };
const email: FormField = { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", inputMode: "email", half: true };

export const leadForms: Record<LeadFormType, LeadFormConfig> = {
  buy: {
    label: "Buy a purifier",
    title: "Get a quote to own a LUSAKO system",
    description: "Tell us about your home and your water. Our direct sales team will come back with the right model and price.",
    source: "direct-purchase",
    destination: "Direct Sales",
    submitLabel: "Request my quote",
    successNote: "Our direct sales team will contact you shortly.",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, autoComplete: "name", half: true },
      phone,
      email,
      { name: "location", label: "Location", type: "text", required: true, autoComplete: "address-level2", placeholder: "City or town", half: true },
      { name: "waterSource", label: "Water source", type: "select", required: true, options: waterSourceOptions, half: true },
      { name: "model", label: "Preferred model", type: "select", options: modelOptions, half: true },
      { name: "message", label: "Message", type: "textarea", placeholder: "How many people, where it will go, anything else we should know" },
    ],
  },
  rental: {
    label: "Rent for your office",
    title: "Rent LUSAKO for your office",
    description: "A short brief is all we need. Our rental team will recommend machines and a monthly plan for your workplace.",
    source: "rental",
    destination: "Rental Sales",
    submitLabel: "Request rental proposal",
    successNote: "Our rental team will be in touch to arrange a site assessment.",
    fields: [
      { name: "company", label: "Company", type: "text", required: true, autoComplete: "organization", half: true },
      { name: "contactPerson", label: "Contact person", type: "text", required: true, autoComplete: "name", half: true },
      phone,
      email,
      {
        name: "province",
        label: "Province",
        type: "select",
        required: true,
        options: provinceOptions,
        half: true,
        hint: "Outside the Western Province, the Regional Hydration Service is added as a separate line.",
      },
      { name: "city", label: "City", type: "text", required: true, autoComplete: "address-level2", half: true },
      { name: "employees", label: "Employees / users", type: "number", required: true, inputMode: "numeric", half: true },
      { name: "locations", label: "Number of locations", type: "number", required: true, inputMode: "numeric", half: true },
      { name: "waterSource", label: "Water source", type: "select", required: true, options: waterSourceOptions, half: true },
      {
        name: "preferredSolution",
        label: "Preferred solution",
        type: "select",
        half: true,
        options: [
          { value: "pureflow-uf", label: "PureFlow UF" },
          { value: "pureflow-ro", label: "PureFlow RO" },
          { value: "aquaspark", label: "AquaSpark (sparkling)" },
          { value: "not-sure", label: "Not sure yet" },
        ],
      },
      { name: "preferredMachine", label: "Preferred machine", type: "select", options: modelOptions },
      { name: "usage", label: "Expected usage", type: "textarea", placeholder: "For example: 40 staff across two floors, meeting rooms and a canteen" },
    ],
  },
  corporate: {
    label: "Corporate hydration",
    title: "Request a corporate hydration proposal",
    description: "For organisations with multiple units or sites. We plan the right mix of machines, installation and service.",
    source: "corporate-hydration",
    destination: "B2B / Sales",
    submitLabel: "Request business quote",
    successNote: "A LUSAKO business consultant will contact you to discuss your proposal.",
    fields: [
      { name: "company", label: "Company", type: "text", required: true, autoComplete: "organization", half: true },
      { name: "industry", label: "Industry", type: "text", required: true, half: true },
      { name: "branches", label: "Number of branches / sites", type: "number", required: true, inputMode: "numeric", half: true },
      { name: "users", label: "Approximate users", type: "number", required: true, inputMode: "numeric", half: true },
      { name: "provinces", label: "Province(s)", type: "text", required: true, placeholder: "For example: Western, Central", half: true },
      { name: "contactName", label: "Your name", type: "text", required: true, autoComplete: "name", half: true },
      phone,
      email,
      { name: "requirement", label: "Requirement", type: "textarea", required: true, placeholder: "Tell us what you need across your organisation" },
    ],
  },
  service: {
    label: "Request a service",
    title: "Request a service visit",
    description: "Already a LUSAKO customer? Tell us what’s happening and when suits you.",
    source: "service",
    destination: "Service Team",
    submitLabel: "Request service",
    successNote: "Our service team will contact you to confirm a visit time.",
    fields: [
      { name: "customer", label: "Customer / company name", type: "text", required: true, autoComplete: "name", half: true },
      phone,
      { ...email, required: false },
      { name: "location", label: "Location", type: "text", required: true, autoComplete: "street-address", half: true },
      { name: "model", label: "Model", type: "select", required: true, options: modelOptions, half: true },
      { name: "serial", label: "Serial / asset number", type: "text", placeholder: "If available", half: true },
      {
        name: "serviceType",
        label: "Service needed",
        type: "select",
        required: true,
        half: true,
        options: [
          { value: "maintenance", label: "Preventive maintenance" },
          { value: "filters", label: "Filter replacement" },
          { value: "repair", label: "Repair / technical issue" },
          { value: "relocation", label: "Relocation" },
          { value: "other", label: "Something else" },
        ],
      },
      {
        name: "preferredTime",
        label: "Preferred time",
        type: "select",
        half: true,
        options: [
          { value: "morning", label: "Morning" },
          { value: "afternoon", label: "Afternoon" },
          { value: "any", label: "Any time" },
        ],
      },
      { name: "issue", label: "What’s the issue?", type: "textarea", required: true, placeholder: "Describe the problem, or the service you need" },
    ],
  },
};

export const leadFormTypes = Object.keys(leadForms) as LeadFormType[];

export function isLeadFormType(value: unknown): value is LeadFormType {
  return typeof value === "string" && value in leadForms;
}
