import type { LeadSource } from "@/lib/analytics";
import { defaultAmc } from "./amc";
import { provinces } from "./pricing";
import { products as defaultProducts, type Product } from "./products";

/**
 * Purpose-specific lead forms (brief §14). Each form tags its lead source so
 * enquiries route to the right team: Direct Sales, Rental Sales, B2B or Service.
 */
export type FieldOption = { value: string; label: string };

export type FormField = {
  name: string;
  label: string;
  /** The label outside the form (admin, error messages) when `label` alone would be ambiguous. */
  fullLabel?: string;
  /** The message when a required field is left empty, for labels that don't read well in "Please add your …". */
  requiredMessage?: string;
  type: "text" | "email" | "tel" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  /** The options are the product catalogue (plus "Not sure yet"), filled in when the form is shown or checked. */
  optionsFrom?: "products";
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  /** Lowest number allowed (number fields). Defaults to 1. */
  min?: number;
  /** Half-width on tablet and up. */
  half?: boolean;
  hint?: string;
  /** Consecutive fields with the same section (and sub-section) are grouped under that heading. */
  section?: string;
  subsection?: string;
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
  /** Checks across fields, run on the server after each field passes on its own. */
  validate?: (values: Record<string, string>) => Record<string, string>;
};

const provinceOptions: FieldOption[] = provinces.map((p) => ({ value: p.id, label: p.label }));

const waterSourceOptions: FieldOption[] = [
  { value: "city", label: "City (mains) water" },
  { value: "well", label: "Well water" },
  { value: "other", label: "Other / not sure" },
];

const industryOptions: FieldOption[] = [
  { value: "banking", label: "Banking & financial services" },
  { value: "healthcare", label: "Healthcare & hospitals" },
  { value: "hospitality", label: "Hotels & hospitality" },
  { value: "education", label: "Schools & education" },
  { value: "manufacturing", label: "Manufacturing & factories" },
  { value: "corporate", label: "Corporate offices, IT & BPO" },
  { value: "retail", label: "Retail & commercial" },
  { value: "government", label: "Government & public sector" },
  { value: "logistics", label: "Logistics & warehousing" },
  { value: "construction", label: "Construction & real estate" },
  { value: "other", label: "Other" },
];

const phone: FormField = { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel", inputMode: "tel", half: true };
const email: FormField = { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", inputMode: "email", half: true };

const companySection = "Company information";
const unitsSection = "Branch & unit requirements";

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
      { name: "model", label: "Preferred model", type: "select", optionsFrom: "products", half: true },
      {
        name: "purification",
        label: "Purification",
        type: "select",
        half: true,
        options: [
          { value: "UF", label: "4-Stage UF" },
          { value: "RO", label: "4-Stage RO" },
          { value: "not-sure", label: "Not sure yet" },
        ],
      },
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
      { name: "units", label: "Number of units required", type: "number", required: true, inputMode: "numeric", half: true },
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
      { name: "preferredMachine", label: "Preferred machine", type: "select", optionsFrom: "products" },
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
    // The structure the client asked for: company information, then branches and units for the Western Province
    // and for the other provinces. Enter 0 where the company has no sites.
    fields: [
      { name: "company", label: "Company name", type: "text", required: true, autoComplete: "organization", half: true, section: companySection },
      { name: "industry", label: "Industry", type: "select", required: true, options: industryOptions, half: true, section: companySection },
      { name: "contactName", label: "Contact person name", type: "text", required: true, autoComplete: "name", half: true, section: companySection },
      { ...email, label: "Email address", section: companySection },
      { ...phone, label: "Contact number", section: companySection },
      {
        name: "westernBranches",
        label: "Number of branches / locations",
        fullLabel: "Western Province: branches / locations",
        type: "number",
        required: true,
        min: 0,
        inputMode: "numeric",
        half: true,
        section: unitsSection,
        subsection: "Western Province",
      },
      {
        name: "westernUnits",
        label: "Estimated number of units required",
        fullLabel: "Western Province: units required",
        type: "number",
        required: true,
        min: 0,
        inputMode: "numeric",
        half: true,
        section: unitsSection,
        subsection: "Western Province",
      },
      {
        name: "otherBranches",
        label: "Number of branches / locations",
        fullLabel: "Other provinces: branches / locations",
        type: "number",
        required: true,
        min: 0,
        inputMode: "numeric",
        half: true,
        section: unitsSection,
        subsection: "Other provinces",
      },
      {
        name: "otherUnits",
        label: "Estimated number of units required",
        fullLabel: "Other provinces: units required",
        type: "number",
        required: true,
        min: 0,
        inputMode: "numeric",
        half: true,
        section: unitsSection,
        subsection: "Other provinces",
      },
    ],
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (Number(values.westernBranches) + Number(values.otherBranches) < 1) {
        errors.westernBranches = "Add at least one branch, here or in the other provinces.";
      }
      if (Number(values.westernUnits) + Number(values.otherUnits) < 1) {
        errors.westernUnits = "Add at least one unit, here or in the other provinces.";
      }
      return errors;
    },
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
      { name: "model", label: "Model", type: "select", required: true, optionsFrom: "products", half: true },
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
          ...defaultAmc.plans.map((plan) => ({ value: plan.serviceType, label: `AMC: ${plan.name}` })),
          { value: "on-call", label: "On-call service visit" },
          { value: "tank-sanitation", label: "Tank chlorination & sanitation" },
          { value: "parts", label: "Filters, spare parts or accessories" },
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
      {
        name: "issue",
        label: "How can we help?",
        fullLabel: "Details",
        requiredMessage: "Please tell us what’s happening, or what you need.",
        type: "textarea",
        required: true,
        placeholder: "Describe the problem, or the plan, service or part you need",
      },
    ],
  },
};

