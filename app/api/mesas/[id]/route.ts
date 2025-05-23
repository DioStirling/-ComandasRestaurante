export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import type { Mesa, ItemMenu } from "@/types";

// Tipagem correta para o contexto da rota dinâmica
interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const db = getDb();
    const { id } = context.params;

    const mesaQuery = db.prepare(`
      SELECT 
        id, 
        numero, 
        status, 
        hora_abertura as horaAbertura,
        total
      FROM 
        mesas
      WHERE
        id = ?
    `);

    const mesa = mesaQuery.get(id) as Omit<Mesa, "itens"> | undefined;

    if (!mesa) {
      return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
    }

    const itensQuery = db.prepare(`
      SELECT 
        ic.id,
        ic.mesa_id,
        ic.quantidade,
        im.id as item_id,
        im.nome,
        im.descricao,
        im.preco,
        c.nome as categoria
      FROM 
        itens_comanda ic
      JOIN 
        itens_menu im ON ic.item_id = im.id
      JOIN
        categorias c ON im.categoria_id = c.id
      WHERE 
        ic.mesa_id = ?
    `);

    const itens = itensQuery.all(id) as (Omit<ItemMenu, "id"> & {
      id: string;
      mesa_id: string;
      item_id: string;
    })[];

    const resultado: Mesa = {
      ...mesa,
      itens: itens.map((item) => ({
        id: item.item_id,
        nome: item.nome,
        descricao: item.descricao,
        preco: item.preco,
        categoria: item.categoria,
        quantidade: item.quantidade,
      })),
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar mesa:", error);
    return NextResponse.json({ error: "Erro ao buscar mesa" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const db = getDb();
    const { id } = context.params;
    const { status, itens } = await request.json();

    const mesaExistente = db
      .prepare("SELECT id FROM mesas WHERE id = ?")
      .get(id) as { id: string } | undefined;

    if (!mesaExistente) {
      return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION");

    try {
      if (status) {
        db.prepare("UPDATE mesas SET status = ? WHERE id = ?").run(status, id);
      }

      if (itens) {
        db.prepare("DELETE FROM itens_comanda WHERE mesa_id = ?").run(id);

        const insertItem = db.prepare(
          "INSERT INTO itens_comanda (id, mesa_id, item_id, quantidade) VALUES (?, ?, ?, ?)"
        );

        let total = 0;

        for (const item of itens) {
          const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          insertItem.run(itemId, id, item.id, item.quantidade);
          total += item.preco * item.quantidade;
        }

        db.prepare("UPDATE mesas SET total = ? WHERE id = ?").run(total, id);
      }

      db.exec("COMMIT");

      return await GET(request, context);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Erro ao atualizar mesa:", error);
    return NextResponse.json({ error: "Erro ao atualizar mesa" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const db = getDb();
    const { id } = context.params;

    const mesaExistente = db
      .prepare("SELECT id FROM mesas WHERE id = ?")
      .get(id) as { id: string } | undefined;

    if (!mesaExistente) {
      return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION");

    try {
      db.prepare("DELETE FROM itens_comanda WHERE mesa_id = ?").run(id);
      db.prepare("UPDATE mesas SET status = 'fechada' WHERE id = ?").run(id);

      db.exec("COMMIT");

      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Erro ao remover mesa:", error);
    return NextResponse.json({ error: "Erro ao remover mesa" }, { status: 500 });
  }
}
