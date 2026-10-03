import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { HeroCard } from "@/components/sections/hero-card";
import { ButtonArrow, ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";

export type Crumb = { label: string; href: string };

export type HeroAction = {
  label: string;
  href: string;
  /** A leading icon replaces the arrow circle (e.g. a phone or WhatsApp action). */
  icon?: LucideIcon;
  /** Opens in a new tab (WhatsApp); `tel:` and `mailto:` links don't need it. */
  external?: boolean;
  /** Extra words for screen readers, e.g. "(opens WhatsApp)". */
  srLabel?: string;
};

export type HeroImage = {
  src: StaticImageData | string;
  /** object-position for the crop, e.g. "object-[50%_40%]". */
  position?: string;
  /** Turn a colour photo black & white, like every lifestyle photo on the site (blog covers). */
  mono?: boolean;
  /** Describe the photo when it carries meaning (a blog cover); without it the photo is decoration. */
  alt?: string;
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** BreadcrumbList structured data for a page (Home is added in front). */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const trail = [{ label: "Home", href: "/" }, ...items];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.label,
          item: new URL(crumb.href, site.url).toString(),
        })),
      }}
    />
  );
}

/** Visible breadcrumb trail plus BreadcrumbList structured data. `tone="dark"` sits on a hero card. */
export function Breadcrumbs({ items, tone = "light", className }: { items: Crumb[]; tone?: "light" | "dark"; className?: string }) {
  const trail = [{ label: "Home", href: "/" }, ...items];
  const dark = tone === "dark";
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", dark ? "text-white/65" : "text-muted")}>
          {trail.map((crumb, i) => (
            <li key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden className={cn("size-3.5", dark ? "text-mist" : "text-brand")} />}
              {i === trail.length - 1 ? (
                <span aria-current="page" className={cn("font-medium", dark ? "text-white" : "text-deep")}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={cn("-my-2.5 inline-block py-2.5 transition-colors", dark ? "hover:text-white" : "hover:text-deep")}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <BreadcrumbJsonLd items={items} />
    </>
  );
}

/** A hero button: the first action is white, the second glass, both pills like the home hero's. */
function HeroButton({ action, primary }: { action: HeroAction; primary: boolean }) {
  const variant = primary ? "white" : "glass";
  const Icon = action.icon;
  const label = (
    <>
      {Icon && <Icon aria-hidden className="size-4" />}
      {action.label}
      {action.srLabel && <span className="sr-only"> {action.srLabel}</span>}
    </>
  );
  const className = "w-full sm:w-auto";
  if (action.href.startsWith("/") || action.href.startsWith("#")) {
    return (
      <ButtonLink href={action.href} variant={variant} size="lg" arrow={!Icon} className={className}>
        {label}
      </ButtonLink>
    );
  }
  return (
    <a
      href={action.href}
      {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={buttonClasses({ variant, size: "lg", arrow: !Icon, className })}
    >
      {label}
      {!Icon && <ButtonArrow variant={variant} size="lg" />}
    </a>
  );
}

/**
 * Inner-page hero: a compact version of the home hero. The same dark rounded card slides up under the navigation
 * pill, with the page's photo where the home page has its film: on the right, melting into the dark on large screens,
 * and behind a soft shade on phones. Inside, kept as sparse as the home hero: a label, the headline, one intro line
 * and up to two buttons. Give `title` as an array to set each line on purpose (no orphaned words); each line rises
 * out of its own mask, like the home headline.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  description,
  actions = [],
  image,
  showCrumbs = crumbs.length > 1,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: ReactNode;
  title: ReactNode | ReactNode[];
  description?: ReactNode;
  actions?: HeroAction[];
  image: HeroImage;
  /** The trail is shown on nested pages; top-level pages only carry it as structured data. */
  showCrumbs?: boolean;
  /** Anything that belongs with the intro, e.g. an article's date and reading time. */
  children?: ReactNode;
}) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <HeroCard labelledBy="page-title">
      <div
        aria-hidden={image.alt ? undefined : true}
        className="film-enter absolute inset-0 -z-20 lg:left-auto lg:w-[66%] lg:[mask-image:linear-gradient(to_right,transparent,black_34%)]"
      >
        <Image
          src={image.src}
          alt={image.alt ?? ""}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 66vw, 100vw"
          data-no-parallax
          className={cn("object-cover", image.position ?? "object-center", image.mono && "grayscale")}
        />
      </div>
      {/* Phones and tablets: the text sits at the bottom of the card over the photo, so the shade is deepest there.
          Large screens: solid ink behind the text column, thinning to a light veil over the photo on the right. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/75 to-ink/50 lg:bg-linear-to-r lg:from-ink lg:from-35% lg:via-ink/40 lg:to-ink/10"
      />

      <div className="flex min-h-[26rem] flex-col justify-end px-5 pt-[calc(var(--header-h)+2.5rem)] pb-10 sm:min-h-[28rem] sm:px-8 sm:pb-12 lg:min-h-[min(36rem,64svh)] lg:justify-center lg:px-[calc(var(--edge)-5px)] lg:pb-14">
        <div className="max-w-[38rem]">
          {showCrumbs ? (
            <Breadcrumbs items={crumbs} tone="dark" className="rise mb-6" />
          ) : (
            <BreadcrumbJsonLd items={crumbs} />
          )}
          {eyebrow && (
            <div className="rise mb-6" style={delay(40)}>
              <Pill variant="glass">{eyebrow}</Pill>
            </div>
          )}
          <h1
            id="page-title"
            className="hero-title font-display text-[length:clamp(1.85rem,1.25rem+2.6vw,3rem)] leading-[1.08] font-bold tracking-[-0.03em]"
          >
            {lines.map((line, i) => (
              <span key={i} className="line-mask line-in">
                <span className="line" style={delay(120 + i * 80)}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          {description && (
            <p className="rise mt-5 max-w-xl text-lead text-white/80" style={delay(280)}>
              {description}
            </p>
          )}
          {children && (
            <div className="rise mt-5" style={delay(320)}>
              {children}
            </div>
          )}
          {actions.length > 0 && (
            <div className="rise mt-8 flex flex-wrap gap-3" style={delay(360)}>
              {actions.slice(0, 2).map((action, i) => (
                <HeroButton key={action.href} action={action} primary={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </HeroCard>
  );
}

/**
 * A quiet strip right under a hero, like the home page's "No …" strip: one line that sums the page up and the
 * pills that go with it. It carries the captions that used to sit on the old hero photos.
 */
export function HeroStrip({
  title,
  description,
  pills = [],
  highlight,
}: {
  title: ReactNode;
  description?: ReactNode;
  pills?: string[];
  /** One fact that stands out (a from-price), set in a solid pill after the others. */
  highlight?: ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <Container className="flex flex-col gap-5 py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-11" data-no-reveal>
        <div data-reveal="up" className="max-w-2xl">
          <p className="font-display text-h3 font-bold text-ink">{title}</p>
          {description && <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{description}</p>}
        </div>
        {(pills.length > 0 || highlight) && (
          <ul data-stagger className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
            {pills.map((pill) => (
              <li key={pill}>
                <Pill variant="tint">{pill}</Pill>
              </li>
            ))}
            {highlight && (
              <li>
                <Pill variant="deep">{highlight}</Pill>
              </li>
            )}
          </ul>
        )}
      </Container>
    </section>
  );
}
