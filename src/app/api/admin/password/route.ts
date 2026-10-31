import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isAdminAuthenticated,
  verifyPassword,
  updateAdminPasswordInDatabase,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { currentPassword, newPassword, email } = body;

  if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters long." },
      { status: 400 },
    );
  }

  // If current password is provided, verify it first for extra security
  if (currentPassword) {
    const isCurrentValid = await verifyPassword(currentPassword, email);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Current password is not correct." },
        { status: 400 },
      );
    }
  }

  const success = await updateAdminPasswordInDatabase(newPassword.trim(), email);
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
