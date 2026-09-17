"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { primaryNav, site, type NavItem } from "@/content/site";
import { cn } from "@/lib/cn";
import { HERO_CHANGE_EVENT } from "@/lib/events";

const navPill = "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-300";

/** Pill colours for the solid header, and for the see-through header over the home hero film. */
function pillTone(overlay: boolean, highlighted: boolean) {
  if (overlay) {
    return highlighted
      ? "border-transparent bg-white text-ink"
      : "border-white/25 bg-white/10 text-white backdrop-blur-md hover:border-white/50 hover:bg-white/20";
  }
  return highlighted ? "border-transparent bg-pastel text-ink" : "border-line bg-white text-ink hover:border-ink/25";
}

function isActive(pathname: string, item: NavItem) {
  return item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** True while a hero film ([data-hero]) is under the header and the light content after it ([data-hero-cover]) hasn't reached it. */
function readOverHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return false;
  const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
  const cover = document.querySelector("[data-hero-cover]");
  const edge = cover ? cover.getBoundingClientRect().top : hero.getBoundingClientRect().bottom;
  return edge > headerHeight / 2;
}

function subscribeToHero(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  window.addEventListener(HERO_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
    window.removeEventListener(HERO_CHANGE_EVENT, onChange);
  };
}

function NavDropdown({ item, active, overlay }: { item: NavItem; active: boolean; overlay: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const highlighted = active || open;

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

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(navPill, "cursor-pointer", pillTone(overlay, highlighted))}
      >
        <item.icon aria-hidden className={cn("size-4", overlay && !highlighted ? "text-white/80" : "text-brand")} strokeWidth={1.75} />
        {item.label}
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div id={panelId} hidden={!open} className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3">
        <ul className="w-[340px] animate-fade-up rounded-card bg-white p-2 shadow-float ring-1 ring-line">
          {item.children?.map((child) => (
            <li key={child.label}>
              <Link
                href={child.href}
                onClick={() => setOpen(false)}
                className="group/item flex items-start justify-between gap-4 rounded-card-sm px-4 py-3 transition-colors hover:bg-frost"
              >
                <span>
                  <span className="block font-medium text-ink">{child.label}</span>
                  {child.description && <span className="mt-0.5 block text-sm text-muted">{child.description}</span>}
                </span>
                <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-subtle transition-transform group-hover/item:rotate-45" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div
      id="mobile-menu"
      data-lenis-prevent
      className="fixed inset-x-0 top-[72px] bottom-0 z-40 animate-fade-up overflow-y-auto border-t border-line bg-white lg:top-20 xl:hidden"
    >
      <Container className="flex flex-col gap-8 pt-4 pb-36">
        <nav aria-label="Mobile">
          <ul>
            {primaryNav.map((item) => (
              <li key={item.label} className="border-b border-line py-4">
                <Link href={item.href} onClick={onNavigate} className="flex items-center justify-between gap-4 text-xl font-medium text-ink">
                  <span className="flex items-center gap-3">
                    <item.icon aria-hidden className="size-5 text-brand" strokeWidth={1.75} />
                    {item.label}
                  </span>
                  <ArrowUpRight aria-hidden className="size-5 text-subtle" />
                </Link>
                {item.children && (
                  <ul className="mt-3 grid grid-cols-2 gap-2">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          className="block rounded-chip bg-frost px-3 py-2.5 text-[15px] text-ink transition-colors hover:bg-ice"
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
          <ButtonLink href="/find-my-solution" onClick={onNavigate} variant="pastel" size="lg" arrow>
            Find my solution
          </ButtonLink>
          <ButtonLink href="/contact" onClick={onNavigate} variant="dark" size="lg" arrow>
            Get a quote
          </ButtonLink>
        </div>
        <a href={site.contact.phoneHref} className="inline-flex items-center gap-2 text-muted">
          <Phone aria-hidden className="size-4" /> {site.contact.phoneDisplay}
        </a>
      </Container>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  // The menu is "open for" a path, so navigating anywhere closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mobileOpen = menuPath === pathname;
  // Over the home hero film the header goes see-through, until "Choose your way" slides up beneath it.
  const overHero = useSyncExternalStore(subscribeToHero, readOverHero, () => pathname === "/");
  const overlay = overHero && !mobileOpen;

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
      <header
        className={cn(
          "sticky top-0 z-50 transition-colors duration-300",
          overlay ? "bg-transparent" : "header-shadow bg-white/85 backdrop-blur-xl",
        )}
      >
        <Container className="flex h-[72px] items-center justify-between gap-4 lg:h-20">
          <Link href="/" aria-label="LUSAKO home" className="shrink-0 rounded-lg">
            <Logo inverted={overlay} className="h-[30px] w-auto lg:h-[34px]" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-2 xl:flex">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item);
              return item.children ? (
                <NavDropdown key={item.label} item={item} active={active} overlay={overlay} />
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(navPill, pillTone(overlay, active))}
                >
                  <item.icon aria-hidden className={cn("size-4", overlay && !active ? "text-white/80" : "text-brand")} strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <ButtonLink href="/water-purifiers" variant={overlay ? "glass" : "outline"} size="sm">
                Buy
              </ButtonLink>
              <ButtonLink href="/rental" variant={overlay ? "glass" : "pastel"} size="sm">
                Rent
              </ButtonLink>
              <ButtonLink href="/contact" variant={overlay ? "white" : "dark"} size="sm" arrow>
                Get a quote
              </ButtonLink>
            </div>
            <button
              type="button"
              onClick={() => setMenuPath(mobileOpen ? null : pathname)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className={cn(
                "grid size-11 cursor-pointer place-items-center rounded-full border transition-colors duration-300 xl:hidden",
                overlay
                  ? "border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  : "border-line bg-white text-ink hover:border-ink/25",
              )}
            >
              {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
          </div>
        </Container>
      </header>
      {mobileOpen && <MobileMenu onNavigate={() => setMenuPath(null)} />}
    </>
  );
}
