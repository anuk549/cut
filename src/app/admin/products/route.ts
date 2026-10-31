import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadProductImages, validateProductImages } from "@/lib/product-upload";
import { z } from "zod";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const price = Number(form.get("price"));
  const stock = Number(form.get("stock") ?? 0);
  const premium = form.get("premium") === "true";
  const discount = Number(form.get("discount") ?? 0);
  const files = form.getAll("images").filter((value): value is File => value instanceof File);

  const schema = z.object({
    name: z.string().min(1).max(120),
    price: z.number().finite().nonnegative(),
    stock: z.number().int().nonnegative(),
    discount: z.number().min(0).max(100),
  });
  const parsed = schema.safeParse({ name, price, stock, discount });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const fileError = validateProductImages(files);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const uploaded = await uploadProductImages(supabase, files);
  if (uploaded.error) {
    return NextResponse.json({ error: uploaded.error }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      premium,
      discount: parsed.data.discount,
      image_urls: uploaded.urls,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, product: data });
}
