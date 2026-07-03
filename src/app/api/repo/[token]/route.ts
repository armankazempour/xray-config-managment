import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, repoFiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

const REPO_DIR = path.join(process.cwd(), "repository");

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    
    // Find user by token
    const user = await db.select().from(users).where(eq(users.token, token)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "Access denied: Invalid token" }, { status: 403 });
    }

    const u = user[0];

    // Check if suspended
    if (u.status === "suspended") {
      return NextResponse.json({ error: "Access denied: Account suspended" }, { status: 403 });
    }

    // Check if expired
    const now = new Date();
    if (u.status === "expired" || new Date(u.expirationDate) < now) {
      // Auto-update status
      if (u.status !== "expired") {
        await db.update(users).set({ status: "expired" }).where(eq(users.id, u.id));
      }
      return NextResponse.json({ error: "Access denied: Subscription expired" }, { status: 403 });
    }

    // Get optional filename query param
    const url = new URL(request.url);
    const filename = url.searchParams.get("file");

    if (filename) {
      // Download specific file
      const file = await db
        .select()
        .from(repoFiles)
        .where(eq(repoFiles.originalName, filename))
        .limit(1);

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
    }

    // List all available files
    const files = await db.select({
      id: repoFiles.id,
      originalName: repoFiles.originalName,
      size: repoFiles.size,
      uploadedAt: repoFiles.uploadedAt,
    }).from(repoFiles);

    const remaining = Math.max(
      0,
      Math.ceil((new Date(u.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return NextResponse.json({
      username: u.username,
      remainingDays: remaining,
      expirationDate: u.expirationDate,
      files: files.map((f) => ({
        name: f.originalName,
        size: f.size,
        uploadedAt: f.uploadedAt,
        downloadUrl: `/api/repo/${token}?file=${encodeURIComponent(f.originalName)}`,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
