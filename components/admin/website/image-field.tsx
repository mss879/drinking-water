"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "@/components/admin/ui/toaster";
import { buttonClasses } from "@/components/ui/button";
import type { MediaFolder } from "@/lib/cms/media";
import { uploadSiteImage } from "@/lib/cms/upload";
import { cn } from "@/lib/cn";

/**
 * An image picker for the Website section: the current image, then Upload (or Replace) and Remove. Uploading resizes
 * the file in the browser and stores it straight away; the record only changes when its form is saved.
 */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  owner,
  hint,
  aspect = "aspect-[4/3]",
  contain = true,
  removable = true,
  className,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: MediaFolder;
  owner?: string;
  hint?: string;
  aspect?: string;
  contain?: boolean;
  removable?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  async function choose(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadSiteImage(file, folder, owner);
      onChange(url);
    } catch (error) {
      toast(error instanceof Error ? error.message : "The image couldn’t be uploaded.", "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <span id={`${id}-label`} className="text-[13px] font-semibold text-ink">
        {label}
      </span>
      <div
        className={cn("relative grid place-items-center overflow-hidden rounded-card-sm border border-dashed border-line bg-tint", aspect)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void choose(event.dataTransfer.files[0]);
        }}
      >
        {value ? (
          <Image src={value} alt="" fill sizes="(min-width: 1024px) 360px, 90vw" className={contain ? "object-contain p-4" : "object-cover"} />
        ) : (
          <span className="px-4 text-center text-sm text-muted">No image yet. Upload one, or drop it here.</span>
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <LoaderCircle aria-hidden className="size-6 animate-spin text-deep" />
            <span className="sr-only">Uploading…</span>
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label htmlFor={id} className={cn(buttonClasses({ variant: "outline", size: "sm" }), "cursor-pointer", busy && "pointer-events-none opacity-50")}>
          <ImagePlus aria-hidden className="size-4" />
          {value ? "Replace" : "Upload"}
        </label>
        <input
          ref={input}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          aria-labelledby={`${id}-label`}
          className="sr-only"
          onChange={(event) => void choose(event.target.files?.[0])}
        />
        {removable && value && (
          <button type="button" onClick={() => onChange(null)} className={cn(buttonClasses({ variant: "ghost", size: "sm" }), "cursor-pointer")}>
            <Trash2 aria-hidden className="size-4" />
            Remove
          </button>
        )}
      </div>
      {hint && <p className="text-[13px] text-muted">{hint}</p>}
    </div>
  );
}
