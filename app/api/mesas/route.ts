export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { Mesa, ItemMenu } from "@/types"

export async function GET() {
  try {
    const db = getDb()

    // Buscar todas as mesas
    const mesasQuery = db.prepare(`
      SELECT 
        id, 
        numero, 
        status, 
        hora_abertura as horaAbertura,
        total
      FROM 
        mesas
      WHERE
        status != 'fechada'
      ORDER BY 
        numero
    `)

    const mesas = mesasQuery.all() as Omit<Mesa, "itens">[]

    // Buscar itens de cada mesa
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

    // Montar o resultado completo
    const resultado: Mesa[] = mesas.map((mesa) => {
      const itens = itensQuery.all(mesa.id) as (Omit<ItemMenu, "id"> & {
        id: string
        mesa_id: string
        item_id: string
      })[]

      return {
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
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Erro ao buscar mesas:", error)
    return NextResponse.json({ error: "Erro ao buscar mesas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb()
    const { numero } = await request.json()

    // Verificar se já existe uma mesa com este número
    const mesaExistente = db.prepare("SELECT id FROM mesas WHERE numero = ? AND status != 'fechada'").get(numero) as
      | { id: string }
      | undefined

    if (mesaExistente) {
      return NextResponse.json({ error: "Já existe uma mesa aberta com este número" }, { status: 400 })
    }

    // Criar nova mesa
    const id = `mesa_${Date.now()}`
    const horaAbertura = new Date().toISOString()

    db.prepare("INSERT INTO mesas (id, numero, status, hora_abertura, total) VALUES (?, ?, ?, ?, ?)").run(
      id,
      numero,
      "aberta",
      horaAbertura,
      0,
    )

    return NextResponse.json({
      id,
      numero,
      status: "aberta",
      horaAbertura,
      total: 0,
      itens: [],
    })
  } catch (error) {
    console.error("Erro ao criar mesa:", error)
    return NextResponse.json({ error: "Erro ao criar mesa" }, { status: 500 })
  }
}
