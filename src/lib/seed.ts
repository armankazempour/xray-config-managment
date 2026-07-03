import { db } from "@/db";
import { admins } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  if (existing.length === 0) {
    await db.insert(admins).values({
      id: uuidv4(),
      username,
      passwordHash: hashPassword(password),
    });
  }
}
