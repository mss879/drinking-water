"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ContactList } from "@/components/layout/contact-list";
import { ButtonLink } from "@/components/ui/button";
import { SocialIcons } from "@/components/ui/social-icons";
import type { SiteContact, SocialLink } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * The phone action bar's "Contact" button: a sheet slides up with every number, the emergency hotline, WhatsApp and
 * email, each one tap away, and the quote form a tap further (client: make the contact details easy to reach).
 */
export function ContactSheet({ contact, social, className }: { contact: SiteContact; social: SocialLink[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-14 w-full cursor-pointer flex-col items-center justify-center rounded-card-sm bg-deep leading-tight text-white transition-transform active:scale-[0.98]",
          className,
        )}
      >
        <span className="text-[15px] font-semibold">Contact</span>
        <span className="text-xs">Call or get a quote</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            className="absolute inset-x-0 bottom-0 max-h-[88svh] animate-fade-up overflow-y-auto rounded-t-3xl bg-canvas px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-float"
          >
            <div className="flex items-center justify-between gap-4 px-3 pt-2">
              <h2 id={titleId} className="font-display text-xl font-bold text-ink">
                Talk to LUSAKO
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close contact details"
                className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-white text-deep"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <ContactList contact={contact} className="mt-2" />
            <SocialIcons links={social} className="px-3 pt-1" />
            <div className="mt-4 px-3">
              <ButtonLink href="/contact" size="lg" arrow className="w-full" onClick={() => setOpen(false)}>
                Get a quote
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
