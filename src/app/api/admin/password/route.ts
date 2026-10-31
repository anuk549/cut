import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  isAdminAuthenticated,
  verifyPassword,
  updateAdminPasswordInDatabase,
  isAllowedAdminEmail,
  ADMIN_DB_EMAIL,
} from "@/lib/admin-auth";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

const changePasswordSchema = z.object({
  currentPassword: z.string().max(200).optional(),
  newPassword: z.string().min(8).max(200),
  email: z.string().email().max(320).optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`admin_password:${getClientKey(req)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const parsed = changePasswordSchema.safeParse({
    currentPassword: typeof input.currentPassword === "string" ? input.currentPassword : undefined,
    newPassword: typeof input.newPassword === "string" ? input.newPassword : "",
    email: typeof input.email === "string" ? input.email : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters long." },
      { status: 400 },
    );
  }

  const targetEmail = (parsed.data.email ?? ADMIN_DB_EMAIL).trim().toLowerCase();
  if (!isAllowedAdminEmail(targetEmail)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const newPassword = parsed.data.newPassword.trim();

  if (currentPasswordProvided(input)) {
    const isCurrentValid = await verifyPassword(
      typeof input.currentPassword === "string" ? input.currentPassword : "",
      targetEmail,
    );
    if (!isCurrentValid) {
      return NextResponse.json({ error: "Current password is not correct." }, { status: 400 });
    }
  }

  const success = await updateAdminPasswordInDatabase(newPassword, targetEmail);
  if (!success) {
    return NextResponse.json(
      { error: "Failed to update password in database. Please check database connection." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Admin password successfully updated in backend database.",
  });
}

function currentPasswordProvided(input: Record<string, unknown>): boolean {
  return typeof input.currentPassword === "string" && input.currentPassword.length > 0;
}
