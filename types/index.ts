export interface ItemMenu {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  quantidade: number
}

export interface Mesa {
  id: string
  numero: number
  status: "aberta" | "pagamento" | "fechada"
  itens: ItemMenu[]
  total: number
  horaAbertura: string
}

export interface HistoricoPagamento {
  id: string
  mesa: number
  dataPagamento: string
  metodoPagamento: string
  total: number
  itens: ItemMenu[]
}
