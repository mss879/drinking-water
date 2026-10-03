"use client";

import { createContext, useContext, type ReactNode } from "react";
import { productOptions, type FieldOption } from "@/content/forms";

const CatalogContext = createContext<FieldOption[] | null>(null);

/** Hands the current product catalogue to every form's model picker (the site layout fills it from the admin). */
export function CatalogProvider({ options, children }: { options: FieldOption[]; children: ReactNode }) {
  return <CatalogContext value={options}>{children}</CatalogContext>;
}

/** The model picker's choices: the provided catalogue, or the built-in one outside a provider. */
export function useCatalogOptions() {
  return useContext(CatalogContext) ?? productOptions();
}
