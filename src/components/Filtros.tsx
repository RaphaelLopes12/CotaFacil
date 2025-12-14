import { Search, SlidersHorizontal, Star, CheckCircle, Store } from 'lucide-react'
import type { Filtros as FiltrosType } from '../types/index'

interface FiltrosProps {
  filtros: FiltrosType
  categorias: string[]
  fornecedores: string[]
  onChange: (filtros: FiltrosType) => void
}

export function Filtros({ filtros, categorias, fornecedores, onChange }: FiltrosProps) {
  return (
    <div className="filtros">
      <div className="filtros-busca">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar produto, marca ou fornecedor..."
          value={filtros.busca}
          onChange={e => onChange({ ...filtros, busca: e.target.value })}
        />
      </div>

      <div className="filtros-selects">
        <div className="filtro-select">
          <SlidersHorizontal size={16} />
          <select
            value={filtros.categoria}
            onChange={e => onChange({ ...filtros, categoria: e.target.value })}
          >
            <option value="">Todas categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filtro-select">
          <Store size={16} />
          <select
            value={filtros.fornecedor}
            onChange={e => onChange({ ...filtros, fornecedor: e.target.value })}
          >
            <option value="">Todos fornecedores</option>
            {fornecedores.map(forn => (
              <option key={forn} value={forn}>{forn}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filtros-linha-ordenacao">
        <select
          value={filtros.ordenacao}
          onChange={e =>
            onChange({
              ...filtros,
              ordenacao: e.target.value as FiltrosType['ordenacao']
            })
          }
          className="filtro-ordenacao"
        >
          <option value="recente">Mais recentes</option>
          <option value="antigo">Mais antigos</option>
          <option value="menor-preco">Menor preço</option>
          <option value="maior-preco">Maior preço</option>
          <option value="nome">Nome A-Z</option>
        </select>
      </div>

      <div className="filtros-toggle">
        <button
          className={`filtro-toggle-btn ${filtros.apenasFavoritos ? 'ativo' : ''}`}
          onClick={() => onChange({ ...filtros, apenasFavoritos: !filtros.apenasFavoritos })}
        >
          <Star size={16} fill={filtros.apenasFavoritos ? 'currentColor' : 'none'} />
          Favoritos
        </button>
        <button
          className={`filtro-toggle-btn ${filtros.apenasValidos ? 'ativo' : ''}`}
          onClick={() => onChange({ ...filtros, apenasValidos: !filtros.apenasValidos })}
        >
          <CheckCircle size={16} />
          Válidos
        </button>
      </div>
    </div>
  )
}
