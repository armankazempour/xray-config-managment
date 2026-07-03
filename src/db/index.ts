import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __dbPool?: Pool;
  __db?: ReturnType<typeof drizzle>;
};

function getPool(): Pool {
  if (globalForDb.__dbPool) {
    return globalForDb.__dbPool;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__dbPool = pool;
  }

  return pool;
}

function getDb() {
  if (globalForDb.__db) {
    return globalForDb.__db;
  }

  const db = drizzle(getPool());

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__db = db;
  }

  return db;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const realDb = getDb();
    const value = realDb[prop as keyof typeof realDb];
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const realPool = getPool();
    const value = realPool[prop as keyof typeof realPool];
    if (typeof value === "function") {
      return value.bind(realPool);
    }
    return value;
  },
});
