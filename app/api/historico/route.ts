export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { HistoricoPagamento, ItemMenu } from "@/types"

export async function GET() {
  try {
    const db = getDb()

    // Buscar todos os pagamentos
    const pagamentosQuery = db.prepare(`
      SELECT 
        id, 
        mesa_numero as mesa, 
        data_pagamento as dataPagamento, 
        metodo_pagamento as metodoPagamento,
        total
      FROM 
        historico_pagamentos
      ORDER BY 
        data_pagamento DESC
    `)

    const pagamentos = pagamentosQuery.all() as Omit<HistoricoPagamento, "itens">[]

    // Buscar itens de cada pagamento
    const itensQuery = db.prepare(`
      SELECT 
        id,
        pagamento_id,
        item_id,
        nome,
        preco,
        quantidade
      FROM 
        itens_historico
      WHERE 
        pagamento_id = ?
    `)

    // Montar o resultado completo
    const resultado: HistoricoPagamento[] = pagamentos.map((pagamento) => {
      const itens = itensQuery.all(pagamento.id) as (Omit<ItemMenu, "descricao" | "categoria"> & {
        pagamento_id: string
        item_id: string
      })[]

      return {
        ...pagamento,
        itens: itens.map((item) => ({
          id: item.item_id,
          nome: item.nome,
          descricao: "",
          preco: item.preco,
          categoria: "",
          quantidade: item.quantidade,
        })),
      }
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Erro ao buscar histórico:", error)
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb()
    const { mesa, metodoPagamento, itens, total } = await request.json()

    // Iniciar transação
    db.exec("BEGIN TRANSACTION")

    try {
      // Criar novo registro de pagamento
      const id = `pagamento_${Date.now()}`
      const dataPagamento = new Date().toISOString()

      db.prepare(
        "INSERT INTO historico_pagamentos (id, mesa_numero, data_pagamento, metodo_pagamento, total) VALUES (?, ?, ?, ?, ?)",
      ).run(id, mesa, dataPagamento, metodoPagamento, total)

      // Adicionar itens ao histórico
      const insertItemHistorico = db.prepare(
        "INSERT INTO itens_historico (id, pagamento_id, item_id, nome, preco, quantidade) VALUES (?, ?, ?, ?, ?, ?)",
      )

      for (const item of itens) {
        const itemId = `hist_item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        insertItemHistorico.run(itemId, id, item.id, item.nome, item.preco, item.quantidade)
      }

      // Confirmar transação
      db.exec("COMMIT")

      return NextResponse.json({
        id,
        mesa,
        dataPagamento,
        metodoPagamento,
        total,
        itens,
      })
    } catch (error) {
      // Reverter transação em caso de erro
      db.exec("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error)
    return NextResponse.json({ error: "Erro ao registrar pagamento" }, { status: 500 })
  }
}
