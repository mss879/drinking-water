"use client";

import { useEffect, type CSSProperties } from "react";
import { HeroCard } from "@/components/sections/hero-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { Pill } from "@/components/ui/pill";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * When a public page fails to render (Supabase down mid-request, for example), the visitor keeps the header and
 * footer and gets a way forward instead of a blank screen. Server errors arrive without their details in production.
 */
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <HeroCard labelledBy="page-title">
      <WaveLines lines={4} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-brand/25" />
      <div className="flex min-h-[26rem] flex-col items-center justify-center px-5 pt-[calc(var(--header-h)+2rem)] pb-12 text-center sm:px-8 lg:min-h-[min(36rem,64svh)] lg:pb-16">
        <div className="rise">
          <Pill variant="glass">Something went wrong</Pill>
        </div>
        <h1
          id="page-title"
          className="mt-5 font-display text-[length:clamp(1.85rem,1.25rem+2.6vw,3rem)] leading-[1.08] font-bold tracking-[-0.03em]"
        >
          This page didn’t <Highlight>load properly</Highlight>
        </h1>
        <p className="rise mt-5 max-w-xl text-lead text-white/80" style={delay(120)}>
          Please try again. If it keeps happening, call or WhatsApp us and we’ll help you straight away.
        </p>
        <div className="rise mt-8 flex flex-wrap justify-center gap-3" style={delay(200)}>
          <Button type="button" variant="white" size="lg" onClick={() => retry()}>
            Try again
          </Button>
          <ButtonLink href="/contact" variant="glass" size="lg" arrow>
            Contact LUSAKO
          </ButtonLink>
        </div>
      </div>
    </HeroCard>
  );
}
