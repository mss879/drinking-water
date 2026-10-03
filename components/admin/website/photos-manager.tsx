"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImagePlus, LoaderCircle, RotateCcw } from "lucide-react";
import { savePhoto } from "@/app/actions/admin/website";
import { Badge } from "@/components/admin/ui/badge";
import { Field, Input } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button, buttonClasses } from "@/components/ui/button";
import type { PhotoKey } from "@/content/images";
import { uploadSiteImage } from "@/lib/cms/upload";
import { cn } from "@/lib/cn";

export type PhotoSlot = { key: PhotoKey; number: number; title: string; usedOn: string; src: string; alt: string; custom: boolean };

function SlotCard({ slot }: { slot: PhotoSlot }) {
  const router = useRouter();
  const [alt, setAlt] = useState(slot.alt);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputId = `photo-${slot.key}`;

  const persist = (photo: { src: string; alt: string } | null) =>
    startTransition(async () => {
      const result = await savePhoto(slot.key, photo);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Saved.");
      router.refresh();
    });

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadSiteImage(file, "photos");
      persist({ src: url, alt });
    } catch (error) {
      toast(error instanceof Error ? error.message : "The photo couldn’t be uploaded.", "error");
    } finally {
      setUploading(false);
    }
  }

  const busy = uploading || pending;
  return (
    <li className="card-line flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] bg-ink">
        <Image src={slot.src} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 640px) 45vw, 90vw" className="object-cover grayscale" />
        <span className="absolute top-3 left-3 flex gap-1.5">
          <Badge tone="white">Photo {slot.number}</Badge>
          {slot.custom ? <Badge tone="solid">Replaced</Badge> : <Badge tone="muted" className="bg-white/80">Original</Badge>}
        </span>
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/60">
            <LoaderCircle aria-hidden className="size-6 animate-spin text-deep" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{slot.title}</h2>
          <p className="text-sm text-muted">On: {slot.usedOn}</p>
        </div>
        <Field label="Description for screen readers" htmlFor={`${inputId}-alt`}>
          <Input id={`${inputId}-alt`} value={alt} onChange={(event) => setAlt(event.target.value)} />
        </Field>
        <div className="mt-auto flex flex-wrap gap-2">
          <label htmlFor={inputId} className={cn(buttonClasses({ variant: "primary", size: "sm" }), "cursor-pointer", busy && "pointer-events-none opacity-50")}>
            <ImagePlus aria-hidden className="size-4" /> Replace photo
          </label>
          <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} />
          {slot.custom && alt !== slot.alt && (
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => persist({ src: slot.src, alt })}>
              Save description
            </Button>
          )}
          {slot.custom && (
            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => persist(null)}>
              <RotateCcw aria-hidden className="size-4" /> Use the original
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * The website's lifestyle photos, numbered as in the client's change list, each replaceable in place. A new photo
 * shows in black & white like the rest of the site's photography.
 */
export function PhotosManager({ slots }: { slots: PhotoSlot[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {slots.map((slot) => (
        <SlotCard key={`${slot.key}-${slot.src}`} slot={slot} />
      ))}
    </ul>
  );
}
