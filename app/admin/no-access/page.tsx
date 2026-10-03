import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { signOut } from "@/app/actions/admin/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "No access" };

/** Signed in, but not on the admin list. */
export default async function NoAccessPage() {
  if (!isSupabaseConfigured()) redirect("/admin/setup");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/admin/login");

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", claims.sub).maybeSingle();
  if (admin) redirect("/admin");

  const email = typeof claims.email === "string" ? claims.email : "this account";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <Logo title="LUSAKO" className="h-8 w-auto" />
        <div className="card-line mt-8 p-6 sm:p-8">
          <span className="grid size-12 place-items-center rounded-full bg-tint-2 text-deep">
            <ShieldAlert aria-hidden className="size-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-ink">This account isn’t an admin</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            You’re signed in as <strong className="font-semibold text-ink">{email}</strong>, which isn’t on the admin list. Someone
            with access to Supabase can add it by running <code className="rounded-md bg-tint-2 px-1.5 py-0.5 text-[13px] text-deep">supabase/setup-admin.sql</code> with this email.
          </p>
          <form action={signOut} className="mt-6">
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
