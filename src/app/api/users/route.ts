import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthFromHeaders, hashPassword } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db.select().from(users);

    const now = new Date();
    const enriched = allUsers.map((u) => {
      let status = u.status;
      if (status === "active" && new Date(u.expirationDate) < now) {
        status = "expired";
      }
      const remaining = Math.max(
        0,
        Math.ceil((new Date(u.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      return { ...u, status, remainingDays: status === "suspended" ? 0 : remaining };
    });

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, subscriptionDays } = body;

    if (!username || !password || !subscriptionDays) {
      return NextResponse.json({ error: "Username, password, and subscription days required" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const days = parseInt(subscriptionDays, 10);
    if (isNaN(days) || days < 1) {
      return NextResponse.json({ error: "Invalid subscription days" }, { status: 400 });
    }

    const now = new Date();
    const expiration = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const token = crypto.randomBytes(32).toString("hex");

    const newUser = {
      id: uuidv4(),
      username,
      passwordHash: hashPassword(password),
      token,
      subscriptionDays: days,
      startDate: now,
      expirationDate: expiration,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(newUser);

    return NextResponse.json({ ...newUser, passwordHash: undefined });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
