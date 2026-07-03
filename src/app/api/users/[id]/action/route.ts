import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, days } = body;

    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();

    switch (action) {
      case "suspend":
        await db.update(users).set({ status: "suspended", updatedAt: now }).where(eq(users.id, id));
        return NextResponse.json({ message: "User suspended" });

      case "reactivate": {
        const newDays = days ? parseInt(days, 10) : existing[0].subscriptionDays;
        const newExpiration = new Date(now.getTime() + newDays * 24 * 60 * 60 * 1000);
        await db
          .update(users)
          .set({
            status: "active",
            startDate: now,
            subscriptionDays: newDays,
            expirationDate: newExpiration,
            updatedAt: now,
          })
          .where(eq(users.id, id));
        return NextResponse.json({ message: "User reactivated" });
      }

      case "extend": {
        if (!days || parseInt(days, 10) < 1) {
          return NextResponse.json({ error: "Days required for extension" }, { status: 400 });
        }
        const extDays = parseInt(days, 10);
        const currentExpiration = new Date(existing[0].expirationDate);
        const base = currentExpiration > now ? currentExpiration : now;
        const newExp = new Date(base.getTime() + extDays * 24 * 60 * 60 * 1000);
        await db
          .update(users)
          .set({
            subscriptionDays: existing[0].subscriptionDays + extDays,
            expirationDate: newExp,
            status: "active",
            updatedAt: now,
          })
          .where(eq(users.id, id));
        return NextResponse.json({ message: `Subscription extended by ${extDays} days` });
      }

      case "expire":
        await db
          .update(users)
          .set({ expirationDate: now, status: "expired", updatedAt: now })
          .where(eq(users.id, id));
        return NextResponse.json({ message: "Subscription expired immediately" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
