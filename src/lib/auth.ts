import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "xray-repo-manager-jwt-secret-key-2024";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: { id: string; username: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): { id: string; username: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
  } catch {
    return null;
  }
}

export function getAuthFromHeaders(headers: Headers): { id: string; username: string; role: string } | null {
  const authHeader = headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
