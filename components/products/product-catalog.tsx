"use client";

import { MessageCircle, SearchX } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { ProductCard } from "@/components/products/product-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import type { Filtration } from "@/content/pricing";
import { isProductType, productFiltrations, productTypes, type Product, type ProductType } from "@/content/products";
import { cn } from "@/lib/cn";

type TypeFilter = ProductType | "all";
type PurificationFilter = Filtration | "all";
type Option<T extends string> = { value: T; label: string };

const typeOptions: Option<TypeFilter>[] = [
  { value: "all", label: "All" },
  ...productTypes.map((type) => ({ value: type.id, label: type.label })),
];

const purificationOptions: Option<PurificationFilter>[] = [
  { value: "all", label: "All" },
  { value: "UF", label: "UF" },
  { value: "RO", label: "RO" },
];

const chip =
  "inline-flex h-11 cursor-pointer items-center rounded-full border px-4.5 text-sm font-medium whitespace-nowrap transition-colors duration-200";

function matches(product: Product, type: TypeFilter, purification: PurificationFilter) {
  return (
    (type === "all" || product.types.includes(type)) &&
    (purification === "all" || productFiltrations(product).includes(purification))
  );
}

/** Explains an empty combination using the catalogue itself, e.g. "Sparkling purifiers are available with UF purification." */
function emptyReason(products: Product[], type: TypeFilter) {
  const group = productTypes.find((t) => t.id === type);
  if (!group) return "Try another type or purification.";
  const available = Array.from(
    new Set(products.filter((product) => product.types.includes(group.id)).flatMap((product) => productFiltrations(product))),
  );
  return available.length
    ? `${group.plural} are available with ${available.join(" or ")} purification.`
    : `${group.plural} don’t use UF or RO purification.`;
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  firstRef,
  children,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  firstRef: Ref<HTMLButtonElement>;
  children?: ReactNode;
}) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <span
        id={labelId}
        className="shrink-0 text-xs font-medium tracking-[0.16em] text-muted uppercase sm:flex sm:h-11 sm:w-32 sm:items-center 2xl:w-auto"
      >
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option, i) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(chip, active ? "border-deep bg-deep text-white" : "border-line bg-white text-ink hover:border-brand")}
            >
              {option.label}
            </button>
          );
        })}
        {children}
      </div>
    </div>
  );
}

/**
 * The Direct Sales catalogue: filter by type and UF / RO (brief Doc 2 §15), every product with Buy and Rent side by
 * side. `?type=under-sink` (the navigation's category links) opens on that category. A category with nothing listed
 * yet offers a conversation instead of an empty grid.
 */
export function ProductCatalog({
  products,
  className,
  purificationHelpHref,
}: {
  products: Product[];
  className?: string;
  purificationHelpHref?: string;
}) {
  const [type, setType] = useState<TypeFilter>("all");
  const [purification, setPurification] = useState<PurificationFilter>("all");
  // Cards only animate after a filter change, never on first paint.
  const [changed, setChanged] = useState(false);
  const typeAll = useRef<HTMLButtonElement>(null);
  const purificationAll = useRef<HTMLButtonElement>(null);

  // Open on the category in the address (the page itself is static, so this is read once it has loaded).
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("type");
    if (isProductType(wanted)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-off read of the address after hydration
      setType(wanted);
    }
  }, []);

  const visible = products.filter((product) => matches(product, type, purification));
  const total = products.length;
  const group = productTypes.find((t) => t.id === type);
  // A category LUSAKO offers but hasn't listed any products in yet.
  const onRequest = group && !products.some((product) => product.types.includes(group.id));

  const status =
    onRequest
      ? `${group.plural} are available on request`
      : visible.length === 0
      ? "No products match these filters"
      : visible.length === total
        ? `Showing all ${total} products`
        : `Showing ${visible.length} of ${total} products`;

  const chooseType = (value: TypeFilter) => {
    setType(value);
    setChanged(true);
    // Keep the address in step, so a filtered view can be shared.
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("type");
    else url.searchParams.set("type", value);
    window.history.replaceState(window.history.state, "", url);
  };
  const choosePurification = (value: PurificationFilter) => {
    setPurification(value);
    setChanged(true);
  };
  // The empty state unmounts with its buttons, so move focus somewhere that stays.
  const clearFilters = () => {
    setType("all");
    setPurification("all");
    setChanged(true);
    typeAll.current?.focus();
  };
  const showWholeType = () => {
    setPurification("all");
    setChanged(true);
    purificationAll.current?.focus();
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:gap-10">
        <FilterGroup label="Type" options={typeOptions} value={type} onChange={chooseType} firstRef={typeAll} />
        <span aria-hidden className="mt-1.5 hidden h-8 w-px bg-line 2xl:block" />
        <FilterGroup
          label="Purification"
          options={purificationOptions}
          value={purification}
          onChange={choosePurification}
          firstRef={purificationAll}
        >
          {purificationHelpHref && (
            <a
              href={purificationHelpHref}
              className="inline-flex h-11 items-center px-2 text-sm font-medium text-ink underline decoration-brand underline-offset-4 transition-colors hover:decoration-deep"
            >
              What’s the difference?
            </a>
          )}
        </FilterGroup>
      </div>

      <p aria-live="polite" aria-atomic="true" className="mt-8 border-b border-line pb-4 text-sm text-muted">
        {status}
      </p>

      {onRequest ? (
        <div className="mt-6 flex flex-col items-center rounded-card-xl bg-tint px-5 py-14 text-center sm:px-10 sm:py-20">
          <IconBadge variant="white" size="lg" framed>
            <MessageCircle />
          </IconBadge>
          <h3 className="mt-6 font-display text-h3 font-bold text-ink">{group.plural}, on request</h3>
          <p className="mt-2 max-w-md text-muted">
            Tell us about your space and your water, and our team will recommend the right {group.label.toLowerCase()} model and price.
          </p>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href={`/contact?${new URLSearchParams({ type: "buy", message: `I’m interested in ${group.plural.toLowerCase()}.` })}#quote`}
              variant="primary"
              arrow
            >
              Ask about {group.plural.toLowerCase()}
            </ButtonLink>
            <Button type="button" variant="outline" onClick={clearFilters}>
              See all purifiers
            </Button>
          </div>
        </div>
      ) : visible.length > 0 ? (
        <ul key={changed ? `${type}-${purification}` : "initial"} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product, i) => (
            <li
              key={product.slug}
              className={cn(changed && "animate-fade-up motion-reduce:animate-none")}
              style={changed ? { animationDelay: `${i * 60}ms` } : undefined}
            >
              <ProductCard product={product} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-card-xl border border-dashed border-line px-5 py-14 text-center sm:px-10 sm:py-20">
          <IconBadge variant="tint" size="lg">
            <SearchX />
          </IconBadge>
          <h3 className="mt-6 font-display text-h3 font-bold text-ink">No matches for that combination</h3>
          <p className="mt-2 max-w-md text-muted">{emptyReason(products, type)}</p>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Button type="button" variant="primary" onClick={clearFilters}>
              Clear filters
            </Button>
            {group && (
              <Button type="button" variant="outline" onClick={showWholeType}>
                Show all {group.plural.toLowerCase()}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
