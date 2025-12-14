import * as XLSX from 'xlsx'
import type { Cotacao } from '../types/index'

const STORAGE_KEY = 'cotafacil_cotacoes'

export function getCotacoes(): Cotacao[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveCotacoes(cotacoes: Cotacao[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cotacoes))
}

export function exportarDados(): string {
  const cotacoes = getCotacoes()
  return JSON.stringify(cotacoes, null, 2)
}

export function exportarExcel(): void {
  const cotacoes = getCotacoes()

  const dados = cotacoes.map(c => ({
    'Produto': c.produto,
    'Marca': c.marca || '',
    'Categoria': c.categoria || '',
    'Fornecedor': c.fornecedor || '',
    'Valor (R$)': c.valor,
    'Observações': c.observacoes || '',
    'Favorito': c.favorito ? 'Sim' : 'Não',
    'Válido até': c.validadeAte ? new Date(c.validadeAte).toLocaleDateString('pt-BR') : '',
    'Data cadastro': new Date(c.criadoEm).toLocaleDateString('pt-BR')
  }))

  const ws = XLSX.utils.json_to_sheet(dados)

  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 25 }, // Produto
    { wch: 15 }, // Marca
    { wch: 12 }, // Categoria
    { wch: 15 }, // Fornecedor
    { wch: 12 }, // Valor
    { wch: 30 }, // Observações
    { wch: 8 },  // Favorito
    { wch: 12 }, // Válido até
    { wch: 12 }, // Data cadastro
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Cotações')

  const dataAtual = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `cotafacil-${dataAtual}.xlsx`)
}

export function importarDados(json: string): Cotacao[] | null {
  try {
    const data = JSON.parse(json)
    if (Array.isArray(data)) {
      saveCotacoes(data)
      return data
    }
    return null
  } catch {
    return null
  }
}
