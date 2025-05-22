"use client"

import { useState, useEffect } from "react"
import { Calendar, Search, FileDown, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatarData, formatarMoeda } from "@/lib/utils"
import { HistoricoDetalhesDialog } from "@/components/historico-detalhes-dialog"
import type { HistoricoPagamento } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export function HistoricoPagamentos() {
  const [historico, setHistorico] = useState<HistoricoPagamento[]>([])
  const [filteredHistorico, setFilteredHistorico] = useState<HistoricoPagamento[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [periodoFiltro, setPeriodoFiltro] = useState("todos")
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<HistoricoPagamento | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Carregar histórico ao iniciar
  useEffect(() => {
    carregarHistorico()
  }, [])

  const carregarHistorico = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/historico")

      if (!response.ok) {
        throw new Error("Erro ao carregar histórico")
      }

      const data = await response.json()
      setHistorico(data)
      setFilteredHistorico(data)
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de pagamentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar histórico com base nos critérios
  useEffect(() => {
    let resultado = [...historico]

    // Filtrar por termo de busca
    if (searchTerm) {
      resultado = resultado.filter(
        (item) =>
          item.mesa.toString().includes(searchTerm) ||
          item.metodoPagamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.total.toString().includes(searchTerm),
      )
    }

    // Filtrar por período
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (periodoFiltro === "hoje") {
      resultado = resultado.filter((item) => {
        const dataPagamento = new Date(item.dataPagamento)
        return dataPagamento >= hoje
      })
    } else if (periodoFiltro === "semana") {
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - 7)
      resultado = resultado.filter((item) => {
        const dataPagamento = new Date(item.dataPagamento)
        return dataPagamento >= inicioSemana
      })
    } else if (periodoFiltro === "mes") {
      const inicioMes = new Date(hoje)
      inicioMes.setMonth(hoje.getMonth() - 1)
      resultado = resultado.filter((item) => {
        const dataPagamento = new Date(item.dataPagamento)
        return dataPagamento >= inicioMes
      })
    }

    // Ordenar por data (mais recente primeiro)
    resultado.sort((a, b) => new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime())

    setFilteredHistorico(resultado)
  }, [historico, searchTerm, periodoFiltro])

  const verDetalhes = (pagamento: HistoricoPagamento) => {
    setPagamentoSelecionado(pagamento)
    setIsDialogOpen(true)
  }

  const calcularTotalPeriodo = () => {
    return filteredHistorico.reduce((total, item) => total + item.total, 0)
  }

  // Agrupar por dia para visualização
  const agruparPorDia = () => {
    const grupos: { [key: string]: HistoricoPagamento[] } = {}

    filteredHistorico.forEach((pagamento) => {
      const data = new Date(pagamento.dataPagamento)
      const dataFormatada = data.toISOString().split("T")[0]

      if (!grupos[dataFormatada]) {
        grupos[dataFormatada] = []
      }

      grupos[dataFormatada].push(pagamento)
    })

    return Object.entries(grupos).map(([data, pagamentos]) => ({
      data,
      pagamentos,
      total: pagamentos.reduce((sum, p) => sum + p.total, 0),
    }))
  }

  const gruposDiarios = agruparPorDia()

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
            <Input
               placeholder="Buscar por mesa, método de pagamento..."
               className="border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 placeholder:text-zinc-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-[180px] border-zinc-800 bg-zinc-900 text-zinc-100">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mês</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <p className="text-zinc-400">Carregando histórico...</p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                <h3 className="text-sm font-medium text-zinc-400">Total no período</h3>
                <p className="mt-2 text-2xl font-bold">{formatarMoeda(calcularTotalPeriodo())}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                <h3 className="text-sm font-medium text-zinc-400">Comandas fechadas</h3>
                <p className="mt-2 text-2xl font-bold">{filteredHistorico.length}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                <h3 className="text-sm font-medium text-zinc-400">Ticket médio</h3>
                <p className="mt-2 text-2xl font-bold">
                  {filteredHistorico.length > 0
                    ? formatarMoeda(calcularTotalPeriodo() / filteredHistorico.length)
                    : formatarMoeda(0)}
                </p>
              </div>
            </div>

            <Tabs defaultValue="lista" className="w-full">
              <TabsList className="mb-4 h-auto w-full justify-start rounded-md border border-zinc-800 bg-zinc-950 p-1">
                <TabsTrigger
                  value="lista"
                  className="rounded-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                >
                  Lista
                </TabsTrigger>
                <TabsTrigger
                  value="diario"
                  className="rounded-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                >
                  Agrupado por dia
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lista" className="mt-0">
                <ScrollArea className="h-[500px] pr-4">
                  {filteredHistorico.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center">
                      <p className="text-zinc-400">Nenhum pagamento encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredHistorico.map((pagamento) => (
                        <Card
                          key={pagamento.id}
                          className="cursor-pointer border-zinc-800 bg-zinc-950 transition-all hover:border-zinc-700"
                          onClick={() => verDetalhes(pagamento)}
                        >
                          <CardContent className="flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-900/30 text-rose-500">
                                <span className="text-sm font-medium">{pagamento.mesa}</span>
                              </div>
                              <div>
                                <h3 className="font-medium">Mesa {pagamento.mesa}</h3>
                                <div className="flex items-center gap-1 text-xs text-zinc-400">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatarData(pagamento.dataPagamento)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 md:justify-end">
                              <Badge
                                className={`${
                                  pagamento.metodoPagamento === "cartao"
                                    ? "bg-blue-900/30 text-blue-400"
                                    : pagamento.metodoPagamento === "pix"
                                      ? "bg-green-900/30 text-green-400"
                                      : "bg-amber-900/30 text-amber-400"
                                }`}
                              >
                                {pagamento.metodoPagamento === "cartao"
                                  ? "Cartão"
                                  : pagamento.metodoPagamento === "pix"
                                    ? "PIX"
                                    : "Dinheiro"}
                              </Badge>
                              <span className="font-medium">{formatarMoeda(pagamento.total)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="diario" className="mt-0">
                <ScrollArea className="h-[500px] pr-4">
                  {gruposDiarios.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center">
                      <p className="text-zinc-400">Nenhum pagamento encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {gruposDiarios.map((grupo) => (
                        <div key={grupo.data} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-zinc-300">
                              {new Date(grupo.data).toLocaleDateString("pt-BR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </h3>
                            <Badge className="bg-rose-900/30 text-rose-400">Total: {formatarMoeda(grupo.total)}</Badge>
                          </div>

                          <div className="space-y-2">
                            {grupo.pagamentos.map((pagamento) => (
                              <Card
                                key={pagamento.id}
                                className="cursor-pointer border-zinc-800 bg-zinc-950 transition-all hover:border-zinc-700"
                                onClick={() => verDetalhes(pagamento)}
                              >
                                <CardContent className="flex flex-col justify-between gap-3 p-3 md:flex-row md:items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                                      <span className="text-xs font-medium">{pagamento.mesa}</span>
                                    </div>
                                    <span className="text-sm font-medium">Mesa {pagamento.mesa}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 md:justify-end">
                                    <Badge
                                      className={`${
                                        pagamento.metodoPagamento === "cartao"
                                          ? "bg-blue-900/30 text-blue-400"
                                          : pagamento.metodoPagamento === "pix"
                                            ? "bg-green-900/30 text-green-400"
                                            : "bg-amber-900/30 text-amber-400"
                                      }`}
                                    >
                                      {pagamento.metodoPagamento === "cartao"
                                        ? "Cartão"
                                        : pagamento.metodoPagamento === "pix"
                                          ? "PIX"
                                          : "Dinheiro"}
                                    </Badge>
                                    <span className="font-medium">{formatarMoeda(pagamento.total)}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {pagamentoSelecionado && (
        <HistoricoDetalhesDialog
          pagamento={pagamentoSelecionado}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  )
}
