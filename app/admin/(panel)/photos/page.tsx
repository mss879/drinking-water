import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { PhotosManager, type PhotoSlot } from "@/components/admin/website/photos-manager";
import { photoKeys, photoSlots, photos } from "@/content/images";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { photosFrom } from "@/lib/cms/map";

export const metadata: Metadata = { title: "Website images" };

export default async function PhotosAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: row, error } = await supabase.from("cms_settings").select("value").eq("key", "photos").maybeSingle();
  if (error && isMissingSchema(error)) {
    return (
      <>
        <PageHeader title="Website images" />
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
        title="Website images"
        description="Every photo on the website outside the products, parts, client logos and blog: the image at the top of each page and the lifestyle photos. A replacement appears everywhere that image is used, in black & white like the rest of the site."
      />
      <PhotosManager
        groups={[
          {
            title: "Page headers",
            description: "The image behind the title at the top of each page. The left side sits behind the text, so photos with the subject on the right work best.",
            slots: slots.filter((slot) => slot.group === "page"),
          },
          {
            title: "Lifestyle photos",
            description: "Numbered as in your change list. Some also open a page: the list under each photo says where.",
            slots: slots.filter((slot) => slot.group === "lifestyle"),
          },
        ]}
      />
    </>
  );
}
