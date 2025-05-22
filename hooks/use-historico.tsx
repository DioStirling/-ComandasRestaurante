"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { HistoricoPagamento } from "@/types"

interface HistoricoContextType {
  historico: HistoricoPagamento[]
  adicionarAoHistorico: (pagamento: HistoricoPagamento) => void
}

const HistoricoContext = createContext<HistoricoContextType | undefined>(undefined)

export function HistoricoProvider({ children }: { children: ReactNode }) {
  const [historico, setHistorico] = useState<HistoricoPagamento[]>([])

  // Carregar histórico do localStorage ao iniciar
  useEffect(() => {
    const historicoSalvo = localStorage.getItem("historicoPagamentos")
    if (historicoSalvo) {
      try {
        setHistorico(JSON.parse(historicoSalvo))
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      }
    } else {
      // Dados de exemplo para demonstração
      const dadosExemplo: HistoricoPagamento[] = [
        {
          id: "1",
          mesa: 1,
          dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
          metodoPagamento: "cartao",
          total: 127.8,
          itens: [
            {
              id: "p1",
              nome: "Filé Mignon ao Molho Madeira",
              descricao: "",
              preco: 68.9,
              categoria: "Pratos Principais",
              quantidade: 1,
            },
            { id: "b2", nome: "Refrigerante", descricao: "", preco: 7.9, categoria: "Bebidas", quantidade: 2 },
            { id: "s1", nome: "Pudim de Leite", descricao: "", preco: 16.9, categoria: "Sobremesas", quantidade: 2 },
          ],
        },
        {
          id: "2",
          mesa: 3,
          dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 horas atrás
          metodoPagamento: "pix",
          total: 85.8,
          itens: [
            {
              id: "p2",
              nome: "Risoto de Camarão",
              descricao: "",
              preco: 72.9,
              categoria: "Pratos Principais",
              quantidade: 1,
            },
            { id: "b1", nome: "Água Mineral", descricao: "", preco: 6.9, categoria: "Bebidas", quantidade: 1 },
            { id: "e1", nome: "Bruschetta", descricao: "", preco: 18.9, categoria: "Entradas", quantidade: 1 },
          ],
        },
        {
          id: "3",
          mesa: 5,
          dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
          metodoPagamento: "dinheiro",
          total: 94.7,
          itens: [
            {
              id: "p3",
              nome: "Salmão Grelhado",
              descricao: "",
              preco: 64.9,
              categoria: "Pratos Principais",
              quantidade: 1,
            },
            { id: "b3", nome: "Suco Natural", descricao: "", preco: 12.9, categoria: "Bebidas", quantidade: 1 },
            { id: "s2", nome: "Petit Gateau", descricao: "", preco: 22.9, categoria: "Sobremesas", quantidade: 1 },
          ],
        },
        {
          id: "4",
          mesa: 2,
          dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dias atrás
          metodoPagamento: "cartao",
          total: 156.7,
          itens: [
            {
              id: "p1",
              nome: "Filé Mignon ao Molho Madeira",
              descricao: "",
              preco: 68.9,
              categoria: "Pratos Principais",
              quantidade: 2,
            },
            { id: "b4", nome: "Taça de Vinho", descricao: "", preco: 24.9, categoria: "Bebidas", quantidade: 2 },
            { id: "s3", nome: "Cheesecake", descricao: "", preco: 19.9, categoria: "Sobremesas", quantidade: 1 },
          ],
        },
        {
          id: "5",
          mesa: 4,
          dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 dias atrás
          metodoPagamento: "pix",
          total: 112.7,
          itens: [
            {
              id: "p4",
              nome: "Fettuccine Alfredo",
              descricao: "",
              preco: 48.9,
              categoria: "Pratos Principais",
              quantidade: 1,
            },
            { id: "e2", nome: "Carpaccio", descricao: "", preco: 32.9, categoria: "Entradas", quantidade: 1 },
            { id: "b3", nome: "Suco Natural", descricao: "", preco: 12.9, categoria: "Bebidas", quantidade: 2 },
            { id: "s1", nome: "Pudim de Leite", descricao: "", preco: 16.9, categoria: "Sobremesas", quantidade: 1 },
          ],
        },
      ]
      setHistorico(dadosExemplo)
      localStorage.setItem("historicoPagamentos", JSON.stringify(dadosExemplo))
    }
  }, [])

  // Salvar histórico no localStorage quando atualizado
  useEffect(() => {
    if (historico.length > 0) {
      localStorage.setItem("historicoPagamentos", JSON.stringify(historico))
    }
  }, [historico])

  const adicionarAoHistorico = (pagamento: HistoricoPagamento) => {
    const novoHistorico = [pagamento, ...historico]
    setHistorico(novoHistorico)
  }

  return <HistoricoContext.Provider value={{ historico, adicionarAoHistorico }}>{children}</HistoricoContext.Provider>
}

export function useHistorico() {
  const context = useContext(HistoricoContext)
  if (context === undefined) {
    throw new Error("useHistorico deve ser usado dentro de um HistoricoProvider")
  }
  return context
}
