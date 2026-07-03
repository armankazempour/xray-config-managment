import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthFromHeaders, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const u = user[0];
    const now = new Date();
    let status = u.status;
    if (status === "active" && new Date(u.expirationDate) < now) {
      status = "expired";
    }
    const remaining = Math.max(
      0,
      Math.ceil((new Date(u.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return NextResponse.json({ ...u, status, remainingDays: status === "suspended" ? 0 : remaining, passwordHash: undefined });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { username, password, subscriptionDays, status } = body;

    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (username) updates.username = username;
    if (password) updates.passwordHash = hashPassword(password);
    if (status) updates.status = status;
    if (subscriptionDays) {
      const days = parseInt(subscriptionDays, 10);
      if (!isNaN(days) && days > 0) {
        updates.subscriptionDays = days;
        updates.expirationDate = new Date(
          new Date(existing[0].startDate).getTime() + days * 24 * 60 * 60 * 1000
        );
      }
    }

    await db.update(users).set(updates).where(eq(users.id, id));

    return NextResponse.json({ message: "User updated successfully" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ message: "User deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
