import { Mesas } from "@/components/mesas"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <div className="container mx-auto p-4 pt-8">
        <h1 className="mb-8 text-3xl font-bold text-zinc-100">Sistema de Comandas</h1>
        <Mesas />
      </div>
    </main>
  )
}
