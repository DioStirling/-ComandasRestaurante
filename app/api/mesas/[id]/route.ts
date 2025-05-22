export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { Mesa, ItemMenu } from "@/types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb()
    const { id } = params

    // Buscar a mesa
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
    `)

    const mesa = mesaQuery.get(id) as Omit<Mesa, "itens"> | undefined

    if (!mesa) {
      return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 })
    }

    // Buscar itens da mesa
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
    `)

    const itens = itensQuery.all(id) as (Omit<ItemMenu, "id"> & { id: string; mesa_id: string; item_id: string })[]

    // Montar o resultado completo
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
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Erro ao buscar mesa:", error)
    return NextResponse.json({ error: "Erro ao buscar mesa" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb()
    const { id } = params
    const { status, itens } = await request.json()

    // Verificar se a mesa existe
    const mesaExistente = db.prepare("SELECT id FROM mesas WHERE id = ?").get(id) as { id: string } | undefined

    if (!mesaExistente) {
      return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 })
    }

    // Iniciar transação
    db.exec("BEGIN TRANSACTION")

    try {
      // Atualizar status da mesa se fornecido
      if (status) {
        db.prepare("UPDATE mesas SET status = ? WHERE id = ?").run(status, id)
      }

      // Atualizar itens se fornecidos
      if (itens) {
        // Remover itens existentes
        db.prepare("DELETE FROM itens_comanda WHERE mesa_id = ?").run(id)

        // Adicionar novos itens
        const insertItem = db.prepare(
          "INSERT INTO itens_comanda (id, mesa_id, item_id, quantidade) VALUES (?, ?, ?, ?)",
        )

        let total = 0

        for (const item of itens) {
          const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          insertItem.run(itemId, id, item.id, item.quantidade)

          // Calcular o total
          total += item.preco * item.quantidade
        }

        // Atualizar o total da mesa
        db.prepare("UPDATE mesas SET total = ? WHERE id = ?").run(total, id)
      }

      // Confirmar transação
      db.exec("COMMIT")

      // Buscar a mesa atualizada
      return await GET(request, { params })
    } catch (error) {
      // Reverter transação em caso de erro
      db.exec("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Erro ao atualizar mesa:", error)
    return NextResponse.json({ error: "Erro ao atualizar mesa" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb()
    const { id } = params

    // Verificar se a mesa existe
    const mesaExistente = db.prepare("SELECT id FROM mesas WHERE id = ?").get(id) as { id: string } | undefined

    if (!mesaExistente) {
      return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 })
    }

    // Iniciar transação
    db.exec("BEGIN TRANSACTION")

    try {
      // Remover itens da mesa
      db.prepare("DELETE FROM itens_comanda WHERE mesa_id = ?").run(id)

      // Atualizar status da mesa para fechada (não excluímos para manter histórico)
      db.prepare("UPDATE mesas SET status = 'fechada' WHERE id = ?").run(id)

      // Confirmar transação
      db.exec("COMMIT")

      return NextResponse.json({ success: true })
    } catch (error) {
      // Reverter transação em caso de erro
      db.exec("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Erro ao remover mesa:", error)
    return NextResponse.json({ error: "Erro ao remover mesa" }, { status: 500 })
  }
}
