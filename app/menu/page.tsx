import { Header } from "@/components/header"
import { MenuList } from "@/components/menu-list"

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <div className="container mx-auto p-4 pt-8">
        <h1 className="mb-8 text-3xl font-bold text-zinc-100">Menu do Restaurante</h1>
        <MenuList />
      </div>
    </main>
  )
}
