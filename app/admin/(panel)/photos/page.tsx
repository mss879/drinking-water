import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { PhotosManager, type PhotoSlot } from "@/components/admin/website/photos-manager";
import { photoKeys, photoSlots, photos } from "@/content/images";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { photosFrom } from "@/lib/cms/map";

export const metadata: Metadata = { title: "Photos" };

export default async function PhotosAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: row, error } = await supabase.from("cms_settings").select("value").eq("key", "photos").maybeSingle();
  if (error && isMissingSchema(error)) {
    return (
      <>
        <PageHeader title="Photos" />
        <MigrationNotice />
      </>
    );
  }
  if (error) throw new Error(error.message);

  const current = photosFrom(row?.value);
  const slots: PhotoSlot[] = photoKeys
    .map((key) => {
      const photo = current[key];
      const src = typeof photo.src === "string" ? photo.src : photo.src.src;
      return { key, ...photoSlots[key], src, alt: photo.alt, custom: photo.src !== photos[key].src };
    })
    .sort((a, b) => a.number - b.number);

  return (
    <>
      <PageHeader
        title="Photos"
        description="The lifestyle photos around the website, numbered as in your change list. A replacement appears everywhere that photo is used, in black & white like the rest of the site."
      />
      <PhotosManager slots={slots} />
    </>
  );
}
