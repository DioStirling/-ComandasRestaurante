import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ItemMenu } from "@/types"

interface MenuCardProps {
  item: ItemMenu
}

export function MenuCard({ item }: MenuCardProps) {
  // Função para gerar uma imagem de placeholder baseada na categoria
  const getImageUrl = (categoria: string) => {
    const categoriaLower = categoria.toLowerCase()
    if (categoriaLower.includes("entrada")) return "/placeholder.svg?height=200&width=300"
    if (categoriaLower.includes("principal")) return "/placeholder.svg?height=200&width=300"
    if (categoriaLower.includes("bebida")) return "/placeholder.svg?height=200&width=300"
    if (categoriaLower.includes("sobremesa")) return "/placeholder.svg?height=200&width=300"
    return "/placeholder.svg?height=200&width=300"
  }

  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-700">
      <div className="relative h-48 w-full">
        <Image
          src={getImageUrl(item.categoria) || "/placeholder.svg"}
          alt={item.nome}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">{item.nome}</h3>
          <Badge className="bg-rose-600 hover:bg-rose-700">R$ {item.preco.toFixed(2)}</Badge>
        </div>
        <p className="text-sm text-zinc-400">{item.descricao}</p>
      </CardContent>
    </Card>
  )
}
