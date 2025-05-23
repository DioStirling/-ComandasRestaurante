import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// Instância global do banco
let dbInstance: Database | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "restaurante.db");

  // Abre conexão com SQLite usando sqlite3 como driver
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec("PRAGMA foreign_keys = ON");

  return dbInstance;
}
