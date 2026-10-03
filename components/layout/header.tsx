"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { ContactList } from "@/components/layout/contact-list";
import { useOverHero } from "@/components/layout/hero-tone";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { SocialIcons } from "@/components/ui/social-icons";
import { primaryNav, type NavItem, type NavLink, type SiteContact, type SocialLink } from "@/content/site";
import { cn } from "@/lib/cn";

type Tone = "dark" | "light";

/**
 * The navigation floats: one glass bar carrying the logo, a capsule of links, Buy, Rent and the contact menu. It is
 * smoked glass with white type while it sits on a page's dark hero card (the home film or an inner page's compact
 * hero), and frosted white with ink type once that card has scrolled away.
 */
const bar: Record<Tone, string> = {
  dark: "border-white/15 bg-ink/55 text-white",
  light: "border-line bg-white/85 text-ink shadow-soft",
};
const capsule: Record<Tone, string> = { dark: "bg-white/10", light: "bg-tint" };
const navLink =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200";
const navIdle: Record<Tone, string> = {
  dark: "text-white/85 hover:bg-white/15 hover:text-white",
  light: "text-ink hover:bg-white hover:text-deep",
};
const navCurrent: Record<Tone, string> = { dark: "bg-white text-ink", light: "bg-white text-deep shadow-soft" };

function isActive(pathname: string, item: NavItem) {
  return item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Open on hover or click, close on Escape or a click elsewhere: the behaviour every menu in the bar shares. A mouse
 * opens the menu as it arrives, so a click straight after that keeps it open instead of toggling it shut.
 */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const openedAt = useRef(0);
  const onEnter = () => {
    openedAt.current = performance.now();
    setOpen(true);
  };
  const onLeave = () => setOpen(false);
  const onToggle = () => setOpen((value) => (value && performance.now() - openedAt.current < 600 ? true : !value));
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref, onEnter, onLeave, onToggle };
}

