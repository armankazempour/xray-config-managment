import { NextResponse } from "next/server";
import { seedAdmin } from "@/lib/seed";

export async function GET() {
  try {
    await seedAdmin();
    return NextResponse.json({ message: "Initialized" });
  } catch {
    return NextResponse.json({ error: "Init failed" }, { status: 500 });
  }
}
