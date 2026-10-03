"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CircleHelp,
  Droplets,
  Factory,
  FlaskConical,
  House,
  Map as MapIcon,
  MapPin,
  RotateCcw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import type { BrandIconName } from "@/content/brand-icons";
import { planFor } from "@/content/pricing";
import type { Product } from "@/content/products";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";
import { recommend, type Need, type Recommendation, type Region, type WaterSource } from "@/lib/recommend";

type Option<T extends string> = { value: T; label: string; hint: string; icon: LucideIcon; brand?: BrandIconName };
type Step = 0 | 1 | 2 | 3;
type Answers = { region?: Region; source?: WaterSource; need?: Need };

const regionOptions: Option<Region>[] = [
  { value: "western", label: "Western Province", hint: "Colombo, Gampaha or Kalutara district", icon: MapPin },
  { value: "other", label: "Other province", hint: "Anywhere else in Sri Lanka", icon: MapIcon },
];

const sourceOptions: Option<WaterSource>[] = [
  { value: "city", label: "City water", hint: "Treated pipe-borne (mains) supply", icon: Building2, brand: "tap" },
  { value: "well", label: "Well water", hint: "A dug or tube well on the property", icon: Droplets, brand: "well" },
  { value: "other", label: "Other or not sure", hint: "Mixed supply, or you’d like us to check", icon: CircleHelp },
];

const needOptions: Option<Need>[] = [
  { value: "home", label: "Home", hint: "Pure water for your family", icon: House },
  { value: "office", label: "Office", hint: "Hydration for your team at work", icon: Briefcase },
  { value: "commercial", label: "Commercial", hint: "Factories, hotels, schools or several sites", icon: Factory },
];

const questions = [
  { title: "Where do you live?", help: "Choose the area where the system will be installed.", short: "Location" },
  { title: "What is your water source?", help: "Pick the supply the system will connect to.", short: "Water source" },
  { title: "What do you need?", help: "Tell us who the water is for.", short: "Your space" },
];

const pathLabels: Record<Recommendation["path"], string> = {
  buy: "Buy · own your system",
  rent: "Rent · one monthly payment",
  corporate: "Corporate hydration proposal",
};

function labelOf<T extends string>(options: Option<T>[], value?: T) {
  return options.find((option) => option.value === value)?.label;
}

/** The quote link for each path, prefilled so the visitor never types an answer twice. */
function quoteAction(rec: Recommendation, region: Region, source: WaterSource) {
  if (rec.path === "buy") {
    const query = new URLSearchParams({ type: "buy", model: rec.productSlug, waterSource: source });
    return { label: "Get a quote for this system", href: `/contact?${query.toString()}` };
  }
  if (rec.path === "rent") {
    const query = new URLSearchParams({
      type: "rental",
      preferredMachine: rec.productSlug,
      preferredSolution: rec.filtration === "UF" ? "pureflow-uf" : "pureflow-ro",
      waterSource: source,
    });
    if (region === "western") query.set("province", "western");
    return { label: "Get my rental quote", href: `/contact?${query.toString()}` };
  }
  return { label: "Request a business quote", href: "/contact?type=corporate" };
}

