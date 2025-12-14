import { useState } from 'react'
import { TrendingDown, TrendingUp, Store, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import type { Cotacao } from '../types/index'
import { formatarMoeda, formatarDataCurta } from '../utils/formatters'

interface ComparadorProps {
  cotacoesPorProduto: Record<string, Cotacao[]>
}

export function Comparador({ cotacoesPorProduto }: ComparadorProps) {
  const [expandido, setExpandido] = useState<string | null>(null)

  const produtos = Object.entries(cotacoesPorProduto)
    .filter(([, cotacoes]) => cotacoes.length > 1)
    .sort((a, b) => b[1].length - a[1].length)

  if (produtos.length === 0) {
    return (
      <div className="comparador-vazio">
        <TrendingDown size={48} />
        <h3>Nenhuma comparação disponível</h3>
        <p>Adicione cotações do mesmo produto em fornecedores diferentes para comparar preços</p>
      </div>
    )
  }

  return (
    <div className="comparador">
      <div className="comparador-header">
        <h2>Comparador de Preços</h2>
        <p>{produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'} com múltiplas cotações</p>
      </div>

      <div className="comparador-lista">
        {produtos.map(([produtoKey, cotacoes]) => {
          const isExpandido = expandido === produtoKey
          const menorPreco = cotacoes[0]
          const maiorPreco = cotacoes[cotacoes.length - 1]
          const economia = maiorPreco.valor - menorPreco.valor
          const economiaPercent = ((economia / maiorPreco.valor) * 100).toFixed(0)

          return (
            <div key={produtoKey} className="comparador-item">
              <button
                className="comparador-item-header"
                onClick={() => setExpandido(isExpandido ? null : produtoKey)}
              >
                <div className="comparador-item-info">
                  <h3>{cotacoes[0].produto}</h3>
                  <div className="comparador-item-resumo">
                    <span className="preco-menor">
                      <TrendingDown size={14} />
                      {formatarMoeda(menorPreco.valor)}
                    </span>
                    <span className="preco-separador">até</span>
                    <span className="preco-maior">
                      <TrendingUp size={14} />
                      {formatarMoeda(maiorPreco.valor)}
                    </span>
                  </div>
                </div>
                <div className="comparador-item-economia">
                  <span className="economia-valor">Economize {formatarMoeda(economia)}</span>
                  <span className="economia-percent">-{economiaPercent}%</span>
                  {isExpandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {isExpandido && (
                <div className="comparador-item-detalhes">
                  {cotacoes.map((cotacao, index) => (
                    <div
                      key={cotacao.id}
                      className={`comparador-cotacao ${index === 0 ? 'melhor' : ''}`}
                    >
                      {index === 0 && <span className="badge-melhor">Melhor preço</span>}
                      <div className="comparador-cotacao-info">
                        <span className="comparador-cotacao-valor">
                          {formatarMoeda(cotacao.valor)}
                        </span>
                        {cotacao.marca && (
                          <span className="comparador-cotacao-marca">{cotacao.marca}</span>
                        )}
                      </div>
                      <div className="comparador-cotacao-detalhes">
                        {cotacao.fornecedor && (
                          <span>
                            <Store size={14} />
                            {cotacao.fornecedor}
                          </span>
                        )}
                        <span>
                          <Calendar size={14} />
                          {formatarDataCurta(cotacao.criadoEm)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
