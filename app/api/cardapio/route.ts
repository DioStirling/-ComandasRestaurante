export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { ItemMenu } from "@/types"

export async function GET() {
  try {
    const db = getDb()

    // Buscar todas as categorias
    const categorias = db.prepare("SELECT * FROM categorias ORDER BY nome").all() as { id: string; nome: string }[]

    // Buscar todos os itens do menu
    const itensQuery = db.prepare(`
      SELECT 
        i.id, 
        i.nome, 
        i.descricao, 
        i.preco, 
        c.nome as categoria,
        c.id as categoria_id
      FROM 
        itens_menu i
      JOIN 
        categorias c ON i.categoria_id = c.id
      ORDER BY 
        c.nome, i.nome
    `)

    const itens = itensQuery.all() as (Omit<ItemMenu, "quantidade"> & { categoria_id: string })[]

    // Organizar itens por categoria
    const cardapio: Record<string, ItemMenu[]> = {}

    categorias.forEach((categoria) => {
      cardapio[categoria.nome] = []
    })

    itens.forEach((item) => {
      if (!cardapio[item.categoria]) {
        cardapio[item.categoria] = []
      }

      cardapio[item.categoria].push({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        preco: item.preco,
        categoria: item.categoria,
        quantidade: 0,
      })
    })

    return NextResponse.json(cardapio)
  } catch (error) {
    console.error("Erro ao buscar cardápio:", error)
    return NextResponse.json({ error: "Erro ao buscar cardápio" }, { status: 500 })
  }
}
