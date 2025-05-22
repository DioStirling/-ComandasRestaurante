"use client"

import { useState } from "react"
import { Check, CreditCard, Receipt, Wallet, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Mesa } from "@/types"
import { formatarData } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface PagamentoDialogProps {
  mesa: Mesa
  isOpen: boolean
  onClose: () => void
  onFinalize: () => void
}

type MetodoPagamento = "dinheiro" | "cartao" | "pix"

export function PagamentoDialog({ mesa, isOpen, onClose, onFinalize }: PagamentoDialogProps) {
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>("cartao")
  const [pagamentoProcessado, setPagamentoProcessado] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handlePagamento = async () => {
    try {
      setIsProcessing(true)

      // Registrar o pagamento no histórico
      const response = await fetch("/api/historico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesa: mesa.numero,
          metodoPagamento,
          total: mesa.total,
          itens: mesa.itens,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao processar pagamento")
      }

      // Simulação de processamento de pagamento
      setPagamentoProcessado(true)

      toast({
        title: "Pagamento realizado",
        description: `Pagamento de R$ ${mesa.total.toFixed(2)} processado com sucesso`,
      })
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetarDialog = () => {
    setPagamentoProcessado(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetarDialog}>
      <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 p-0 text-zinc-100">
        <DialogHeader className="border-b border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Pagamento - Mesa {mesa.numero}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={resetarDialog} className="text-zinc-400 hover:text-zinc-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {!pagamentoProcessado ? (
            <>
              <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <h3 className="mb-2 font-medium">Resumo da Comanda</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Aberta em:</span>
                    <span>{formatarData(mesa.horaAbertura)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Itens:</span>
                    <span>{mesa.itens.length}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-zinc-400">Total:</span>
                    <span>R$ {mesa.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-medium">Método de Pagamento</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className={`flex flex-col items-center justify-center gap-2 border-zinc-800 p-4 hover:bg-zinc-800 ${
                      metodoPagamento === "cartao" ? "border-rose-500 bg-zinc-900" : "bg-zinc-900"
                    }`}
                    onClick={() => setMetodoPagamento("cartao")}
                  >
                    <CreditCard className={metodoPagamento === "cartao" ? "text-rose-500" : "text-zinc-400"} />
                    <span className="text-xs">Cartão</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex flex-col items-center justify-center gap-2 border-zinc-800 p-4 hover:bg-zinc-800 ${
                      metodoPagamento === "pix" ? "border-rose-500 bg-zinc-900" : "bg-zinc-900"
                    }`}
                    onClick={() => setMetodoPagamento("pix")}
                  >
                    <Receipt className={metodoPagamento === "pix" ? "text-rose-500" : "text-zinc-400"} />
                    <span className="text-xs">PIX</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex flex-col items-center justify-center gap-2 border-zinc-800 p-4 hover:bg-zinc-800 ${
                      metodoPagamento === "dinheiro" ? "border-rose-500 bg-zinc-900" : "bg-zinc-900"
                    }`}
                    onClick={() => setMetodoPagamento("dinheiro")}
                  >
                    <Wallet className={metodoPagamento === "dinheiro" ? "text-rose-500" : "text-zinc-400"} />
                    <span className="text-xs">Dinheiro</span>
                  </Button>
                </div>
              </div>

              <Button
                className="w-full bg-rose-600 hover:bg-rose-700"
                onClick={handlePagamento}
                disabled={isProcessing}
              >
                {isProcessing ? "Processando..." : "Finalizar Pagamento"}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/30 text-emerald-500">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-medium">Pagamento Concluído</h3>
              <p className="mb-6 text-zinc-400">O pagamento foi processado com sucesso!</p>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={onFinalize}>
                Fechar Comanda
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
