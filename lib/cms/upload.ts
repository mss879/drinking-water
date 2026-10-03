"use client";

import { SITE_MEDIA_BUCKET, type MediaFolder } from "@/lib/cms/media";
import { createClient } from "@/lib/supabase/browser";

const MAX_INPUT = 25 * 1024 * 1024;

/** The longest side each kind of image is kept at: big enough for a sharp hero, small enough to load fast. */
const maxSide: Record<MediaFolder, number> = { products: 1600, parts: 900, logos: 800, photos: 2400 };

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Shrinks an image to the folder's size (photos also go black & white) and re-encodes it as WebP (transparency kept),
 * or JPEG where WebP isn't supported.
 */
async function prepare(file: File, folder: MediaFolder) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide[folder] / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  // Lifestyle photos are black & white across the site, so the only colour on a page is the brand's.
  if (folder === "photos" && context) {
    const image = context.getImageData(0, 0, width, height);
    const px = image.data;
    for (let i = 0; i < px.length; i += 4) {
      const luma = Math.round(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]);
      px[i] = px[i + 1] = px[i + 2] = luma;
    }
    context.putImageData(image, 0, 0);
  }
  const webp = await toBlob(canvas, "image/webp", 0.88);
  if (webp?.type === "image/webp") return { blob: webp, width, height, ext: "webp" };
  const fallback = await toBlob(canvas, folder === "logos" ? "image/png" : "image/jpeg", 0.9);
  if (!fallback) throw new Error("This image couldn’t be processed. Try a JPG or PNG.");
  return { blob: fallback, width, height, ext: folder === "logos" ? "png" : "jpg" };
}

/**
 * Uploads an image from the admin's Website section to Supabase Storage, under the folder for its kind (and the
 * owner's id, so deleting a product can clear its photos), with a fresh random name so a replaced image never shows a
 * cached old one. Returns its public address and size.
 */
export async function uploadSiteImage(file: File, folder: MediaFolder, owner?: string) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    throw new Error("Choose a JPG, PNG, WebP or AVIF image.");
  }
  if (file.size > MAX_INPUT) throw new Error("That image is over 25 MB. Choose a smaller one.");
  const { blob, width, height, ext } = await prepare(file, folder);
  const path = [folder, owner, `${crypto.randomUUID()}.${ext}`].filter(Boolean).join("/");
  const supabase = createClient();
  const { error } = await supabase.storage.from(SITE_MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || `image/${ext}`,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message.includes("exceeded") ? "That image is still too large after resizing (8 MB limit)." : error.message);
  const { data } = supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, width, height };
}
