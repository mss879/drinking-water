"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { signOut } from "@/app/actions/admin/auth";
import { Dialog } from "@/components/admin/ui/dialog";
import { Field, Input } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/browser";

/** The signed-in admin: their email, change password and sign out. */
export function AccountMenu({ email, tone }: { email: string; tone: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initial = (email[0] ?? "A").toUpperCase();

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
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-xl text-left transition-colors",
          tone === "dark" ? "w-full px-2 py-2 hover:bg-white/10" : "p-1 hover:bg-tint",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold",
            tone === "dark" ? "bg-white text-deep" : "bg-deep text-white",
          )}
        >
          {initial}
        </span>
        {tone === "dark" ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-mist">Signed in as</span>
              <span className="block truncate text-sm font-medium text-white">{email}</span>
            </span>
            <ChevronDown aria-hidden className={cn("size-4 text-mist transition-transform", open && "rotate-180")} />
          </>
        ) : (
          <span className="sr-only">Account menu for {email}</span>
        )}
      </button>

      <div
        id={menuId}
        hidden={!open}
        className={cn(
          "absolute z-50 w-64 animate-fade-up rounded-card-sm border border-line bg-white p-1.5 text-ink shadow-float",
          tone === "dark" ? "bottom-full left-0 mb-2" : "top-full right-0 mt-2",
        )}
      >
        {tone === "light" && <p className="truncate px-3 pt-2 pb-2.5 text-xs text-muted">{email}</p>}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setPasswordOpen(true);
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-chip px-3 py-2.5 text-sm font-medium transition-colors hover:bg-tint"
        >
          <KeyRound aria-hidden className="size-4 text-deep" />
          Change password
        </button>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-chip px-3 py-2.5 text-sm font-medium transition-colors hover:bg-tint"
          >
            <LogOut aria-hidden className="size-4 text-deep" />
            Sign out
          </button>
        </form>
      </div>

      <ChangePassword open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}

function ChangePassword({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 10) return setError("Use at least 10 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setPending(true);
    setError(null);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setPending(false);
    if (updateError) return setError(updateError.message);
    toast("Password changed.");
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Change password" description="You'll use the new password next time you sign in.">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="New password" htmlFor="new-password">
          <Input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={10} />
        </Field>
        <Field label="Repeat it" htmlFor="confirm-password" error={error ?? undefined}>
          <Input id="confirm-password" name="confirm" type="password" autoComplete="new-password" required />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save password
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
