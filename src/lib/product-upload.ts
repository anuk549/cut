import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;

type Supabase = ReturnType<typeof createSupabaseAdminClient>;

export function productImagePath(url: string): string | null {
  const marker = "/storage/v1/object/public/products/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

export function validateProductImages(files: File[]): string | null {
  if (files.length > MAX_PRODUCT_IMAGES) {
    return `Add up to ${MAX_PRODUCT_IMAGES} images at a time.`;
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return "Every upload must be an image file.";
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      return "Each image must be 8 MB or smaller.";
    }
  }
  return null;
}

export async function uploadProductImages(
  supabase: Supabase,
  files: File[],
): Promise<{ urls: string[]; error?: string }> {
  await supabase.storage.createBucket("products", { public: true }).catch(() => {});
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    const safeName =
      file.name
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "image";
    const path = `${Date.now()}-${index}-${safeName}`;
    const { error } = await supabase.storage.from("products").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) return { urls, error: error.message };
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { urls };
}
