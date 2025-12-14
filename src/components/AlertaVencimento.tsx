import { AlertTriangle, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Cotacao } from '../types/index'

interface AlertaVencimentoProps {
  cotacoes: Cotacao[]
  onVerCotacao: (cotacao: Cotacao) => void
}

export function AlertaVencimento({ cotacoes, onVerCotacao }: AlertaVencimentoProps) {
  const [fechado, setFechado] = useState(false)
  const [expandido, setExpandido] = useState(false)

  const agora = new Date()
  const em7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const vencendo = cotacoes.filter(c => {
    if (!c.validadeAte) return false
    const validade = new Date(c.validadeAte)
    return validade >= agora && validade <= em7Dias
  }).sort((a, b) =>
    new Date(a.validadeAte!).getTime() - new Date(b.validadeAte!).getTime()
  )

  if (fechado || vencendo.length === 0) return null

  const diasRestantes = (data: string) => {
    const diff = Math.ceil((new Date(data).getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Vence hoje'
    if (diff === 1) return 'Vence amanhã'
    return `Vence em ${diff} dias`
  }

  return (
    <div className="alerta-vencimento">
      <div className="alerta-vencimento-header">
        <div className="alerta-vencimento-info" onClick={() => setExpandido(!expandido)}>
          <AlertTriangle size={18} />
          <span>
            <strong>{vencendo.length}</strong> {vencendo.length === 1 ? 'cotação vence' : 'cotações vencem'} essa semana
          </span>
          <ChevronRight
            size={18}
            className={`alerta-chevron ${expandido ? 'expandido' : ''}`}
          />
        </div>
        <button className="alerta-fechar" onClick={() => setFechado(true)}>
          <X size={16} />
        </button>
      </div>

      {expandido && (
        <div className="alerta-vencimento-lista">
          {vencendo.slice(0, 5).map(cotacao => (
            <button
              key={cotacao.id}
              className="alerta-vencimento-item"
              onClick={() => onVerCotacao(cotacao)}
            >
              <div className="alerta-vencimento-item-info">
                <span className="alerta-vencimento-produto">{cotacao.produto}</span>
                {cotacao.fornecedor && (
                  <span className="alerta-vencimento-fornecedor">{cotacao.fornecedor}</span>
                )}
              </div>
              <span className="alerta-vencimento-dias">
                {diasRestantes(cotacao.validadeAte!)}
              </span>
            </button>
          ))}
          {vencendo.length > 5 && (
            <div className="alerta-vencimento-mais">
              +{vencendo.length - 5} {vencendo.length - 5 === 1 ? 'outra' : 'outras'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
