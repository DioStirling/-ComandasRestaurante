import Link from "next/link"
import { UtensilsCrossed } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-rose-500" />
          <span className="text-xl font-bold">Comandas Dios</span>
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-zinc-400 transition-colors hover:text-zinc-100">
                Comandas
              </Link>
            </li>
            <li>
              <Link href="/menu" className="text-zinc-400 transition-colors hover:text-zinc-100">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/historico" className="text-zinc-400 transition-colors hover:text-zinc-100">
                Histórico
              </Link>
            </li>
          </ul>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
