import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setProductHidden } from "@/lib/product-visibility";
import {
  MAX_PRODUCT_IMAGES,
  productImagePath,
  uploadProductImages,
  validateProductImages,
} from "@/lib/product-upload";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const productSchema = z.object({
  name: z.string().min(1).max(120),
  price: z.number().finite().nonnegative(),
  stock: z.number().int().nonnegative(),
  discount: z.number().min(0).max(100),
});

function parseProductForm(form: FormData) {
  return productSchema.safeParse({
    name: String(form.get("name") ?? "").trim(),
    price: Number(form.get("price")),
    stock: Number(form.get("stock") ?? 0),
    discount: Number(form.get("discount") ?? 0),
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid product" }, { status: 400 });
  }

  const form = await req.formData();
  const parsed = parseProductForm(form);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const description = String(form.get("description") ?? "").trim();
  const premium = form.get("premium") === "true";
  const files = form.getAll("images").filter((value): value is File => value instanceof File);
  const fileError = validateProductImages(files);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error: fetchError } = await supabase
    .from("products")
    .select("image_urls")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  const currentImages = ((data as { image_urls: string[] | null }).image_urls ?? []).filter(
    (url): url is string => typeof url === "string",
  );
  const keepField = form.get("keepImages");
  let keepImages = currentImages;

  if (keepField !== null) {
    try {
      const requested = JSON.parse(String(keepField));
      if (!Array.isArray(requested)) throw new Error("invalid");
      keepImages = currentImages.filter((url) => requested.includes(url));
    } catch {
      return NextResponse.json({ error: "invalid image selection" }, { status: 400 });
    }
  }

  if (files.length > 0 && keepImages.length + files.length > MAX_PRODUCT_IMAGES) {
    return NextResponse.json(
      { error: `A product can have up to ${MAX_PRODUCT_IMAGES} images.` },
      { status: 400 },
    );
  }

  const uploaded = await uploadProductImages(supabase, files);
  if (uploaded.error) {
    return NextResponse.json({ error: uploaded.error }, { status: 500 });
  }

  const { data: product, error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      premium,
      discount: parsed.data.discount,
      image_urls: [...keepImages, ...uploaded.urls],
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const orphaned = uploaded.urls
      .map(productImagePath)
      .filter((path): path is string => Boolean(path));
    if (orphaned.length > 0) {
      await supabase.storage.from("products").remove(orphaned);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const removedImages = currentImages.filter((url) => !keepImages.includes(url));
  const removedPaths = removedImages
    .map(productImagePath)
    .filter((path): path is string => Boolean(path));
  if (removedPaths.length > 0) {
    await supabase.storage.from("products").remove(removedPaths);
  }

  return NextResponse.json({ ok: true, product });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid product" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("products").select("image_urls").eq("id", id).maybeSingle();
  if (!data) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "This piece is linked to an order and cannot be deleted. Set stock to 0 instead." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const images = ((data as { image_urls: string[] | null }).image_urls ?? []).filter(
    (url): url is string => typeof url === "string",
  );
  const paths = images.map(productImagePath).filter((path): path is string => Boolean(path));
  if (paths.length > 0) {
    await supabase.storage.from("products").remove(paths);
  }
  await setProductHidden(id, false).catch(() => {});

  return NextResponse.json({ ok: true });
}