export const leadFormTypes = Object.keys(leadForms) as LeadFormType[];

// Own keys only: `in` would also accept inherited names such as "constructor".
export function isLeadFormType(value: unknown): value is LeadFormType {
  return typeof value === "string" && Object.hasOwn(leadForms, value);
}

/** The model picker's choices: every product, then "Not sure yet". */
export function productOptions(list: Pick<Product, "slug" | "name">[] = defaultProducts): FieldOption[] {
  return [...list.map((product) => ({ value: product.slug, label: product.name })), { value: "not-sure", label: "Not sure yet" }];
}

/** A form's fields with the catalogue filled into the product pickers. */
export function resolveFields(type: LeadFormType, catalogue: FieldOption[] = productOptions()): FormField[] {
  return leadForms[type].fields.map((field) => (field.optionsFrom === "products" ? { ...field, options: catalogue } : field));
}

/**
 * Where each form keeps the fields every inquiry shares, so the admin can list them side by side. Location fields
 * are joined in order (rental: city, then province); `locationOf` describes it when no single field holds it.
 * Everything else is kept as the inquiry's details.
 */
export const leadFieldMap: Record<
  LeadFormType,
  { name: string; company?: string; location: string[]; locationOf?: (values: Record<string, string>) => string | null; message?: string }
> = {
  buy: { name: "name", location: ["location"], message: "message" },
  rental: { name: "contactPerson", company: "company", location: ["city", "province"], message: "usage" },
  corporate: {
    name: "contactName",
    company: "company",
    location: [],
    locationOf: (values) => {
      const areas = [Number(values.westernBranches) > 0 && "Western Province", Number(values.otherBranches) > 0 && "Other provinces"].filter(Boolean);
      return areas.length ? areas.join(" & ") : null;
    },
  },
  service: { name: "customer", location: ["location"], message: "issue" },
};

/** The label of a field's value: an option's label for selects, the value itself otherwise. */
export function fieldValueLabel(type: LeadFormType, name: string, value: string, catalogue?: FieldOption[]) {
  const field = resolveFields(type, catalogue).find((item) => item.name === name);
  return field?.options?.find((option) => option.value === value)?.label ?? value;
}

/** A field's label for use outside the form, e.g. "Western Province: units required". */
export function fieldFullLabel(type: LeadFormType, name: string) {
  const field = leadForms[type].fields.find((item) => item.name === name);
  return field ? (field.fullLabel ?? field.label) : name;
}
