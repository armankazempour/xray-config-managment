import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { getAuthFromHeaders, verifyPassword, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    const admin = await db.select().from(admins).where(eq(admins.id, auth.id)).limit(1);
    if (admin.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, admin[0].passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    await db
      .update(admins)
      .set({ passwordHash: hashPassword(newPassword) })
      .where(eq(admins.id, auth.id));

    return NextResponse.json({ message: "Password changed successfully" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
