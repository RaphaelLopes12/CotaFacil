import type { Cotacao } from '../types/index'
import { CartaoCotacao } from './CartaoCotacao'
import { PackageSearch } from 'lucide-react'

interface ListaCotacoesProps {
  cotacoes: Cotacao[]
  onEditar: (cotacao: Cotacao) => void
  onExcluir: (id: string) => void
  onDuplicar: (cotacao: Cotacao) => void
  onRepetir: (cotacao: Cotacao) => void
  onToggleFavorito: (id: string) => void
}

export function ListaCotacoes({ cotacoes, onEditar, onExcluir, onDuplicar, onRepetir, onToggleFavorito }: ListaCotacoesProps) {
  if (cotacoes.length === 0) {
    return (
      <div className="lista-vazia">
        <PackageSearch size={48} />
        <h3>Nenhuma cotação encontrada</h3>
        <p>Adicione sua primeira cotação clicando no botão abaixo</p>
      </div>
    )
  }

  return (
    <div className="lista-cotacoes">
      {cotacoes.map(cotacao => (
        <CartaoCotacao
          key={cotacao.id}
          cotacao={cotacao}
          onEditar={() => onEditar(cotacao)}
          onExcluir={() => onExcluir(cotacao.id)}
          onDuplicar={() => onDuplicar(cotacao)}
          onRepetir={() => onRepetir(cotacao)}
          onToggleFavorito={() => onToggleFavorito(cotacao.id)}
        />
      ))}
    </div>
  )
}
