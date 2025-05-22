import type { ItemMenu } from "@/types"

type Cardapio = {
  [categoria: string]: ItemMenu[]
}

export const cardapio: Cardapio = {
  Entradas: [
    {
      id: "e1",
      nome: "Bruschetta",
      descricao: "Pão italiano com tomate, manjericão e azeite",
      preco: 18.9,
      categoria: "Entradas",
      quantidade: 0,
    },
    {
      id: "e2",
      nome: "Carpaccio",
      descricao: "Finas fatias de carne crua com molho especial",
      preco: 32.9,
      categoria: "Entradas",
      quantidade: 0,
    },
    {
      id: "e3",
      nome: "Camarão Empanado",
      descricao: "Camarões empanados com molho tártaro",
      preco: 42.9,
      categoria: "Entradas",
      quantidade: 0,
    },
  ],
  "Pratos Principais": [
    {
      id: "p1",
      nome: "Filé Mignon ao Molho Madeira",
      descricao: "Filé mignon grelhado com molho madeira e batatas",
      preco: 68.9,
      categoria: "Pratos Principais",
      quantidade: 0,
    },
    {
      id: "p2",
      nome: "Risoto de Camarão",
      descricao: "Arroz arbóreo com camarões e ervas finas",
      preco: 72.9,
      categoria: "Pratos Principais",
      quantidade: 0,
    },
    {
      id: "p3",
      nome: "Salmão Grelhado",
      descricao: "Filé de salmão grelhado com legumes",
      preco: 64.9,
      categoria: "Pratos Principais",
      quantidade: 0,
    },
    {
      id: "p4",
      nome: "Fettuccine Alfredo",
      descricao: "Massa fresca com molho cremoso de queijo",
      preco: 48.9,
      categoria: "Pratos Principais",
      quantidade: 0,
    },
  ],
  Bebidas: [
    {
      id: "b1",
      nome: "Água Mineral",
      descricao: "Sem gás ou com gás (500ml)",
      preco: 6.9,
      categoria: "Bebidas",
      quantidade: 0,
    },
    {
      id: "b2",
      nome: "Refrigerante",
      descricao: "Lata (350ml)",
      preco: 7.9,
      categoria: "Bebidas",
      quantidade: 0,
    },
    {
      id: "b3",
      nome: "Suco Natural",
      descricao: "Laranja, limão, abacaxi ou maracujá",
      preco: 12.9,
      categoria: "Bebidas",
      quantidade: 0,
    },
    {
      id: "b4",
      nome: "Taça de Vinho",
      descricao: "Tinto ou branco (150ml)",
      preco: 24.9,
      categoria: "Bebidas",
      quantidade: 0,
    },
  ],
  Sobremesas: [
    {
      id: "s1",
      nome: "Pudim de Leite",
      descricao: "Pudim tradicional com calda de caramelo",
      preco: 16.9,
      categoria: "Sobremesas",
      quantidade: 0,
    },
    {
      id: "s2",
      nome: "Petit Gateau",
      descricao: "Bolo quente de chocolate com sorvete de creme",
      preco: 22.9,
      categoria: "Sobremesas",
      quantidade: 0,
    },
    {
      id: "s3",
      nome: "Cheesecake",
      descricao: "Torta de queijo com calda de frutas vermelhas",
      preco: 19.9,
      categoria: "Sobremesas",
      quantidade: 0,
    },
  ],
}
