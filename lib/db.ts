// Garante execução no servidor
export const dynamic = "force-dynamic";

import BetterSQLite3 from "better-sqlite3";
import path from "path";
import fs from "fs";

// Importa corretamente o tipo
import type { Database } from "better-sqlite3";
const DatabaseClass = BetterSQLite3;

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "restaurante.db");

export function initializeDatabase(): Database {
  if (typeof window !== "undefined") {
    throw new Error("Este código deve ser executado apenas no servidor");
  }

  const db = new DatabaseClass(dbPath);
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS itens_menu (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      categoria_id TEXT NOT NULL,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    );
    CREATE TABLE IF NOT EXISTS mesas (
      id TEXT PRIMARY KEY,
      numero INTEGER NOT NULL,
      status TEXT NOT NULL,
      hora_abertura TEXT NOT NULL,
      total REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS itens_comanda (
      id TEXT PRIMARY KEY,
      mesa_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      FOREIGN KEY (mesa_id) REFERENCES mesas(id),
      FOREIGN KEY (item_id) REFERENCES itens_menu(id)
    );
    CREATE TABLE IF NOT EXISTS historico_pagamentos (
      id TEXT PRIMARY KEY,
      mesa_numero INTEGER NOT NULL,
      data_pagamento TEXT NOT NULL,
      metodo_pagamento TEXT NOT NULL,
      total REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS itens_historico (
      id TEXT PRIMARY KEY,
      pagamento_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      preco REAL NOT NULL,
      quantidade INTEGER NOT NULL,
      FOREIGN KEY (pagamento_id) REFERENCES historico_pagamentos(id)
    );
  `);

  const categoriasCount = db.prepare("SELECT COUNT(*) as count FROM categorias").get() as { count: number };
  if (categoriasCount.count === 0) {
    const categorias = [
      { id: "cat1", nome: "Entradas" },
      { id: "cat2", nome: "Pratos Principais" },
      { id: "cat3", nome: "Bebidas" },
      { id: "cat4", nome: "Sobremesas" },
    ];
    const insertCategoria = db.prepare("INSERT INTO categorias (id, nome) VALUES (?, ?)");
    categorias.forEach((cat) => insertCategoria.run(cat.id, cat.nome));

    const itensMenu = [
      { id: "e1", nome: "Bruschetta", descricao: "Pão italiano com tomate, manjericão e azeite", preco: 18.9, categoria_id: "cat1" },
      { id: "e2", nome: "Carpaccio", descricao: "Finas fatias de carne crua com molho especial", preco: 32.9, categoria_id: "cat1" },
      { id: "e3", nome: "Camarão Empanado", descricao: "Camarões empanados com molho tártaro", preco: 42.9, categoria_id: "cat1" },
      { id: "p1", nome: "Filé Mignon ao Molho Madeira", descricao: "Filé mignon grelhado com molho madeira e batatas", preco: 68.9, categoria_id: "cat2" },
      { id: "p2", nome: "Risoto de Camarão", descricao: "Arroz arbóreo com camarões e ervas finas", preco: 72.9, categoria_id: "cat2" },
      { id: "p3", nome: "Salmão Grelhado", descricao: "Filé de salmão grelhado com legumes", preco: 64.9, categoria_id: "cat2" },
      { id: "p4", nome: "Fettuccine Alfredo", descricao: "Massa fresca com molho cremoso de queijo", preco: 48.9, categoria_id: "cat2" },
      { id: "b1", nome: "Água Mineral", descricao: "Sem gás ou com gás (500ml)", preco: 6.9, categoria_id: "cat3" },
      { id: "b2", nome: "Refrigerante", descricao: "Lata (350ml)", preco: 7.9, categoria_id: "cat3" },
      { id: "b3", nome: "Suco Natural", descricao: "Laranja, limão, abacaxi ou maracujá", preco: 12.9, categoria_id: "cat3" },
      { id: "b4", nome: "Taça de Vinho", descricao: "Tinto ou branco (150ml)", preco: 24.9, categoria_id: "cat3" },
      { id: "s1", nome: "Pudim de Leite", descricao: "Pudim tradicional com calda de caramelo", preco: 16.9, categoria_id: "cat4" },
      { id: "s2", nome: "Petit Gateau", descricao: "Bolo quente de chocolate com sorvete de creme", preco: 22.9, categoria_id: "cat4" },
      { id: "s3", nome: "Cheesecake", descricao: "Torta de queijo com calda de frutas vermelhas", preco: 19.9, categoria_id: "cat4" },
    ];

    const insertItem = db.prepare("INSERT INTO itens_menu (id, nome, descricao, preco, categoria_id) VALUES (?, ?, ?, ?, ?)");
    itensMenu.forEach((item) => insertItem.run(item.id, item.nome, item.descricao, item.preco, item.categoria_id));

    const historicoExemplo = [
      {
        id: "h1",
        mesa_numero: 1,
        data_pagamento: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        metodo_pagamento: "cartao",
        total: 127.8,
        itens: [
          { id: "hi1", item_id: "p1", nome: "Filé Mignon ao Molho Madeira", preco: 68.9, quantidade: 1 },
          { id: "hi2", item_id: "b2", nome: "Refrigerante", preco: 7.9, quantidade: 2 },
          { id: "hi3", item_id: "s1", nome: "Pudim de Leite", preco: 16.9, quantidade: 2 },
        ],
      },
      {
        id: "h2",
        mesa_numero: 3,
        data_pagamento: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        metodo_pagamento: "pix",
        total: 85.8,
        itens: [
          { id: "hi4", item_id: "p2", nome: "Risoto de Camarão", preco: 72.9, quantidade: 1 },
          { id: "hi5", item_id: "b1", nome: "Água Mineral", preco: 6.9, quantidade: 1 },
          { id: "hi6", item_id: "e1", nome: "Bruschetta", preco: 18.9, quantidade: 1 },
        ],
      },
    ];

    const insertPagamento = db.prepare("INSERT INTO historico_pagamentos (id, mesa_numero, data_pagamento, metodo_pagamento, total) VALUES (?, ?, ?, ?, ?)");
    const insertItemHistorico = db.prepare("INSERT INTO itens_historico (id, pagamento_id, item_id, nome, preco, quantidade) VALUES (?, ?, ?, ?, ?, ?)");

    historicoExemplo.forEach((pagamento) => {
      insertPagamento.run(
        pagamento.id,
        pagamento.mesa_numero,
        pagamento.data_pagamento,
        pagamento.metodo_pagamento,
        pagamento.total
      );

      pagamento.itens.forEach((item) => {
        insertItemHistorico.run(item.id, pagamento.id, item.item_id, item.nome, item.preco, item.quantidade);
      });
    });
  }

  return db;
}

let dbInstance: Database | null = null;

export function getDb(): Database {
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
