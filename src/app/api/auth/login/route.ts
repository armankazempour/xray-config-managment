import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { verifyPassword, signToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const admin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);

    if (admin.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!verifyPassword(password, admin[0].passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ id: admin[0].id, username: admin[0].username, role: "admin" });

    return NextResponse.json({ token, username: admin[0].username });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
