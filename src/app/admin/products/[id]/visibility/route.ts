import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setProductHidden } from "@/lib/product-visibility";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({ hidden: z.boolean() });

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid product" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  try {
    await setProductHidden(id, parsed.data.hidden);
    return NextResponse.json({ ok: true, hidden: parsed.data.hidden });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update visibility." },
      { status: 500 },
    );
  }
}
