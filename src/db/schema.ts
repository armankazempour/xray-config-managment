import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  token: text("token").notNull().unique(),
  subscriptionDays: integer("subscription_days").notNull().default(30),
  startDate: timestamp("start_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  status: text("status").notNull().default("active"), // active, expired, suspended
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const repoFiles = pgTable("repo_files", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
