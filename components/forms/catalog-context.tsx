"use client";

import { createContext, useContext, type ReactNode } from "react";
import { productOptions, type FieldOption } from "@/content/forms";

type Catalog = { options: FieldOption[]; labels: Record<string, string> };

const CatalogContext = createContext<Catalog | null>(null);

/**
 * Hands the current product catalogue to every form's model picker, and the option names the admin can change (the
 * AMC plans), to every form (the site layout fills both from the admin).
 */
export function CatalogProvider({ options, labels = {}, children }: { options: FieldOption[]; labels?: Record<string, string>; children: ReactNode }) {
  return <CatalogContext value={{ options, labels }}>{children}</CatalogContext>;
}

/** The model picker's choices: the provided catalogue, or the built-in one outside a provider. */
export function useCatalogOptions() {
  return useContext(CatalogContext)?.options ?? productOptions();
}

/** Option names from the admin, by option value. */
export function useOptionLabels() {
  return useContext(CatalogContext)?.labels ?? {};
}
