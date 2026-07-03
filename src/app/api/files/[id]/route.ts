import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { repoFiles } from "@/db/schema";
import { getAuthFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

const REPO_DIR = path.join(process.cwd(), "repository");

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const file = await db.select().from(repoFiles).where(eq(repoFiles.id, id)).limit(1);

    if (file.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(REPO_DIR, file[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.delete(repoFiles).where(eq(repoFiles.id, id));

    return NextResponse.json({ message: "File deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const file = await db.select().from(repoFiles).where(eq(repoFiles.id, id)).limit(1);

    if (file.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(REPO_DIR, file[0].filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file[0].mimeType,
        "Content-Disposition": `attachment; filename="${file[0].originalName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
