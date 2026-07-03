import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, repoFiles } from "@/db/schema";
import { getAuthFromHeaders } from "@/lib/auth";
import { count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db.select().from(users);
    const now = new Date();

    let active = 0;
    let expired = 0;
    let suspended = 0;

    for (const u of allUsers) {
      if (u.status === "suspended") {
        suspended++;
      } else if (u.status === "expired" || new Date(u.expirationDate) < now) {
        expired++;
      } else {
        active++;
      }
    }

    const filesResult = await db.select({ value: count() }).from(repoFiles);
    const totalFiles = filesResult[0]?.value || 0;

    return NextResponse.json({
      totalUsers: allUsers.length,
      activeUsers: active,
      expiredUsers: expired,
      suspendedUsers: suspended,
      totalFiles,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
