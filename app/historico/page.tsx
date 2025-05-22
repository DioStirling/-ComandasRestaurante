import { Header } from "@/components/header"
import { HistoricoPagamentos } from "@/components/historico-pagamentos"

export default function HistoricoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <div className="container mx-auto p-4 pt-8">
        <h1 className="mb-8 text-3xl font-bold text-zinc-100">Histórico de Pagamentos</h1>
        <HistoricoPagamentos />
      </div>
    </main>
  )
}
