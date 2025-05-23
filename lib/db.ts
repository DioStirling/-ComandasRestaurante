import BetterSQLite3 from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// CORREÇÃO: usar /tmp no Vercel
const dataDir = "/tmp";

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "restaurante.db");

let dbInstance: BetterSqliteDatabase | null = null;

export function initializeDatabase(): BetterSqliteDatabase {
  if (typeof window !== "undefined") {
    throw new Error("Este código deve ser executado apenas no servidor");
  }

  const db = new BetterSQLite3(dbPath);
  db.pragma("foreign_keys = ON");

  // [Resto da criação de tabelas e dados omitido para foco]

  return db;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
