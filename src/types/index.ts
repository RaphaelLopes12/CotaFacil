export interface Cotacao {
  id: string
  produto: string
  marca: string
  categoria: string
  fornecedor: string
  valor: number
  observacoes: string
  criadoEm: string
  atualizadoEm: string
  favorito?: boolean
  validadeAte?: string
}

export type CotacaoInput = Omit<Cotacao, 'id' | 'criadoEm' | 'atualizadoEm'>

export interface Filtros {
  busca: string
  categoria: string
  fornecedor: string
  ordenacao: 'recente' | 'antigo' | 'menor-preco' | 'maior-preco' | 'nome'
  apenasValidos?: boolean
  apenasFavoritos?: boolean
}

export type Tela = 'lista' | 'comparador' | 'relatorio'
