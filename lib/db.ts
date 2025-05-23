import BetterSQLite3 from "better-sqlite3";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "restaurante.db");

let dbInstance: BetterSQLite3.Database | null = null;

export function getDb() {
  if (!dbInstance) {
    const db = new BetterSQLite3(dbPath);
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE IF NOT EXISTS mesas (
        id TEXT PRIMARY KEY,
        numero INTEGER NOT NULL,
        status TEXT NOT NULL,
        hora_abertura TEXT NOT NULL,
        total REAL DEFAULT 0
      );
    `);

    dbInstance = db;
  }

  return dbInstance;
}
