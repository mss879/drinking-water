"use client";

import { Check } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { KokoBadge } from "@/components/products/koko-badge";
import { ButtonLink } from "@/components/ui/button";
import { WaveLines } from "@/components/ui/decor";
import type { productOptions } from "@/content/copy/product";
import { fill, pieces } from "@/content/copy/schema";
import type { ProductVariant } from "@/content/products";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

const rentalSolution: Record<ProductVariant["filtration"], string> = { UF: "pureflow-uf", RO: "pureflow-ro" };

/**
 * Buy UF, buy RO or rent, without the confusion (client request): each purification option is a card, and picking
 * one points the Buy and Rent buttons at it. Both ask for a quote. While LUSAKO hides its prices (client, October
 * 2026) that is all the card shows; once a price of the product is shown (Prices & quotes), every option carries its
 * buy price and its rental-from price, so they can be compared at a glance. The Buy side carries KOKO's instalments badge
 * while it is switched on. A product with one option shows that option on its own. The wording is the product.options
 * block, passed in by the product page.
 */
export function PurchaseOptions({
  slug,
  name,
  variants,
  copy,
  koko,
  initialPayment,
}: {
  slug: string;
  name: string;
  /** Each carries its price and rent only while the admin shows them. */
  variants: ProductVariant[];
  copy: typeof productOptions.defaults;
  /** KOKO's badge on the Buy side. */
  koko: boolean;
  /** The rental's one-time initial payment per unit, while it is shown. */
  initialPayment: number | null;
}) {
  const [index, setIndex] = useState(0);
  const groupId = useId();
  const group = useRef<HTMLDivElement>(null);

  // A radio group: the arrow keys move the choice (and focus) between the options.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + variants.length) % variants.length;
    setIndex(next);
    group.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };
  const chosen = variants[index] ?? variants[0];
  const several = variants.length > 1;
  if (!chosen) return null;

  // Any shown price brings back the price rows (and the VAT note); otherwise the card is exactly the quote-only one.
  const priced = variants.some((variant) => variant.price || variant.rent);
  const option = several ? chosen.label : name;
  const waterFit: Record<ProductVariant["filtration"], string> = { UF: copy.ufFit, RO: copy.roFit };

  const buyHref = `/contact?${new URLSearchParams({ type: "buy", model: slug, purification: chosen.filtration })}#quote`;
  const rentHref = `/contact?${new URLSearchParams({ type: "rental", preferredMachine: slug, preferredSolution: rentalSolution[chosen.filtration] })}#quote`;

  // The rent price and the initial payment are shown separately, so the rent side has a wording for each case.
  const rentText = chosen.rent
    ? initialPayment
      ? pieces(copy.rentTextWithPrices, { price: `${formatLKR(chosen.rent)}/month + VAT`, initial: formatLKR(initialPayment) })
      : pieces(copy.rentTextWithPrice, { price: `${formatLKR(chosen.rent)}/month + VAT` })
    : initialPayment
      ? pieces(copy.rentTextWithInitial, { initial: formatLKR(initialPayment) })
      : copy.rentText;

  return (
    <div className="card-line overflow-hidden rounded-card-xl">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id={groupId} className="font-display text-xl font-bold text-ink">
            {several ? copy.titleSeveral : priced ? fill(copy.titleOneWithPrice, { name }) : copy.titleOne}
          </h2>
          <p className="text-sm text-muted">{priced ? "All prices exclude VAT" : several ? copy.subtitleSeveral : copy.subtitleOne}</p>
        </div>

        <div
          ref={group}
          role={several ? "radiogroup" : undefined}
          aria-labelledby={several ? groupId : undefined}
          onKeyDown={several ? onKeyDown : undefined}
          className={cn("mt-5 grid gap-3", several && "sm:grid-cols-2")}
        >
          {variants.map((variant, i) => {
            const selected = i === index;
            const body = (
              <>
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-display text-lg leading-tight font-bold text-ink">{variant.label}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{waterFit[variant.filtration]}</span>
                    {variant.code && <span className="block text-xs text-muted">{pieces(copy.model, { code: variant.code })}</span>}
                  </span>
                  {several && (
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                        selected ? "border-deep bg-deep text-white" : "border-line bg-white",
                      )}
                    >
                      {selected && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  )}
                </span>
                {priced && (
                  <span className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
                    <span>
                      <span className="block text-xs text-muted">{copy.buyLabel}</span>
                      <span className="block font-display text-[15px] font-bold text-ink">
                        {variant.price ? formatLKR(variant.price) : copy.buyOnRequest}
                      </span>
                    </span>
                    <span>
                      <span className="block text-xs text-muted">{variant.rent ? copy.rentFromLabel : copy.rentLabel}</span>
                      <span className="block font-display text-[15px] font-bold text-deep">
                        {variant.rent ? (
                          <>
                            {formatLKR(variant.rent)}
                            <span className="font-sans text-xs font-normal text-muted">/month</span>
                          </>
                        ) : (
                          copy.rentOnRequest
                        )}
                      </span>
                    </span>
                  </span>
                )}
              </>
            );
            return several ? (
              <button
                key={variant.label}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(i)}
                className={cn(
                  "cursor-pointer rounded-card p-4 text-left transition-[border-color,background-color,box-shadow] duration-200 sm:p-5",
                  selected ? "border-2 border-deep bg-tint shadow-soft" : "border-2 border-line bg-white hover:border-brand",
                )}
              >
                {body}
              </button>
            ) : (
              <div key={variant.label} className="rounded-card bg-tint p-4 sm:p-5">
                {body}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative grid gap-3 overflow-hidden bg-deep p-5 text-white sm:grid-cols-2 sm:p-6">
        <WaveLines lines={3} className="absolute inset-x-0 bottom-0 h-2/3 w-full text-white/15" />
        <div className="relative flex flex-col gap-3">
          <p className="text-sm text-white/85">
            {chosen.price
              ? pieces(copy.buyTextWithPrice, { option, price: `${formatLKR(chosen.price)} + VAT` })
              : pieces(copy.buyText, { option })}
          </p>
          {koko && (
            <KokoBadge className="self-start">
              {copy.koko}
            </KokoBadge>
          )}
          <ButtonLink href={buyHref} variant="white" arrow className="mt-auto w-full">
            {copy.buyButton}
            <span className="sr-only"> to buy the {several ? `${chosen.filtration} model` : name}</span>
          </ButtonLink>
        </div>
        <div className="relative flex flex-col gap-3">
          <p className="text-sm text-white/85">{rentText}</p>
          <ButtonLink href={rentHref} variant="glass" arrow className="mt-auto w-full">
            {copy.rentButton}
            <span className="sr-only"> to rent the {several ? `${chosen.filtration} model` : name}</span>
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
