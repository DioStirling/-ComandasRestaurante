"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ComandaDialog } from "@/components/comanda-dialog"
import { useToast } from "@/components/ui/use-toast"
import type { Mesa } from "@/types"

export function Mesas() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Carregar mesas ao iniciar
  useEffect(() => {
    carregarMesas()
  }, [])

  const carregarMesas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/mesas")

      if (!response.ok) {
        throw new Error("Erro ao carregar mesas")
      }

      const data = await response.json()
      setMesas(data)
    } catch (error) {
      console.error("Erro ao carregar mesas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mesas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const adicionarMesa = async () => {
    try {
      const novoNumero = mesas.length > 0 ? Math.max(...mesas.map((m) => m.numero)) + 1 : 1

      const response = await fetch("/api/mesas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numero: novoNumero }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar mesa")
      }

      const novaMesa = await response.json()
      setMesas([...mesas, novaMesa])
      setMesaSelecionada(novaMesa)
      setIsDialogOpen(true)

      toast({
        title: "Mesa criada",
        description: `Mesa ${novaMesa.numero} foi aberta com sucesso`,
      })
    } catch (error) {
      console.error("Erro ao adicionar mesa:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a mesa",
        variant: "destructive",
      })
    }
  }

  const abrirComanda = (mesa: Mesa) => {
    setMesaSelecionada(mesa)
    setIsDialogOpen(true)
  }

  const fecharDialog = () => {
    setIsDialogOpen(false)
    setMesaSelecionada(null)
    carregarMesas() // Recarregar mesas para obter dados atualizados
  }

  const atualizarMesa = async (mesaAtualizada: Mesa) => {
    try {
      const response = await fetch(`/api/mesas/${mesaAtualizada.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: mesaAtualizada.status,
          itens: mesaAtualizada.itens,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar mesa")
      }

      const mesaAtualizadaResponse = await response.json()

      // Atualizar a mesa na lista
      setMesas(mesas.map((m) => (m.id === mesaAtualizadaResponse.id ? mesaAtualizadaResponse : m)))

      // Se a mesa selecionada for a que foi atualizada, atualizar também
      if (mesaSelecionada && mesaSelecionada.id === mesaAtualizadaResponse.id) {
        setMesaSelecionada(mesaAtualizadaResponse)
      }
    } catch (error) {
      console.error("Erro ao atualizar mesa:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a mesa",
        variant: "destructive",
      })
    }
  }

  const removerMesa = async (id: string) => {
    try {
      const response = await fetch(`/api/mesas/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao remover mesa")
      }

      // Remover a mesa da lista
      setMesas(mesas.filter((m) => m.id !== id))

      toast({
        title: "Mesa fechada",
        description: "A mesa foi fechada com sucesso",
      })
    } catch (error) {
      console.error("Erro ao remover mesa:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fechar a mesa",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-zinc-100">Mesas</h2>
        <Button onClick={adicionarMesa} className="bg-rose-600 hover:bg-rose-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Mesa
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">Carregando mesas...</p>
        </div>
      ) : mesas.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="mb-4 text-zinc-400">Nenhuma mesa aberta no momento</p>
          <Button onClick={adicionarMesa} className="bg-rose-600 hover:bg-rose-700">
            <Plus className="mr-2 h-4 w-4" />
            Abrir Mesa
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {mesas.map((mesa) => (
            <Card
              key={mesa.id}
              className="cursor-pointer border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-700 hover:bg-zinc-800/80"
              onClick={() => abrirComanda(mesa)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Mesa {mesa.numero}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      mesa.status === "aberta" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"
                    }`}
                  >
                    {mesa.status === "aberta" ? "Aberta" : "Aguardando Pagamento"}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Itens:</span>
                    <span>{mesa.itens.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total:</span>
                    <span>R$ {mesa.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mesaSelecionada && (
        <ComandaDialog
          mesa={mesaSelecionada}
          isOpen={isDialogOpen}
          onClose={fecharDialog}
          onUpdate={atualizarMesa}
          onRemove={removerMesa}
        />
      )}
    </div>
  )
}
