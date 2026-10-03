"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, Input } from "@/components/admin/ui/field";
import { Button } from "@/components/ui/button";
import { NO_TRACK_KEY } from "@/lib/analytics/config";
import { createClient } from "@/lib/supabase/browser";

/**
 * Signs in from the browser, as Supabase recommends: its rate limits then apply per visitor rather than to the
 * server's single IP. Accounts that aren't on the admin list are signed straight back out.
 */
export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return setError("Enter your email and password.");

    setPending(true);
    setError(null);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setPending(false);
      const rateLimited = signInError?.status === 429 || /rate limit/i.test(signInError?.message ?? "");
      return setError(rateLimited ? "Too many attempts. Wait a minute, then try again." : "That email and password don’t match.");
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (adminError || !admin) {
      await supabase.auth.signOut();
      setPending(false);
      return setError(
        adminError
          ? "Signed in, but the admin tables aren’t there yet. Run the migrations in supabase/migrations first."
          : `${email} isn’t on the admin list yet. Add it with supabase/setup-admin.sql, then sign in again.`,
      );
    }

    // This browser belongs to an admin: keep its visits out of the website analytics.
    try {
      window.localStorage.setItem(NO_TRACK_KEY, "1");
    } catch {}
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" inputMode="email" required autoFocus />
      </Field>
      <Field label="Password" htmlFor="password" error={error ?? undefined}>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={error ? true : undefined}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-tint hover:text-deep"
          >
            {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        </div>
      </Field>
      <Button type="submit" size="lg" arrow loading={pending} className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
