"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuCard } from "@/components/menu-card"
import type { ItemMenu } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export function MenuList() {
  const [cardapio, setCardapio] = useState<Record<string, ItemMenu[]>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Carregar cardápio ao iniciar
  useEffect(() => {
    carregarCardapio()
  }, [])

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

  // Filtrar itens com base no termo de pesquisa
  const filtrarItens = (categoria: string) => {
    return (
      cardapio[categoria]?.filter(
        (item) =>
          item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || []
    )
  }

  const categorias = Object.keys(cardapio)

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
        <Input
          placeholder="Buscar item..."
          className="border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 placeholder:text-zinc-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">Carregando cardápio...</p>
        </div>
      ) : categorias.length > 0 ? (
        <Tabs defaultValue={categorias[0]} className="w-full">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-md border border-zinc-800 bg-zinc-900 p-1">
            {categorias.map((categoria) => (
              <TabsTrigger
                key={categoria}
                value={categoria}
                className="rounded-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
              >
                {categoria}
              </TabsTrigger>
            ))}
          </TabsList>

          {categorias.map((categoria) => (
            <TabsContent key={categoria} value={categoria} className="mt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtrarItens(categoria).map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>

              {filtrarItens(categoria).length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <p className="text-zinc-400">Nenhum item encontrado para "{searchTerm}"</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">Nenhuma categoria encontrada</p>
        </div>
      )}
    </div>
  )
}