/** The product categories as small pills, for the Water Purifiers menu. */
function Chips({ chips, onNavigate, className }: { chips: NavLink[]; onNavigate: () => void; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link
            href={chip.href}
            onClick={onNavigate}
            className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink transition-colors hover:border-deep hover:text-deep"
          >
            {chip.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NavDropdown({ item, active, tone }: { item: NavItem; active: boolean; tone: Tone }) {
  const { open, setOpen, ref, onEnter, onLeave, onToggle } = usePopover();
  const panelId = useId();
  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(navLink, active || open ? navCurrent[tone] : navIdle[tone])}
      >
        {item.label}
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div id={panelId} hidden={!open} className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-4">
        <div className="card-line w-[360px] animate-fade-up p-2 shadow-float">
          {item.chips && (
            <div className="border-b border-line px-4 pt-3 pb-4">
              <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Browse by type</p>
              <Chips chips={item.chips} onNavigate={close} className="mt-2.5" />
            </div>
          )}
          <ul className={cn(item.chips && "pt-2")}>
            {item.children?.map((child) => (
              <li key={child.label}>
                <Link
                  href={child.href}
                  onClick={close}
                  className="group/item flex items-start justify-between gap-4 rounded-card-sm px-4 py-3 transition-colors hover:bg-tint"
                >
                  <span>
                    <span className="block font-display text-[15px] font-semibold text-ink">{child.label}</span>
                    {child.description && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{child.description}</span>}
                  </span>
                  <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-deep transition-transform group-hover/item:rotate-45" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * "Contact / Get a quote" next to Buy and Rent (client request): every number, the emergency hotline, WhatsApp,
 * email and opening hours one hover away on every page, with the quote form a click further.
 */
function ContactMenu({ tone, contact, social }: { tone: Tone; contact: SiteContact; social: SocialLink[] }) {
  const { open, setOpen, ref, onEnter, onLeave, onToggle } = usePopover();
  const panelId = useId();
  const variant = tone === "dark" ? "white" : "primary";

  return (
    <div ref={ref} className="relative ml-1.5" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={buttonClasses({ variant, size: "sm", arrow: true, className: "cursor-pointer whitespace-nowrap" })}
      >
        Contact / Get a quote
        <span
          aria-hidden
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full",
            tone === "dark" ? "bg-deep text-white" : "bg-white text-deep",
          )}
        >
          <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} strokeWidth={2.25} />
        </span>
      </button>
      <div id={panelId} hidden={!open} className="absolute top-full right-0 z-50 pt-4">
        <div className="card-line w-[640px] max-w-[calc(100vw-2rem)] animate-fade-up p-3 text-ink shadow-float">
          <div className="flex items-start justify-between gap-4 px-3 pt-2 pb-1">
            <div>
              <p className="font-display text-lg font-bold text-ink">Talk to LUSAKO</p>
              <p className="text-[13px] text-muted">Call, message or email, or send us a quote request.</p>
            </div>
            <SocialIcons links={social} />
          </div>
          <ContactList contact={contact} className="mt-1 grid-cols-2" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-card-sm bg-tint px-4 py-3">
            <p className="text-sm text-ink">Tell us what you need and we’ll come back with a quote.</p>
            <ButtonLink href="/contact" size="sm" arrow onClick={() => setOpen(false)}>
              Get a quote
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ onNavigate, contact, social }: { onNavigate: () => void; contact: SiteContact; social: SocialLink[] }) {
  return (
    <div id="mobile-menu" className="fixed inset-0 z-40 xl:hidden">
      <button type="button" aria-label="Close menu" tabIndex={-1} onClick={onNavigate} className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm" />
      <div
        data-lenis-prevent
        className="absolute inset-x-[5px] top-(--header-h) bottom-[5px] animate-fade-up overflow-y-auto rounded-2xl border border-line bg-canvas shadow-float"
      >
        <Container className="flex flex-col gap-8 pt-2 pb-36">
          <nav aria-label="Mobile">
            <ul>
              {primaryNav.map((item) => (
                <li key={item.label} className="border-b border-line py-5">
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="flex items-center justify-between gap-4 font-display text-2xl font-semibold text-ink"
                  >
                    {item.label}
                    <span className="grid size-10 place-items-center rounded-full bg-tint-2 text-deep">
                      <ArrowUpRight aria-hidden className="size-5" />
                    </span>
                  </Link>
                  {item.chips && <Chips chips={item.chips} onNavigate={onNavigate} className="mt-4" />}
                  {item.children && (
                    <ul className="mt-4 grid grid-cols-2 gap-2">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            onClick={onNavigate}
                            className="block rounded-chip bg-tint px-3.5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-tint-2"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-3">
            <ButtonLink href="/contact" onClick={onNavigate} size="lg" arrow>
              Contact / Get a quote
            </ButtonLink>
            <ButtonLink href="/find-my-solution" onClick={onNavigate} variant="outline" size="lg" arrow>
              Find my solution
            </ButtonLink>
          </div>
          <section aria-labelledby="mobile-contact-title" className="card-line p-2">
            <h2 id="mobile-contact-title" className="px-3 pt-3 font-display text-lg font-bold text-ink">
              Talk to LUSAKO
            </h2>
            <ContactList contact={contact} className="mt-1" />
            <SocialIcons links={social} className="px-3 pt-2 pb-3" />
          </section>
        </Container>
      </div>
    </div>
  );
}

export function Header({ contact, social }: { contact: SiteContact; social: SocialLink[] }) {
  const pathname = usePathname();
  // The menu is "open for" a path, so navigating anywhere closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mobileOpen = menuPath === pathname;
  // Smoked glass while a dark hero card is under the pill (components/layout/hero-tone.ts).
  const overHero = useOverHero();
  const tone: Tone = overHero && !mobileOpen ? "dark" : "light";

  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* The header keeps its place in the flow (so pages start below it) but only the pill takes clicks; the
          home hero slides up underneath it. */}
      <header className="pointer-events-none sticky top-0 z-50 h-(--header-h)">
        <div className="w-full px-3 pt-3 sm:px-5 lg:px-(--edge) lg:pt-3.5">
          <div
            data-surface={tone}
            className={cn(
              "nav-enter pointer-events-auto flex h-13 items-center justify-between gap-3 rounded-2xl border pr-1.5 pl-5 backdrop-blur-xl transition-[background-color,border-color,box-shadow,color] duration-500 lg:h-14.5 lg:pr-2 lg:pl-6",
              bar[tone],
            )}
          >
            <Link href="/" aria-label="LUSAKO home" className="-my-2 shrink-0 rounded-lg py-2">
              <Logo inverted={tone === "dark"} className="h-[26px] w-auto lg:h-[30px]" />
            </Link>

            <nav
              aria-label="Primary"
              className={cn("hidden items-center gap-0.5 rounded-xl p-1 transition-colors duration-500 xl:flex", capsule[tone])}
            >
              {primaryNav.map((item) => {
                const active = isActive(pathname, item);
                return item.children ? (
                  <NavDropdown key={item.label} item={item} active={active} tone={tone} />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(navLink, active ? navCurrent[tone] : navIdle[tone])}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <div className="hidden items-center gap-0.5 lg:flex">
                <Link href="/water-purifiers" className={cn(navLink, navIdle[tone])}>
                  Buy
                </Link>
                <Link href="/rental" className={cn(navLink, navIdle[tone])}>
                  Rent
                </Link>
                <ContactMenu tone={tone} contact={contact} social={social} />
              </div>
              <button
                type="button"
                onClick={() => setMenuPath(mobileOpen ? null : pathname)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className={cn(
                  "grid size-10 cursor-pointer place-items-center rounded-xl border transition-colors duration-300 xl:hidden",
                  tone === "dark" ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : "border-line bg-white text-deep hover:border-deep",
                )}
              >
                {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {mobileOpen && <MobileMenu onNavigate={() => setMenuPath(null)} contact={contact} social={social} />}
    </>
  );
}

