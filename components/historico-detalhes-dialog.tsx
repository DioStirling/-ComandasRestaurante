"use client"

import { Receipt, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatarData, formatarMoeda } from "@/lib/utils"
import type { HistoricoPagamento } from "@/types"

interface HistoricoDetalhesDialogProps {
  pagamento: HistoricoPagamento
  isOpen: boolean
  onClose: () => void
}

export function HistoricoDetalhesDialog({ pagamento, isOpen, onClose }: HistoricoDetalhesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 p-0 text-zinc-100">
        <DialogHeader className="border-b border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Detalhes do Pagamento</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">Mesa {pagamento.mesa}</h3>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-900/30 text-rose-500">
                <span className="text-xs font-medium">{pagamento.mesa}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Data:</span>
                <span>{formatarData(pagamento.dataPagamento)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Método:</span>
                <span className="capitalize">
                  {pagamento.metodoPagamento === "cartao"
                    ? "Cartão"
                    : pagamento.metodoPagamento === "pix"
                      ? "PIX"
                      : "Dinheiro"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Itens:</span>
                <span>{pagamento.itens.length}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-zinc-400">Total:</span>
                <span>{formatarMoeda(pagamento.total)}</span>
              </div>
            </div>
          </div>

          <h3 className="mb-3 font-medium">Itens Consumidos</h3>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {pagamento.itens.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                >
                  <div>
                    <h4 className="font-medium">{item.nome}</h4>
                    <p className="text-xs text-zinc-400">{formatarMoeda(item.preco)} cada</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatarMoeda(item.preco * item.quantidade)}</p>
                    <p className="text-xs text-zinc-400">Qtd: {item.quantidade}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-6 flex justify-end">
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Receipt className="mr-2 h-4 w-4" />
              Imprimir Recibo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
