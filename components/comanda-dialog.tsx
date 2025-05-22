"use client"

import { useState, useEffect } from "react"
import { Clock, Trash2, Plus, Minus, CreditCard, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ItemMenu, Mesa } from "@/types"
import { PagamentoDialog } from "@/components/pagamento-dialog"
import { formatarData } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface ComandaDialogProps {
  mesa: Mesa
  isOpen: boolean
  onClose: () => void
  onUpdate: (mesa: Mesa) => void
  onRemove: (id: string) => void
}

export function ComandaDialog({ mesa, isOpen, onClose, onUpdate, onRemove }: ComandaDialogProps) {
  const [isPagamentoOpen, setIsPagamentoOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("comanda")
  const [cardapio, setCardapio] = useState<Record<string, ItemMenu[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Carregar cardápio ao abrir o diálogo
  useEffect(() => {
    if (isOpen) {
      carregarCardapio()
    }
  }, [isOpen])

  const carregarCardapio = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/cardapio")

      if (!response.ok) {
        throw new Error("Erro ao carregar cardápio")
      }

      const data = await response.json()
      setCardapio(data)
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o cardápio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const adicionarItem = (item: ItemMenu) => {
    const itemExistente = mesa.itens.find((i) => i.id === item.id)

    if (itemExistente) {
      const itensAtualizados = mesa.itens.map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i))
      atualizarComanda(itensAtualizados)
    } else {
      const novoItem = { ...item, quantidade: 1 }
      atualizarComanda([...mesa.itens, novoItem])
    }

    // Forçar atualização imediata da interface
    setActiveTab("comanda")

    // Mostrar feedback visual
    toast({
      title: "Item adicionado",
      description: `${item.nome} adicionado à comanda`,
      duration: 2000,
    })
  }

  const removerItem = (itemId: string) => {
    const itemExistente = mesa.itens.find((i) => i.id === itemId)

    if (itemExistente && itemExistente.quantidade > 1) {
      const itensAtualizados = mesa.itens.map((i) => (i.id === itemId ? { ...i, quantidade: i.quantidade - 1 } : i))
      atualizarComanda(itensAtualizados)
    } else {
      const itensAtualizados = mesa.itens.filter((i) => i.id !== itemId)
      atualizarComanda(itensAtualizados)
    }
  }

  const excluirItem = (itemId: string) => {
    const itensAtualizados = mesa.itens.filter((i) => i.id !== itemId)
    atualizarComanda(itensAtualizados)
  }

  const atualizarComanda = (itens: ItemMenu[]) => {
    const total = itens.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
    onUpdate({ ...mesa, itens, total })
  }

  const finalizarPagamento = () => {
    onRemove(mesa.id)
    setIsPagamentoOpen(false)
    onClose()
  }

  const abrirPagamento = () => {
    onUpdate({ ...mesa, status: "pagamento" })
    setIsPagamentoOpen(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl border-zinc-800 bg-zinc-950 p-0 text-zinc-100">
          <DialogHeader className="border-b border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Mesa {mesa.numero}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2 flex items-center text-sm text-zinc-400">
              <Clock className="mr-1 h-4 w-4" />
              <span>Aberta em {formatarData(mesa.horaAbertura)}</span>
            </div>
          </DialogHeader>

          <Tabs defaultValue="comanda" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-zinc-800">
              <TabsList className="h-auto justify-start rounded-none border-b border-zinc-800 bg-transparent p-0">
                <TabsTrigger
                  value="comanda"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:text-rose-500"
                >
                  Comanda
                </TabsTrigger>
                <TabsTrigger
                  value="cardapio"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:text-rose-500"
                >
                  Cardápio
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="comanda" className="mt-0">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Itens da Comanda</h3>
                  <div className="text-sm font-medium text-zinc-400">
                    Total: <span className="text-zinc-100">R$ {mesa.total.toFixed(2)}</span>
                  </div>
                </div>

                <ScrollArea className="h-[350px] pr-4">
                  {mesa.itens.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-4 text-center">
                      <p className="text-zinc-400">Nenhum item adicionado</p>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("cardapio")}
                        className="mt-2 text-rose-500 hover:text-rose-400"
                      >
                        Adicionar itens do cardápio
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mesa.itens.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{item.nome}</h4>
                            <p className="text-sm text-zinc-400">R$ {item.preco.toFixed(2)} cada</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-md border border-zinc-700 bg-zinc-800">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-r-none text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                                onClick={() => removerItem(item.id)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantidade}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-l-none text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                                onClick={() => adicionarItem(item)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-rose-500"
                              onClick={() => excluirItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => setActiveTab("cardapio")}
                  >
                    Adicionar Itens
                  </Button>
                  <Button
                    className="bg-rose-600 hover:bg-rose-700"
                    onClick={abrirPagamento}
                    disabled={mesa.itens.length === 0}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagamento
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cardapio" className="mt-0">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-medium">Cardápio</h3>

                {isLoading ? (
                  <div className="flex h-[350px] items-center justify-center">
                    <p className="text-zinc-400">Carregando cardápio...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-6">
                      {Object.entries(cardapio).map(([categoria, itens]) => (
                        <div key={categoria} className="space-y-3">
                          <h4 className="font-medium text-zinc-300">{categoria}</h4>
                          <div className="space-y-2">
                            {itens.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                              >
                                <div className="flex-1">
                                  <h5 className="font-medium">{item.nome}</h5>
                                  <p className="text-sm text-zinc-400">{item.descricao}</p>
                                  <p className="mt-1 text-sm font-medium">R$ {item.preco.toFixed(2)}</p>
                                </div>
                                <Button
                                  className="ml-4 bg-zinc-800 hover:bg-zinc-700"
                                  size="sm"
                                  onClick={() => adicionarItem(item)}
                                >
                                  <Plus className="mr-1 h-4 w-4" />
                                  Adicionar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => setActiveTab("comanda")}
                  >
                    Voltar para Comanda
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <PagamentoDialog
        mesa={mesa}
        isOpen={isPagamentoOpen}
        onClose={() => setIsPagamentoOpen(false)}
        onFinalize={finalizarPagamento}
      />
    </>
  )
}