function Progress({ step }: { step: Step }) {
  const done = step === 3;
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="font-medium text-ink">{done ? "Your recommendation" : `Step ${step + 1} of 3`}</p>
        <p className="hidden text-muted sm:block">{done ? "Based on your answers" : questions[step].short}</p>
      </div>
      <div aria-hidden className="mt-3 grid grid-cols-3 gap-1.5">
        {questions.map((question, i) => (
          <span key={question.short} className="h-1.5 overflow-hidden rounded-full bg-white">
            <span
              className={cn(
                "block h-full origin-left rounded-full transition-transform duration-500 ease-emph motion-reduce:transition-none",
                i < step ? "bg-brand" : i === step ? "bg-mist" : "scale-x-0 bg-brand",
              )}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Big tappable answer cards. Tab or the arrow keys move between them; Enter or Space chooses. */
function OptionList<T extends string>({
  options,
  selected,
  onChoose,
  labelledBy,
}: {
  options: Option<T>[];
  selected?: T;
  onChoose: (value: T) => void;
  labelledBy: string;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const index = buttons.findIndex((button) => button === document.activeElement);
    if (index === -1) return;
    const last = buttons.length - 1;
    let next: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    buttons[next].focus();
  };

  return (
    <div role="group" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className="grid gap-3">
      {options.map(({ value, label, hint, icon: Icon, brand }) => {
        const isSelected = value === selected;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChoose(value)}
            className={cn(
              "group/opt flex min-h-24 w-full cursor-pointer items-center gap-4 rounded-card p-4 text-left ring-1 transition-[transform,box-shadow,background-color] duration-200 ease-emph hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] sm:gap-5 sm:p-5",
              isSelected ? "bg-tint-2 ring-brand" : "bg-white ring-line hover:shadow-soft hover:ring-brand",
            )}
          >
            <IconBadge variant={isSelected ? "deep" : "tint"} brandIcon={brand}>
              <Icon />
            </IconBadge>
            <span className="min-w-0 flex-1">
              <span className="block text-lg leading-snug font-medium text-ink">{label}</span>
              <span className="mt-0.5 block text-sm leading-snug text-muted">{hint}</span>
            </span>
            <span
              aria-hidden
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full transition-transform duration-200 ease-emph",
                isSelected ? "bg-deep text-white" : "bg-tint text-ink group-hover/opt:translate-x-0.5",
              )}
            >
              {isSelected ? <Check className="size-[18px]" strokeWidth={2} /> : <ArrowRight className="size-[18px]" strokeWidth={1.75} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AnswerChips({ answers, label }: { answers: Answers; label: string }) {
  const chosen = [
    labelOf(regionOptions, answers.region),
    labelOf(sourceOptions, answers.source),
    labelOf(needOptions, answers.need),
  ].filter((value): value is string => Boolean(value));
  if (chosen.length === 0) return null;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {chosen.map((value) => (
        <li key={value}>
          <Pill>
            <Check aria-hidden className="text-brand" />
            {value}
          </Pill>
        </li>
      ))}
    </ul>
  );
}

/** What the result card needs from a product. */
export type FinderProduct = Pick<Product, "slug" | "name" | "tagline" | "image">;

function Result({
  rec,
  products,
  region,
  source,
  answers,
  headingId,
  headingRef,
  onBack,
  onRestart,
}: {
  rec: Recommendation;
  products: FinderProduct[];
  region: Region;
  source: WaterSource;
  answers: Answers;
  headingId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onRestart: () => void;
}) {
  const product = products.find((item) => item.slug === rec.productSlug);
  const from = planFor(rec.filtration).fromMonthly;
  const action = quoteAction(rec, region, source);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <Pill variant="white">
          <Sparkles aria-hidden className="text-brand" />
          Recommended solution
        </Pill>
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="mt-5 text-h2 font-semibold text-ink focus:outline-none">
          {rec.headline}
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          <Pill variant="tint">{rec.plan}</Pill>
          <Pill>{pathLabels[rec.path]}</Pill>
        </div>
        {rec.path === "rent" && from !== null && (
          <p className="mt-4 text-[15px] text-muted">
            Rental from <span className="font-medium text-ink">{formatLKR(from)}</span>/month + VAT
          </p>
        )}

        <ul className="mt-7 grid gap-3">
          {rec.reasons.map((reason) => (
            <li key={reason} className="flex gap-3 text-[15px] leading-relaxed text-ink">
              <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                <Check className="size-3.5" strokeWidth={2.5} />
              </span>
              {reason}
            </li>
          ))}
        </ul>

        {rec.waterCheck && (
          <div className="mt-6 flex items-start gap-4 rounded-card-sm bg-white p-5 ring-1 ring-line">
            <IconBadge variant="tint" size="sm">
              <FlaskConical />
            </IconBadge>
            <p className="text-sm leading-relaxed text-muted">
              <span className="block font-medium text-ink">We’ll check your water first</span>
              When you request a quote, our team confirms UF or RO with a water check, where offered, before anything is installed.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={action.href} variant="primary" size="lg" arrow>
            {action.label}
          </ButtonLink>
          {product && (
            <ButtonLink href={`/water-purifiers/${product.slug}`} variant="outline" size="lg">
              View {product.name}
            </ButtonLink>
          )}
        </div>
      </div>

      {product && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-white sm:aspect-square lg:col-span-5 lg:self-start">
          <span
            aria-hidden
            className="absolute top-[56%] left-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tint-2"
          />
          <Image
            src={product.image}
            alt={`${product.name}, ${product.tagline.toLowerCase()}`}
            fill
            sizes="(min-width: 1024px) 420px, 90vw"
            className="object-contain px-10 py-8"
          />
          <Pill className="absolute top-4 left-4">{product.name}</Pill>
        </div>
      )}

      <div className="flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between lg:col-span-12">
        <AnswerChips answers={answers} label="Your answers" />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft aria-hidden className="size-4" />
            Back
          </Button>
          <Button variant="outline" onClick={onRestart}>
            <RotateCcw aria-hidden className="size-4" />
            Start again
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The brief's lead-generation engine: three questions, one per screen, then a UF / RO recommendation (Doc 1 §14). */
export function FindMySolution({ products, className }: { products: FinderProduct[]; className?: string }) {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const uid = useId();
  const headingId = `${uid}-heading`;

  // After every step change, move focus to the new question or the result. Never on first load.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step]);

  const go = (next: Step) => {
    moved.current = true;
    setStep(next);
  };

  const chooseRegion = (region: Region) => {
    setAnswers((current) => ({ ...current, region }));
    go(1);
  };

  const chooseSource = (source: WaterSource) => {
    setAnswers((current) => ({ ...current, source }));
    go(2);
  };

  const chooseNeed = (need: Need) => {
    const { region, source } = answers;
    if (!region || !source) {
      go(0);
      return;
    }
    const rec = recommend({ region, source, need });
    track("find_solution_completed", {
      region,
      water_source: source,
      need,
      recommended_path: rec.path,
      filtration: rec.filtration,
      product: rec.productSlug,
    });
    setAnswers({ region, source, need });
    go(3);
  };

  const back = () => go(step === 3 ? 2 : step === 2 ? 1 : 0);

  const restart = () => {
    setAnswers({});
    go(0);
  };

  const { region, source, need } = answers;
  const rec = step === 3 && region && source && need ? recommend({ region, source, need }) : null;
  const question = questions[Math.min(step, 2)];

  return (
    <div className={cn("relative overflow-hidden rounded-card-xl bg-tint p-5 sm:p-8 lg:p-12", className)}>
      <Progress step={step} />

      <div key={step} className="mt-8 animate-fade-up motion-reduce:animate-none sm:mt-10">
        {rec && region && source ? (
          <Result
            rec={rec}
            products={products}
            region={region}
            source={source}
            answers={answers}
            headingId={headingId}
            headingRef={headingRef}
            onBack={back}
            onRestart={restart}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12">
            <div className="lg:col-span-5">
              <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-h2 font-semibold text-ink focus:outline-none">
                {question.title}
              </h2>
              <p className="mt-4 text-muted">{question.help}</p>
            </div>

            <div className="lg:col-span-7 lg:row-span-2">
              {step === 0 && <OptionList options={regionOptions} selected={region} onChoose={chooseRegion} labelledBy={headingId} />}
              {step === 1 && <OptionList options={sourceOptions} selected={source} onChoose={chooseSource} labelledBy={headingId} />}
              {step === 2 && <OptionList options={needOptions} selected={need} onChoose={chooseNeed} labelledBy={headingId} />}
            </div>

            <div className="flex flex-col items-start gap-5 lg:col-span-5 lg:self-end">
              <AnswerChips answers={step === 1 ? { region } : step === 2 ? { region, source } : {}} label="Your answers so far" />
              {step > 0 ? (
                <Button variant="outline" onClick={back}>
                  <ArrowLeft aria-hidden className="size-4" />
                  Back
                </Button>
              ) : (
                <p className="text-sm text-muted">Three quick questions. No sign-up needed.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
