import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleDashed } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { isMissingSchema } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Connect Supabase" };

/** Whether the migrations have run: the admin table exists (anon may not read it, but it is there). */
async function tablesExist() {
  const supabase = createPublicClient();
  if (!supabase) return false;
  const { error } = await supabase.from("blog_posts").select("id", { head: true, count: "exact" }).limit(1);
  return !isMissingSchema(error);
}

const steps = [
  {
    title: "Run the migrations",
    body: (
      <>
        In Supabase, open the SQL editor and run the seven files in <code>supabase/migrations</code>, in order (admin access,
        inquiries, CRM, web analytics, blog, dashboard, website content).
      </>
    ),
  },
  {
    title: "Create the admin account",
    body: (
      <>
        Authentication → Users → Add user, with an email and password, and tick “Auto Confirm User”. Then put that email
        in <code>supabase/setup-admin.sql</code> and run it.
      </>
    ),
  },
  {
    title: "Add the keys to the website",
    body: (
      <>
        Project Settings → API Keys. Set <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
        and <code>SUPABASE_SECRET_KEY</code> in <code>.env.local</code> and in your hosting settings, then restart or redeploy.
      </>
    ),
  },
  {
    title: "Lock the front door (recommended)",
    body: <>Authentication → Sign In / Providers → turn off “Allow new users to sign up”. Only the admins you add can then sign in.</>,
  },
];

export default async function SetupPage() {
  const configured = isSupabaseConfigured();
  const hasSecret = Boolean(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY);
  const migrated = configured && (await tablesExist());
  const ready = configured && hasSecret && migrated;

  const checks = [
    { label: "Supabase URL and publishable key", ok: configured },
    { label: "Secret key (server only)", ok: hasSecret },
    { label: "Database tables", ok: migrated },
  ];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-2xl">
        <Logo title="LUSAKO" className="h-8 w-auto" />
        <h1 className="mt-8 font-display text-3xl font-bold tracking-[-0.02em] text-ink">
          {ready ? "Supabase is connected" : "Connect Supabase"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {ready
            ? "Everything the admin needs is in place."
            : "The admin runs on Supabase. Four steps, about ten minutes; the full guide is in supabase/README.md."}
        </p>

        <ul className="mt-8 grid gap-2 sm:grid-cols-3">
          {checks.map((check) => (
            <li key={check.label} className="card-line flex items-center gap-2.5 rounded-card-sm px-4 py-3 text-sm">
              {check.ok ? (
                <CircleCheck aria-hidden className="size-4 shrink-0 text-deep" />
              ) : (
                <CircleDashed aria-hidden className="size-4 shrink-0 text-muted" />
              )}
              <span className={cn(check.ok ? "text-ink" : "text-muted")}>{check.label}</span>
              <span className="sr-only">{check.ok ? "(done)" : "(to do)"}</span>
            </li>
          ))}
        </ul>

        {ready ? (
          <ButtonLink href="/admin/login" size="lg" arrow className="mt-8">
            Sign in
          </ButtonLink>
        ) : (
          <ol className="mt-8 grid gap-3">
            {steps.map((step, i) => (
              <li key={step.title} className="card-line flex gap-4 p-5 sm:p-6">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-deep font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 [&_code]:rounded-md [&_code]:bg-tint-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-deep">
                  <h2 className="font-display font-bold text-ink">{step.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        <Link href="/" className="mt-10 inline-block text-sm font-medium text-deep hover:text-ink">
          Back to the website
        </Link>
      </div>
    </div>
  );
}
