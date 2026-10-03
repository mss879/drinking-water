import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { safeAdminPath } from "@/lib/admin/paths";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  const target = safeAdminPath(typeof next === "string" ? next : null);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* The home hero's dark card, with the first frame of its film. */}
      <div
        data-surface="dark"
        className="relative isolate m-[5px] hidden overflow-hidden rounded-[1.25rem] bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <Image
          src="/video/hero-poster.jpg"
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="55vw"
          className="film-enter -z-20 object-cover object-[30%_50%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/55 to-ink/10" />
        <Logo inverted className="h-8 w-auto" />
        <div>
          <p className="font-display text-[length:clamp(2rem,1.4rem+1.6vw,3rem)] leading-[1.06] font-bold tracking-[-0.03em]">
            <span className="bg-linear-to-r from-brand to-mist bg-clip-text text-transparent">Pure water</span>
            <br />
            without the hassle
          </p>
          <p className="mt-4 max-w-sm text-white/75">Inquiries, the CRM pipeline, website analytics and the blog, in one place.</p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Logo title="LUSAKO" className="h-8 w-auto lg:hidden" />
          <h1 className="mt-10 font-display text-3xl font-bold tracking-[-0.02em] text-ink lg:mt-0">Sign in</h1>
          <p className="mt-2 text-[15px] text-muted">The LUSAKO admin. Accounts are created in Supabase.</p>
          <div className="mt-8">
            <LoginForm next={target} />
          </div>
          <Link
            href="/"
            className="group mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-deep transition-colors hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
}
