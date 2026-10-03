"use client";

import { BLOG_BUCKET } from "@/lib/blog/images";
import { createClient } from "@/lib/supabase/browser";

const MAX_SIDE = 2000;
const MAX_INPUT = 25 * 1024 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Shrinks a photo to 2000px on its longest side and re-encodes it as WebP (JPEG where WebP isn't supported). */
async function prepare(file: File) {
  if (file.type === "image/gif") {
    // Keep animations as they are.
    const bitmap = await createImageBitmap(file);
    return { blob: file as Blob, width: bitmap.width, height: bitmap.height, ext: "gif" };
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const webp = await toBlob(canvas, "image/webp", 0.85);
  if (webp?.type === "image/webp") return { blob: webp, width, height, ext: "webp" };
  const jpeg = await toBlob(canvas, "image/jpeg", 0.88);
  if (!jpeg) throw new Error("This image couldn’t be processed. Try a JPG or PNG.");
  return { blob: jpeg, width, height, ext: "jpg" };
}

/**
 * Uploads an image for a post to Supabase Storage, in a folder named after the post (deleting the post removes it)
 * under a fresh random name (so a replaced image never shows a cached old one). Returns its public URL and size.
 */
export async function uploadBlogImage(file: File, postId: string) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") throw new Error("Choose a JPG, PNG, WebP, AVIF or GIF image.");
  if (file.size > MAX_INPUT) throw new Error("That image is over 25 MB. Choose a smaller one.");
  const { blob, width, height, ext } = await prepare(file);
  const path = `${postId}/${crypto.randomUUID()}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(BLOG_BUCKET).upload(path, blob, {
    contentType: blob.type || `image/${ext}`,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message.includes("exceeded") ? "That image is still too large after resizing (8 MB limit)." : error.message);
  const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, width, height };
}

/** Turns "IMG_2041 kitchen-tap.jpg" into "IMG 2041 kitchen tap" as a starting alt text. */
export function altFromFileName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}
