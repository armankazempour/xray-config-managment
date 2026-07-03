import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { repoFiles } from "@/db/schema";
import { getAuthFromHeaders } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const REPO_DIR = path.join(process.cwd(), "repository");

function ensureRepoDir() {
  if (!fs.existsSync(REPO_DIR)) {
    fs.mkdirSync(REPO_DIR, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = await db.select().from(repoFiles);
    return NextResponse.json(files);
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

    ensureRepoDir();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedExts = [".json", ".txt", ".conf", ".yaml", ".yml", ".toml", ".xml", ".ini", ".cfg", ".log"];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `File type ${ext} not allowed. Allowed: ${allowedExts.join(", ")}` },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const filename = `${id}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(REPO_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    await db.insert(repoFiles).values({
      id,
      filename,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
    });

    return NextResponse.json({ id, filename, originalName: file.name, size: buffer.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
