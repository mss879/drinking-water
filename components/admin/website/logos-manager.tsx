"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Handshake, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteLogo, moveLogo, saveLogo, type LogoInput } from "@/app/actions/admin/website";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Input } from "@/components/admin/ui/field";
import { EmptyState } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { ImageField } from "@/components/admin/website/image-field";
import { RowActions } from "@/components/admin/website/row-actions";
import { Button } from "@/components/ui/button";
import type { ClientLogoRow } from "@/lib/supabase/types";

type Editing = { id: string | null; form: LogoInput };

const iconButton = "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-deep hover:text-deep";

/** The client logos on the Our clients page, in their order there. As many as the client likes: the grid grows. */
export function LogosManager({ logos }: { logos: ClientLogoRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<ClientLogoRow | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof LogoInput>(key: K, value: LogoInput[K]) =>
    setEditing((current) => (current ? { ...current, form: { ...current.form, [key]: value } } : current));
  const add = () => setEditing({ id: null, form: { name: "", image_url: "", website_url: "", published: true } });

  function save() {
    if (!editing) return;
    startTransition(async () => {
      const result = await saveLogo(editing.id, editing.form);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Saved.");
      setEditing(null);
      router.refresh();
    });
  }

  function remove() {
    if (!removing) return;
    startTransition(async () => {
      const result = await deleteLogo(removing.id);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Removed.");
      setRemoving(null);
      router.refresh();
    });
  }

  return (
    <>
      {logos.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button type="button" size="sm" onClick={add}>
            <Plus aria-hidden className="size-4" /> Add a logo
          </Button>
        </div>
      )}

      {logos.length === 0 ? (
        <div className="card-line">
          <EmptyState icon={<Handshake aria-hidden />} title="No client logos yet" action={<Button type="button" size="sm" onClick={add}>Add the first logo</Button>}>
            Add a logo only with the client’s written approval. Until there are logos, the page shows a short note instead.
          </EmptyState>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {logos.map((logo, i) => (
            <li key={logo.id} className="card-line flex flex-col gap-3 p-3">
              <div className="relative aspect-[3/2] overflow-hidden rounded-card-sm bg-white ring-1 ring-line ring-inset">
                <Image
                  src={logo.image_url}
                  alt={`${logo.name} logo`}
                  fill
                  sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw"
                  className="object-contain p-6 grayscale"
                />
                {!logo.published && (
                  <Badge tone="muted" className="absolute top-2 left-2">
                    Hidden
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="min-w-0">
                  <span className="block truncate font-display font-bold text-ink">{logo.name}</span>
                  <span className="block truncate text-xs text-muted">{logo.website_url ?? "No website link"}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    className={iconButton}
                    aria-label={`Edit ${logo.name}`}
                    onClick={() =>
                      setEditing({ id: logo.id, form: { name: logo.name, image_url: logo.image_url, website_url: logo.website_url ?? "", published: logo.published } })
                    }
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                  <button type="button" className={iconButton} aria-label={`Remove ${logo.name}`} onClick={() => setRemoving(logo)}>
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </span>
              </div>
              <RowActions name={logo.name} first={i === 0} last={i === logos.length - 1} onMove={moveLogo.bind(null, logo.id)} className="px-1 pb-1" />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? "Edit logo" : "Add a logo"}>
        {editing && (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <ImageField
              label="Logo"
              value={editing.form.image_url || null}
              onChange={(url) => set("image_url", url ?? "")}
              folder="logos"
              aspect="aspect-[3/2]"
              removable={false}
              hint="A PNG with a transparent background works best. The website shows logos in greyscale, so the page keeps to LUSAKO’s colours."
            />
            <Field label="Client name" htmlFor="logo-name" hint="Read out to screen-reader users and shown when the logo can’t load.">
              <Input id="logo-name" required value={editing.form.name} onChange={(event) => set("name", event.target.value)} />
            </Field>
            <Field label="Website (optional)" htmlFor="logo-url" hint="The logo links here, for example https://www.example.lk">
              <Input id="logo-url" type="url" inputMode="url" value={editing.form.website_url} onChange={(event) => set("website_url", event.target.value)} />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
              <input type="checkbox" checked={editing.form.published} onChange={(event) => set("published", event.target.checked)} className="size-4 accent-[var(--color-deep)]" />
              Show on the website
            </label>
            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                {editing.id ? "Save" : "Add logo"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        pending={pending}
        confirmLabel="Remove"
        title={`Remove the ${removing?.name ?? ""} logo?`}
        description="It disappears from the Our clients page."
      />
    </>
  );
}
